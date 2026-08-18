// Operations Dashboard View Component

import { detectPipelineBottlenecks } from '../decisionEngine.js';

export function renderDashboardView(container, stateStore) {
  const orders = stateStore.getOrders();
  const inventory = stateStore.getInventory();
  const auditLogs = stateStore.getAuditLogs();

  const { counts, bottlenecks } = detectPipelineBottlenecks(orders);

  // Compute KPIs
  const totalOrders = orders.length;
  const dispatchedCount = counts.DISPATCHED || 0;
  const shortageCount = counts.SHORTAGE_EXCEPTION || 0;
  const otifPercent = Math.round(((dispatchedCount) / Math.max(1, totalOrders - shortageCount)) * 100);

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Welcome & Action Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-5 rounded-2xl border border-dark-700/60 glass-card">
        <div>
          <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Warehouse Operations Command Center</span>
            <span class="px-2.5 py-0.5 text-xs font-mono rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">ZONE 4 ACTIVE</span>
          </h2>
          <p class="text-xs text-slate-400 mt-1">Autonomous Inventory Allocation, Route Optimization & Fulfillment Engine</p>
        </div>
        <div class="flex items-center space-x-3">
          <button id="btn-quick-new-order" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/40 transition-all flex items-center space-x-2">
            <i class="fa-solid fa-plus"></i>
            <span>Create New Order</span>
          </button>
          <button id="btn-quick-resolve" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-amber-900/30 transition-all flex items-center space-x-2">
            <i class="fa-solid fa-bolt text-yellow-200 animate-bounce"></i>
            <span>Run AI Stock Reallocation</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- KPI 1: OTIF Rate -->
        <div class="glass-card glass-card-hover p-4 rounded-2xl border border-dark-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">OTIF Rate (On-Time)</span>
            <div class="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <i class="fa-solid fa-shield-check text-sm"></i>
            </div>
          </div>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-extrabold text-white font-mono">${otifPercent}%</span>
            <span class="text-[11px] font-bold text-emerald-400 flex items-center">
              <i class="fa-solid fa-arrow-up text-[9px] mr-1"></i>+2.4%
            </span>
          </div>
          <p class="text-[11px] text-slate-400">On-Time In-Full SLA compliance</p>
        </div>

        <!-- KPI 2: Cycle Time -->
        <div class="glass-card glass-card-hover p-4 rounded-2xl border border-dark-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Pick-to-Ship</span>
            <div class="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <i class="fa-solid fa-stopwatch text-sm"></i>
            </div>
          </div>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-extrabold text-white font-mono">14.2 min</span>
            <span class="text-[11px] font-bold text-cyan-400 flex items-center">
              <i class="fa-solid fa-bolt text-[9px] mr-1"></i>Optimal
            </span>
          </div>
          <p class="text-[11px] text-slate-400">Route optimized pathfinding</p>
        </div>

        <!-- KPI 3: Active Exceptions -->
        <div class="glass-card glass-card-hover p-4 rounded-2xl border border-dark-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortage Exceptions</span>
            <div class="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <i class="fa-solid fa-triangle-exclamation text-sm"></i>
            </div>
          </div>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-extrabold text-white font-mono">${shortageCount}</span>
            <span class="text-[11px] font-bold ${shortageCount > 0 ? 'text-rose-400' : 'text-emerald-400'}">
              ${shortageCount > 0 ? 'Action Required' : 'All Allocated'}
            </span>
          </div>
          <p class="text-[11px] text-slate-400">Pending stock snatching AI</p>
        </div>

        <!-- KPI 4: Storage Capacity -->
        <div class="glass-card glass-card-hover p-4 rounded-2xl border border-dark-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Capacity</span>
            <div class="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <i class="fa-solid fa-boxes-stacked text-sm"></i>
            </div>
          </div>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-extrabold text-white font-mono">76%</span>
            <span class="text-[11px] font-bold text-purple-400">2,410 Bins</span>
          </div>
          <p class="text-[11px] text-slate-400">Zone A & Zone B active</p>
        </div>

      </div>

      <!-- Automated Bottleneck Alerts Banner -->
      ${bottlenecks.length > 0 ? `
        <div class="bg-gradient-to-r from-amber-950/80 via-dark-900 to-amber-950/80 border border-amber-500/40 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg shadow-amber-950/30">
          <div class="flex items-start space-x-3">
            <div class="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fa-solid fa-circle-exclamation text-lg animate-pulse"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-sm font-extrabold text-amber-300">${bottlenecks[0].title}</h3>
                <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 rounded">BOTTLENECK DETECTED</span>
              </div>
              <p class="text-xs text-slate-300 mt-0.5">${bottlenecks[0].description}</p>
            </div>
          </div>
          <button id="btn-fix-bottleneck" data-action="${bottlenecks[0].actionType}" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-extrabold text-xs shadow-md transition-all shrink-0">
            ⚡ ${bottlenecks[0].actionText}
          </button>
        </div>
      ` : ''}

      <!-- Order Fulfillment Stage Pipeline Tracker -->
      <div class="glass-card p-5 rounded-2xl border border-dark-700/60 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-extrabold text-white tracking-tight">Order Fulfillment Lifecycle Pipeline</h3>
            <p class="text-xs text-slate-400">Real-time status breakdown across fulfillment stages</p>
          </div>
          <span class="text-xs font-mono font-bold text-cyan-400">${orders.length} Active Orders</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div class="bg-dark-950/80 p-3 rounded-xl border border-dark-700/60 text-center space-y-1">
            <span class="text-[10px] font-mono uppercase font-bold text-slate-400">1. Created</span>
            <div class="text-xl font-extrabold text-cyan-400 font-mono">${counts.CREATED || 0}</div>
            <div class="text-[10px] text-slate-400">Queue Stage</div>
          </div>

          <div class="bg-dark-950/80 p-3 rounded-xl border border-dark-700/60 text-center space-y-1">
            <span class="text-[10px] font-mono uppercase font-bold text-slate-400">2. Allocated</span>
            <div class="text-xl font-extrabold text-blue-400 font-mono">${counts.ALLOCATED || 0}</div>
            <div class="text-[10px] text-slate-400">Stock Reserved</div>
          </div>

          <div class="bg-dark-950/80 p-3 rounded-xl border border-dark-700/60 text-center space-y-1">
            <span class="text-[10px] font-mono uppercase font-bold text-slate-400">3. Picking</span>
            <div class="text-xl font-extrabold text-emerald-400 font-mono">${counts.PICKING || 0}</div>
            <div class="text-[10px] text-slate-400">Floor Pickers</div>
          </div>

          <div class="bg-dark-950/80 p-3 rounded-xl border border-dark-700/60 text-center space-y-1">
            <span class="text-[10px] font-mono uppercase font-bold text-slate-400">4. Packing</span>
            <div class="text-xl font-extrabold text-indigo-400 font-mono">${counts.PACKING || 0}</div>
            <div class="text-[10px] text-slate-400">Hub Bays</div>
          </div>

          <div class="bg-dark-950/80 p-3 rounded-xl border border-dark-700/60 text-center space-y-1">
            <span class="text-[10px] font-mono uppercase font-bold text-slate-400">5. QC Check</span>
            <div class="text-xl font-extrabold text-purple-400 font-mono">${counts.QC_CHECK || 0}</div>
            <div class="text-[10px] text-slate-400">Verification</div>
          </div>

          <div class="bg-dark-950/80 p-3 rounded-xl border border-dark-700/60 text-center space-y-1">
            <span class="text-[10px] font-mono uppercase font-bold text-slate-400">6. Dispatched</span>
            <div class="text-xl font-extrabold text-emerald-400 font-mono">${counts.DISPATCHED || 0}</div>
            <div class="text-[10px] text-slate-400">In Transit</div>
          </div>

        </div>
      </div>

      <!-- Priority Orders Action Table -->
      <div class="glass-card p-5 rounded-2xl border border-dark-700/60 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-extrabold text-white tracking-tight">Active Fulfillment Orders</h3>
            <p class="text-xs text-slate-400">Sorted by Decision Engine SLA Priority Score</p>
          </div>
          <button id="btn-view-all-orders" class="text-xs font-bold text-cyan-400 hover:text-cyan-300">View All Orders →</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-dark-700 text-slate-400 uppercase font-mono text-[10px]">
                <th class="py-2.5 px-3">Order ID & Customer</th>
                <th class="py-2.5 px-3">Tier</th>
                <th class="py-2.5 px-3">SLA Urgency</th>
                <th class="py-2.5 px-3">Priority Score</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-700/60">
              ${orders.slice(0, 5).map(o => `
                <tr class="hover:bg-dark-800/50 transition-colors">
                  <td class="py-3 px-3">
                    <div class="font-mono font-bold text-slate-200">${o.id}</div>
                    <div class="text-[11px] text-slate-400">${o.customer}</div>
                  </td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${o.customerTier === 'VIP' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'}">
                      ${o.customerTier}
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <div class="text-[11px] font-semibold text-slate-300">${o.slaType}</div>
                    <div class="text-[10px] font-mono text-cyan-400">${o.slaHoursRemaining}h remaining</div>
                  </td>
                  <td class="py-3 px-3">
                    <div class="flex items-center space-x-2">
                      <div class="w-12 bg-dark-950 h-2 rounded-full overflow-hidden border border-dark-700">
                        <div class="bg-gradient-to-r from-cyan-500 to-amber-500 h-full" style="width: ${o.priorityScore}%"></div>
                      </div>
                      <span class="font-mono font-bold text-slate-200">${o.priorityScore}</span>
                    </div>
                  </td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-1 text-[10px] font-mono font-bold rounded-md ${getStatusBadgeClass(o.status)}">
                      ${o.status}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-right space-x-1">
                    ${o.status === "SHORTAGE_EXCEPTION" ? `
                      <button data-order-id="${o.id}" class="btn-resolve-order-shortage px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-[11px] shadow-sm">
                        ⚡ Snatch Stock
                      </button>
                    ` : `
                      <button data-order-id="${o.id}" class="btn-advance-order px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-cyan-400 font-bold text-[11px] border border-dark-700">
                        Advance Stage →
                      </button>
                    `}
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
  const btnQuickResolve = container.querySelector('#btn-quick-resolve');
  if (btnQuickResolve) {
    btnQuickResolve.addEventListener('click', () => {
      const shortageOrders = orders.filter(o => o.status === "SHORTAGE_EXCEPTION" || o.items.some(i => i.allocatedQty < i.qty));
      if (shortageOrders.length > 0) {
        shortageOrders.forEach(o => stateStore.resolveShortageForOrder(o.id));
      } else {
        alert("All orders currently have complete stock allocation!");
      }
    });
  }

  const btnFixBottleneck = container.querySelector('#btn-fix-bottleneck');
  if (btnFixBottleneck) {
    btnFixBottleneck.addEventListener('click', () => {
      const action = btnFixBottleneck.dataset.action;
      if (action === "RESOLVE_SHORTAGES") {
        orders.filter(o => o.status === "SHORTAGE_EXCEPTION").forEach(o => stateStore.resolveShortageForOrder(o.id));
      } else if (action === "REASSIGN_PACKER") {
        stateStore.addAuditLog("STAFF_REASSIGN", null, "👷 REASSIGNMENT: Assigned Picker David Kim to Packing Hub Bay #2.", "INFO");
        alert("Reassigned 1 picker to Packing Hub Bay #2. Queue speed improved!");
      }
    });
  }

  container.querySelectorAll('.btn-resolve-order-shortage').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.orderId;
      stateStore.resolveShortageForOrder(id);
    });
  });

  container.querySelectorAll('.btn-advance-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.orderId;
      stateStore.advanceOrderStatus(id);
    });
  });

  const btnViewAll = container.querySelector('#btn-view-all-orders');
  if (btnViewAll) {
    btnViewAll.addEventListener('click', () => {
      document.querySelector('button[data-tab="orders"]').click();
    });
  }

  const btnQuickNew = container.querySelector('#btn-quick-new-order');
  if (btnQuickNew) {
    btnQuickNew.addEventListener('click', () => {
      stateStore.triggerEvent("OPEN_CREATE_ORDER_MODAL");
    });
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "CREATED": return "bg-slate-700 text-slate-200";
    case "ALLOCATED": return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    case "PICKING": return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    case "PACKING": return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
    case "QC_CHECK": return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
    case "DISPATCHED": return "bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-bold";
    case "SHORTAGE_EXCEPTION": return "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse";
    default: return "bg-slate-700 text-slate-200";
  }
}
