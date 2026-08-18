// Dispatch & Carrier Logistics Hub View Component

export function renderDispatchView(container, stateStore) {
  const orders = stateStore.getOrders();
  const dispatchedOrders = orders.filter(o => o.status === "DISPATCHED");
  const readyToDispatch = orders.filter(o => o.status === "QC_CHECK" || o.status === "PACKING");

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Control Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-4 rounded-2xl border border-dark-700/60 glass-card">
        <div>
          <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <i class="fa-solid fa-truck-fast text-cyan-400"></i>
            <span>Dispatch & Carrier Logistics Hub</span>
          </h2>
          <p class="text-xs text-slate-400">Carrier Manifest Assignment, Shipping Label Generation & Outbound Loading Bays</p>
        </div>

        <div class="flex items-center space-x-3 font-mono text-xs">
          <div class="bg-dark-950 px-3 py-1.5 rounded-xl border border-dark-700">
            <span class="text-slate-400">Dispatched Today:</span>
            <strong class="text-emerald-400 ml-1.5">${dispatchedOrders.length} Orders</strong>
          </div>
        </div>
      </div>

      <!-- Carrier Partner Status Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-dark-950 p-4 rounded-2xl border border-dark-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-xs text-slate-200">FedEx Priority Express</span>
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <div class="text-xs text-slate-400 font-mono">Dock Bay 1 • Pickup 16:00</div>
          <div class="text-xs font-bold text-cyan-400">4 Packages Queued</div>
        </div>

        <div class="bg-dark-950 p-4 rounded-2xl border border-dark-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-xs text-slate-200">DHL Express World</span>
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <div class="text-xs text-slate-400 font-mono">Dock Bay 2 • Pickup 17:30</div>
          <div class="text-xs font-bold text-cyan-400">2 Packages Queued</div>
        </div>

        <div class="bg-dark-950 p-4 rounded-2xl border border-dark-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-xs text-slate-200">UPS Ground Freight</span>
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <div class="text-xs text-slate-400 font-mono">Dock Bay 3 • Continuous</div>
          <div class="text-xs font-bold text-cyan-400">5 Packages Queued</div>
        </div>

        <div class="bg-dark-950 p-4 rounded-2xl border border-dark-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-xs text-slate-200">ColdChain Courier</span>
            <span class="h-2 w-2 rounded-full bg-amber-400"></span>
          </div>
          <div class="text-xs text-slate-400 font-mono">Refrigerated Bay • On Demand</div>
          <div class="text-xs font-bold text-amber-400">1 Urgent Medical</div>
        </div>

      </div>

      <!-- Outbound Dispatch Queue -->
      <div class="glass-card rounded-2xl border border-dark-700/60 p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-extrabold text-white">Outbound Loading Dock Queue</h3>
          <span class="text-xs font-mono text-cyan-400 font-bold">${readyToDispatch.length} Ready for Carrier Pickup</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-dark-700 text-slate-400 uppercase font-mono text-[10px]">
                <th class="py-3 px-4">Order ID & Customer</th>
                <th class="py-3 px-4">Carrier Assigned</th>
                <th class="py-3 px-4">SLA Target</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-700/60">
              ${readyToDispatch.length === 0 ? `
                <tr><td colspan="5" class="py-6 text-center text-slate-400 font-mono text-xs">No orders currently waiting in dispatch queue.</td></tr>
              ` : readyToDispatch.map(o => `
                <tr class="hover:bg-dark-800/50 transition-colors">
                  <td class="py-3 px-4 font-mono font-bold text-slate-200">
                    ${o.id}
                    <div class="text-[11px] text-slate-400 font-sans">${o.customer}</div>
                  </td>
                  <td class="py-3 px-4 font-bold text-cyan-400">${o.carrier || 'FedEx Express'}</td>
                  <td class="py-3 px-4 font-mono text-slate-300">${o.slaType}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      ${o.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <button data-id="${o.id}" class="btn-print-label px-3 py-1 rounded bg-dark-800 hover:bg-dark-700 text-slate-200 font-bold text-[11px] border border-dark-700">
                      🏷️ Print Label
                    </button>
                    <button data-id="${o.id}" class="btn-dispatch-now px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]">
                      🚚 Dispatch to Carrier
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

  // Attach listeners
  container.querySelectorAll('.btn-dispatch-now').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      stateStore.advanceOrderStatus(id, "DISPATCHED");

      if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }

      alert(`Order ${id} has been loaded onto truck and DISPATCHED! Tracking number generated.`);
      renderDispatchView(container, stateStore);
    });
  });

  container.querySelectorAll('.btn-print-label').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const order = orders.find(o => o.id === id);
      alert(`[SHIPPING LABEL GENERATED]\nTracking: TRK-FEDEX-${Math.floor(100000+Math.random()*900000)}\nTo: ${order ? order.customer : 'Customer'}\nCarrier: ${order ? order.carrier : 'FedEx Express'}`);
    });
  });
}
