// Autonomous Decision Engine for VortexWarehouse OS

/**
 * Case-insensitive SKU lookup helper
 */
export function findInventoryItem(inventory, sku) {
  if (!sku) return null;
  const target = sku.toString().trim().toUpperCase();
  return inventory.find(i => i.sku && i.sku.toString().trim().toUpperCase() === target);
}

/**
 * Calculates a dynamic priority score (0-100) for an order
 * based on SLA time remaining, customer tier, and total order value.
 */
export function calculateOrderPriority(order) {
  let score = 50; // base score

  // SLA Urgency component (up to +40 points)
  if (order.slaHoursRemaining <= 1.0) {
    score += 40;
  } else if (order.slaHoursRemaining <= 3.0) {
    score += 30;
  } else if (order.slaHoursRemaining <= 12.0) {
    score += 20;
  } else if (order.slaHoursRemaining <= 24.0) {
    score += 10;
  }

  // Customer Tier component (up to +20 points)
  if (order.customerTier === "VIP") {
    score += 20;
  }

  // Value component (up to +10 points)
  if (order.totalValue >= 10000) {
    score += 10;
  } else if (order.totalValue >= 3000) {
    score += 5;
  }

  return Math.min(100, Math.max(1, score));
}

/**
 * Global Stock Allocation Pass across all orders & inventory.
 * Syncs inventory allocated/available counts with order line item demands.
 */
export function syncGlobalInventoryAndAllocations(inventory, orders) {
  // 1. Reset all inventory allocated & available counts based on onHand & quarantined
  inventory.forEach(inv => {
    inv.allocated = 0;
    inv.available = Math.max(0, (inv.onHand || 0) - (inv.quarantinedQty || 0));
  });

  // 2. Sort orders by priority score descending (highest priority gets first claim on stock)
  const sortedOrders = [...orders].sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50));

  // 3. Allocate available stock to orders
  sortedOrders.forEach(order => {
    let orderFullyAllocated = true;

    order.items.forEach(item => {
      const invItem = findInventoryItem(inventory, item.sku);
      const requestedQty = item.qty || 1;

      if (invItem) {
        // Calculate how many units can be allocated from available stock
        const canAllocate = Math.min(invItem.available, requestedQty);
        item.allocatedQty = canAllocate;
        
        invItem.allocated += canAllocate;
        invItem.available -= canAllocate;

        if (canAllocate < requestedQty) {
          orderFullyAllocated = false;
        }
      } else {
        item.allocatedQty = 0;
        orderFullyAllocated = false;
      }
    });

    // Update status if order is in CREATED or SHORTAGE_EXCEPTION stage
    if (orderFullyAllocated) {
      if (order.status === "CREATED" || order.status === "SHORTAGE_EXCEPTION") {
        order.status = "ALLOCATED";
        order.notes = "All line item stock reserved successfully.";
      }
    } else {
      if (order.status === "CREATED" || order.status === "ALLOCATED") {
        order.status = "SHORTAGE_EXCEPTION";
        const missingUnits = order.items.reduce((acc, it) => acc + (it.qty - (it.allocatedQty || 0)), 0);
        order.notes = `Stock shortage detected: ${missingUnits} unit(s) unfulfilled. AI Reallocation available.`;
      }
    }
  });

  // 4. Update inventory status badges (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
  inventory.forEach(inv => {
    if (inv.status !== "QUARANTINED") {
      if (inv.available <= 0 && inv.onHand <= 0) {
        inv.status = "OUT_OF_STOCK";
      } else if (inv.available <= (inv.reorderPoint || 10)) {
        inv.status = "LOW_STOCK";
      } else {
        inv.status = "IN_STOCK";
      }
    }
  });
}

/**
 * Autonomous Stock Reallocation Engine ("The Competitive Twist")
 * Resolves stock shortages for urgent orders by snatching stock from lower-priority orders.
 */
