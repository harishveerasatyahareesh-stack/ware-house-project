// Global Reactive State Store for VortexWarehouse OS

import { initialInventory, initialOrders, initialPickers, initialAuditLogs } from './mockData.js';
import { calculateOrderPriority, resolveStockShortage, syncGlobalInventoryAndAllocations, findInventoryItem } from './decisionEngine.js';

class WarehouseStateStore {
  constructor() {
    this.listeners = [];
    this.simSpeed = 1;
    this.simRunning = true;
    this.simTimer = null;

    this.loadState();
  }

  loadState() {
    const savedInv = localStorage.getItem('vortex_inventory');
    const savedOrders = localStorage.getItem('vortex_orders');
    const savedLogs = localStorage.getItem('vortex_audit_logs');
    const savedPickers = localStorage.getItem('vortex_pickers');

    this.inventory = savedInv ? JSON.parse(savedInv) : JSON.parse(JSON.stringify(initialInventory));
    this.orders = savedOrders ? JSON.parse(savedOrders) : JSON.parse(JSON.stringify(initialOrders));
    this.pickers = savedPickers ? JSON.parse(savedPickers) : JSON.parse(JSON.stringify(initialPickers));
    this.auditLogs = savedLogs ? JSON.parse(savedLogs) : JSON.parse(JSON.stringify(initialAuditLogs));

    // Ensure all orders have priority scores calculated
    this.orders.forEach(o => {
      o.priorityScore = calculateOrderPriority(o);
    });

    // Run global stock allocation sync on app startup to resolve any discrepancy between inventory and order line items
    syncGlobalInventoryAndAllocations(this.inventory, this.orders);

    this.saveState();
  }

  saveState() {
    localStorage.setItem('vortex_inventory', JSON.stringify(this.inventory));
    localStorage.setItem('vortex_orders', JSON.stringify(this.orders));
    localStorage.setItem('vortex_pickers', JSON.stringify(this.pickers));
    localStorage.setItem('vortex_audit_logs', JSON.stringify(this.auditLogs));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, data = null) {
    this.saveState();
    this.listeners.forEach(fn => fn(eventType, data));
  }

  getInventory() {
    return this.inventory;
  }

  getOrders() {
    return this.orders;
  }

  getPickers() {
    return this.pickers;
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  addAuditLog(type, orderId, message, severity = "INFO") {
    const log = {
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      timestamp: new Date().toLocaleTimeString(),
      type,
      orderId,
      message,
      severity
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
    this.notify("AUDIT_LOG_ADDED", log);
  }

  /**
   * Action: Resolve Shortage for an order using AI Decision Engine
   */
  resolveShortageForOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    let reallocatedAny = false;
    for (const item of order.items) {
      if ((item.allocatedQty || 0) < item.qty) {
        const result = resolveStockShortage(order, item.sku, item.qty, this.inventory, this.orders);
        
        if (result.reallocated) {
          reallocatedAny = true;
          this.addAuditLog(
            "AUTONOMOUS_REALLOCATION",
            order.id,
            `⚡ DECISION ENGINE EXECUTED: ${result.message}`,
            "CRITICAL"
          );
        } else {
          this.addAuditLog(
            "SHORTAGE_PARTIAL",
            order.id,
            `⚠️ ${result.message}`,
            "WARNING"
          );
        }
      }
    }

    syncGlobalInventoryAndAllocations(this.inventory, this.orders);
    this.notify("ORDER_UPDATED", order);
  }

  /**
   * Action: Advance order stage in fulfillment pipeline
   */
  advanceOrderStatus(orderId, newStatus = null) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const stages = ["CREATED", "ALLOCATED", "PICKING", "PACKING", "QC_CHECK", "DISPATCHED"];
    const currentIdx = stages.indexOf(order.status);
    
    let targetStatus = newStatus;
    if (!targetStatus && currentIdx >= 0 && currentIdx < stages.length - 1) {
      targetStatus = stages[currentIdx + 1];
    }

    if (targetStatus) {
      order.status = targetStatus;
      if (targetStatus === "DISPATCHED" && !order.trackingNumber) {
        order.trackingNumber = "TRK-" + Math.floor(1000000 + Math.random() * 9000000);
        order.dispatchedAt = new Date().toISOString();
      }

      this.addAuditLog(
        "STAGE_TRANSITION",
        order.id,
        `📦 Order ${order.id} transitioned to stage: ${targetStatus}`,
        "INFO"
      );
      this.notify("ORDER_UPDATED", order);
    }
  }

  /**
   * Action: Flag Damaged Item Exception during picking
   */
  flagDamagedItem(orderId, sku, reason, binLocation) {
    const invItem = findInventoryItem(this.inventory, sku);
    if (invItem) {
      invItem.status = "QUARANTINED";
      invItem.quarantinedQty = (invItem.quarantinedQty || 0) + 1;
      invItem.onHand = Math.max(0, invItem.onHand - 1);
    }

    this.addAuditLog(
      "DAMAGED_ITEM_FLAGGED",
      orderId,
      `🚨 EXCEPTION FLAGGED: Picker reported damaged ${sku} in ${binLocation}. Reason: "${reason}". Bin quarantined. Auto-reallocation triggered.`,
      "CRITICAL"
    );

    syncGlobalInventoryAndAllocations(this.inventory, this.orders);
    this.resolveShortageForOrder(orderId);
    this.notify("INVENTORY_UPDATED", invItem);
  }

  /**
   * Action: Create new manual customer order
   */
  createNewOrder(orderData) {
    const newId = "ORD-" + Math.floor(9000 + Math.random() * 999);
    const newOrder = {
      id: newId,
      customer: orderData.customer,
      customerTier: orderData.customerTier,
      slaType: orderData.slaType,
      slaHoursRemaining: orderData.slaType.includes("2-Hour") ? 2.0 : 24.0,
      createdAt: new Date().toISOString(),
      totalValue: orderData.items.reduce((acc, it) => acc + (it.qty * (it.unitCost || 100)), 0),
      items: orderData.items.map(it => ({ sku: it.sku, name: it.name, qty: it.qty, allocatedQty: 0 })),
      status: "CREATED",
      priorityScore: 0,
      notes: "New order created."
    };

    newOrder.priorityScore = calculateOrderPriority(newOrder);
    this.orders.unshift(newOrder);

    this.addAuditLog(
      "ORDER_CREATED",
      newId,
      `📦 New Order ${newId} created for ${newOrder.customer} (${newOrder.customerTier} Tier). Priority Score: ${newOrder.priorityScore}.`,
      "INFO"
    );

    // Re-sync allocations immediately
    syncGlobalInventoryAndAllocations(this.inventory, this.orders);
    this.notify("ORDER_CREATED", newOrder);
  }

  triggerEvent(eventType, payload) {
    this.notify(eventType, payload);
  }

  resetToDefaults() {
    localStorage.clear();
    this.loadState();
    this.notify("STATE_RESET");
  }
}

export const stateStore = new WarehouseStateStore();
