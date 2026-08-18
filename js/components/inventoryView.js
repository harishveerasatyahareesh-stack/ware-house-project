// Inventory & Stock ROP View Component

import { calculateEOQAndROP } from '../decisionEngine.js';

export function renderInventoryView(container, stateStore) {
  const inventory = stateStore.getInventory();

  // Compute ROP and EOQ recommendations for all items
  const ropCalculations = inventory.map(item => calculateEOQAndROP(item));
  const reorderRecommendations = ropCalculations.filter(calc => calc.status !== "OPTIMAL");

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-4 rounded-2xl border border-dark-700/60 glass-card">
        <div>
          <h2 class="text-xl font-extrabold text-white tracking-tight">Inventory & Stock ROP Monitoring</h2>
          <p class="text-xs text-slate-400">Real-Time Bin Allocation, Safety Stock, ROP & EOQ Purchase Order Engine</p>
        </div>
        <div class="flex items-center space-x-3">
          <button id="btn-manual-restock" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2">
            <i class="fa-solid fa-truck-ramp-box"></i>
            <span>Receive Inventory Restock</span>
          </button>
        </div>
      </div>

      <!-- ROP & EOQ AI Recommendations Box -->
      <div class="glass-card p-5 rounded-2xl border border-dark-700/60 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <i class="fa-solid fa-calculator text-sm"></i>
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-white tracking-tight">EOQ & Reorder Recommendations (ROP Engine)</h3>
              <p class="text-xs text-slate-400">Calculates optimal Economic Order Quantity based on lead time & demand velocity</p>
            </div>
          </div>
          <span class="text-xs font-mono font-bold text-amber-400">${reorderRecommendations.length} Reorder Triggers</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${reorderRecommendations.length === 0 ? `
            <div class="col-span-2 p-4 text-center text-xs text-emerald-400 font-mono bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <i class="fa-solid fa-circle-check mr-2"></i> All inventory SKUs currently above Reorder Point (ROP) thresholds.
            </div>
          ` : reorderRecommendations.map(rec => `
            <div class="bg-dark-950 p-4 rounded-xl border border-amber-500/30 space-y-2 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <span class="font-mono font-bold text-slate-200 text-xs">${rec.sku}</span>
                  <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded ${rec.status === 'CRITICAL_OUT_OF_STOCK' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">
                    ${rec.status}
                  </span>
                </div>
                <div class="text-xs text-slate-300 font-bold mt-1">${rec.name}</div>
                <div class="grid grid-cols-3 gap-2 mt-3 text-[11px] font-mono bg-dark-900 p-2 rounded-lg border border-dark-800">
                  <div>
                    <span class="text-slate-400 block text-[9px]">AVAILABLE</span>
                    <strong class="${rec.currentAvailable === 0 ? 'text-rose-400' : 'text-slate-200'}">${rec.currentAvailable}</strong>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[9px]">REORDER POINT</span>
                    <strong class="text-amber-400">${rec.rop}</strong>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[9px]">RECOMMENDED EOQ</span>
                    <strong class="text-cyan-400">${rec.recommendedPoQty}</strong>
                  </div>
                </div>
              </div>
              
              <button data-sku="${rec.sku}" data-qty="${rec.recommendedPoQty}" class="btn-trigger-po w-full mt-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5">
                <i class="fa-solid fa-file-invoice"></i>
                <span>1-Click PO to Supplier (${rec.recommendedPoQty} units)</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Live Inventory Stock Table -->
      <div class="glass-card rounded-2xl border border-dark-700/60 overflow-hidden">
        <div class="p-4 border-b border-dark-700 flex items-center justify-between">
          <h3 class="text-sm font-extrabold text-white">Live Bin Inventory Matrix</h3>
          <span class="text-xs font-mono text-slate-400">${inventory.length} Total SKUs Monitored</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-dark-700 bg-dark-900/80 text-slate-400 uppercase font-mono text-[10px]">
                <th class="py-3 px-4">SKU & Item Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Zone & Bin</th>
                <th class="py-3 px-4 text-center">On-Hand</th>
                <th class="py-3 px-4 text-center">Allocated</th>
                <th class="py-3 px-4 text-center">Available</th>
                <th class="py-3 px-4 text-center">ROP / Safety</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-700/60">
              ${inventory.map(item => `
                <tr class="hover:bg-dark-800/50 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-mono font-bold text-slate-200">${item.sku}</div>
                    <div class="text-[11px] text-slate-400">${item.name}</div>
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-300">${item.category}</td>
                  <td class="py-3 px-4">
                    <div class="text-[11px] text-slate-300 font-semibold">${item.zone}</div>
                    <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-dark-850 text-cyan-400 rounded border border-dark-700">
                      ${item.binLocation}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono font-bold text-slate-200">${item.onHand}</td>
                  <td class="py-3 px-4 text-center font-mono font-bold text-cyan-400">${item.allocated}</td>
                  <td class="py-3 px-4 text-center font-mono font-bold ${item.available <= item.reorderPoint ? 'text-amber-400' : 'text-emerald-400'}">
                    ${item.available}
                  </td>
                  <td class="py-3 px-4 text-center font-mono text-slate-400">
                    ${item.reorderPoint} / ${item.safetyStock}
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 text-[10px] font-mono font-bold rounded-md ${getInvStatusClass(item.status)}">
                      ${item.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1">
                    <button data-sku="${item.sku}" class="btn-adjust-stock p-1.5 rounded bg-dark-800 hover:bg-dark-700 text-cyan-400 border border-dark-700" title="Adjust Stock Quantity">
                      <i class="fa-solid fa-sliders"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Attach Event Listeners
  container.querySelectorAll('.btn-trigger-po').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sku = e.currentTarget.dataset.sku;
      const qty = parseInt(e.currentTarget.dataset.qty, 10);

      const invItem = inventory.find(i => i.sku === sku);
      if (invItem) {
        invItem.onHand += qty;
        invItem.available += qty;
        if (invItem.status === "OUT_OF_STOCK" || invItem.status === "LOW_STOCK") {
          invItem.status = "IN_STOCK";
        }
      }

      stateStore.addAuditLog("SUPPLIER_PO_RECEIVED", null, `🚚 RESTOCK RECEIVED: Supplier PO delivered ${qty} units of ${sku}. Available inventory updated!`, "INFO");
      stateStore.notify("INVENTORY_UPDATED", invItem);
      alert(`Supplier Purchase Order of ${qty} units for ${sku} delivered! Available stock updated.`);
    });
  });

  const btnManualRestock = container.querySelector('#btn-manual-restock');
  if (btnManualRestock) {
    btnManualRestock.addEventListener('click', () => {
      inventory.forEach(i => {
        i.onHand += 10;
        i.available += 10;
        i.status = "IN_STOCK";
      });
      stateStore.addAuditLog("BULK_RESTOCK", null, "📦 BULK RESTOCK: Received +10 units across all inventory SKUs.", "INFO");
      stateStore.notify("INVENTORY_UPDATED");
      alert("Bulk Restock Complete: +10 units added to all SKUs.");
    });
  }

  container.querySelectorAll('.btn-adjust-stock').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sku = e.currentTarget.dataset.sku;
      const item = inventory.find(i => i.sku === sku);
      if (!item) return;

      const newQtyStr = prompt(`Adjust On-Hand Stock for ${sku}:`, item.onHand);
      if (newQtyStr !== null) {
        const newQty = parseInt(newQtyStr, 10);
        if (!isNaN(newQty) && newQty >= 0) {
          const diff = newQty - item.onHand;
          item.onHand = newQty;
          item.available = Math.max(0, item.available + diff);
          item.status = item.available <= 0 ? "OUT_OF_STOCK" : (item.available <= item.reorderPoint ? "LOW_STOCK" : "IN_STOCK");
          stateStore.addAuditLog("MANUAL_STOCK_ADJUST", null, `✏️ Manual Stock Adjust for ${sku}: On-Hand set to ${newQty}.`, "INFO");
          stateStore.notify("INVENTORY_UPDATED", item);
        }
      }
    });
  });
}

function getInvStatusClass(status) {
  switch (status) {
    case "IN_STOCK": return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    case "LOW_STOCK": return "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold";
    case "OUT_OF_STOCK": return "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse";
    case "QUARANTINED": return "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold";
    default: return "bg-slate-700 text-slate-200";
  }
}