export function resolveStockShortage(urgentOrder, targetSku, requiredQty, inventory, allOrders) {
  const item = findInventoryItem(inventory, targetSku);
  if (!item) return { success: false, reason: "SKU not found in inventory" };

  const currentAvailable = item.available;
  const urgentItem = urgentOrder.items.find(it => it.sku && it.sku.toString().trim().toUpperCase() === targetSku.toString().trim().toUpperCase());
  const currentAllocatedForUrgent = urgentItem ? (urgentItem.allocatedQty || 0) : 0;
  const deficit = requiredQty - currentAllocatedForUrgent;

  if (deficit <= 0) {
    return { success: true, reallocated: false, message: "Sufficient stock already allocated." };
  }

  // Find lower-priority orders holding allocated stock for this SKU
  const eligibleLowPriorityOrders = allOrders
    .filter(o => o.id !== urgentOrder.id && (o.status === "ALLOCATED" || o.status === "CREATED" || o.status === "SHORTAGE_EXCEPTION"))
    .filter(o => o.items.some(it => it.sku && it.sku.toString().trim().toUpperCase() === targetSku.toString().trim().toUpperCase() && (it.allocatedQty || 0) > 0))
    .sort((a, b) => (a.priorityScore || 50) - (b.priorityScore || 50)); // ascending (lowest priority first)

  let snatchedQty = 0;
  const affectedOrdersTrace = [];

  for (const lowOrder of eligibleLowPriorityOrders) {
    if (snatchedQty >= deficit) break;

    const lowItem = lowOrder.items.find(it => it.sku && it.sku.toString().trim().toUpperCase() === targetSku.toString().trim().toUpperCase());
    if (!lowItem || (lowItem.allocatedQty || 0) <= 0) continue;

    const qtyToTake = Math.min(lowItem.allocatedQty, deficit - snatchedQty);
    
    lowItem.allocatedQty -= qtyToTake;
    snatchedQty += qtyToTake;

    if (lowItem.allocatedQty === 0) {
      lowOrder.status = "SHORTAGE_EXCEPTION";
      lowOrder.notes = `Stock snatched by VIP Order ${urgentOrder.id} (${qtyToTake}x units). Pending supplier restock.`;
    } else {
      lowOrder.notes = `Partially de-allocated ${qtyToTake}x units for VIP Order ${urgentOrder.id}.`;
    }

    affectedOrdersTrace.push({
      orderId: lowOrder.id,
      customer: lowOrder.customer,
      snatched: qtyToTake,
      remainingAllocated: lowItem.allocatedQty,
      priority: lowOrder.priorityScore
    });
  }

  // Also check if any loose available stock exists in inventory
  let looseStockUsed = 0;
  const remainingNeeded = deficit - snatchedQty;
  if (remainingNeeded > 0 && item.available > 0) {
    looseStockUsed = Math.min(item.available, remainingNeeded);
    snatchedQty += looseStockUsed;
  }

  if (urgentItem) {
    urgentItem.allocatedQty = currentAllocatedForUrgent + snatchedQty;
  }

  // Re-sync global inventory state to keep everything perfectly synchronized
  syncGlobalInventoryAndAllocations(inventory, allOrders);

  if (urgentItem && urgentItem.allocatedQty >= requiredQty) {
    urgentOrder.status = "ALLOCATED";
    urgentOrder.notes = `Autonomous Stock Snatch Complete: Acquired ${snatchedQty}x units for VIP Order ${urgentOrder.id}.`;

    return {
      success: true,
      reallocated: true,
      snatchedQty,
      affectedOrders: affectedOrdersTrace,
      message: `Successfully reallocated ${snatchedQty} units of ${targetSku} to satisfy VIP Order ${urgentOrder.id}.`
    };
  } else {
    urgentOrder.status = "SHORTAGE_EXCEPTION";
    const totalAlloc = urgentItem ? urgentItem.allocatedQty : 0;
    urgentOrder.notes = `Partial Stock Snatch: Acquired ${totalAlloc} / ${requiredQty} units. Supplier PO triggered.`;

    return {
      success: false,
      partial: true,
      snatchedQty,
      stillNeeded: requiredQty - totalAlloc,
      affectedOrders: affectedOrdersTrace,
      message: `Partially allocated ${totalAlloc} / ${requiredQty} units for ${targetSku}.`
    };
  }
}

/**
 * Calculates ROP (Reorder Point) and EOQ (Economic Order Quantity)
 */
export function calculateEOQAndROP(item) {
  const rop = Math.ceil((item.dailyVelocity * item.leadTimeDays) + item.safetyStock);

  const annualDemand = item.dailyVelocity * 365;
  const orderCost = 50;
  const holdingCost = Math.max(1, item.unitCost * 0.20);
  const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderCost) / holdingCost));

  return {
    sku: item.sku,
    name: item.name,
    rop,
    eoq,
    currentAvailable: item.available,
    onHand: item.onHand,
    status: item.available <= rop ? (item.available === 0 ? "CRITICAL_OUT_OF_STOCK" : "REORDER_RECOMMENDED") : "OPTIMAL",
    recommendedPoQty: Math.max(eoq, rop - item.available)
  };
}

/**
 * Automated Bottleneck Detector Engine
 */
export function detectPipelineBottlenecks(orders) {
  const counts = {
    CREATED: 0,
    ALLOCATED: 0,
    PICKING: 0,
    PACKING: 0,
    QC_CHECK: 0,
    DISPATCHED: 0,
    SHORTAGE_EXCEPTION: 0
  };

  orders.forEach(o => {
    if (counts[o.status] !== undefined) {
      counts[o.status]++;
    }
  });

  const bottlenecks = [];

  if (counts.SHORTAGE_EXCEPTION >= 1) {
    bottlenecks.push({
      stage: "SHORTAGE_EXCEPTION",
      severity: "HIGH",
      title: "Inventory Allocation Deficit",
      description: `${counts.SHORTAGE_EXCEPTION} order(s) blocked due to unfulfilled stock allocation.`,
      actionText: "Trigger AI Autonomous Stock Reallocation",
      actionType: "RESOLVE_SHORTAGES"
    });
  }

  if (counts.PACKING >= 3) {
    bottlenecks.push({
      stage: "PACKING",
      severity: "MEDIUM",
      title: "Packing Hub Queue Backup",
      description: `${counts.PACKING} orders waiting at Packing Hub Bays. Picker-to-Packer ratio unbalanced.`,
      actionText: "Reassign 1 Picker to Packing Bay #2",
      actionType: "REASSIGN_PACKER"
    });
  }

  if (counts.QC_CHECK >= 3) {
    bottlenecks.push({
      stage: "QC_CHECK",
      severity: "MEDIUM",
      title: "Cold Chain / QC Verification Delay",
      description: `${counts.QC_CHECK} high-value orders awaiting inspector signoff.`,
      actionText: "Speed Inspector Clearance",
      actionType: "FAST_TRACK_QC"
    });
  }

  return { counts, bottlenecks };
}
