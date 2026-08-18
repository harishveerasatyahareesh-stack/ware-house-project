// Picker Mobile App Simulator & Damaged Goods Exception View Component

export function renderPickerSimView(container, stateStore) {
  const orders = stateStore.getOrders();
  const pickers = stateStore.getPickers();
  const inventory = stateStore.getInventory();

  // Active picking order
  const pickingOrder = orders.find(o => o.status === "PICKING" || o.status === "ALLOCATED") || orders[0];

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6">
      
      <!-- Simulator Title Bar -->
      <div class="bg-dark-900/80 p-4 rounded-2xl border border-dark-700/60 glass-card flex items-center justify-between">
        <div>
          <h2 class="text-lg font-extrabold text-white tracking-tight flex items-center space-x-2">
            <i class="fa-solid fa-mobile-screen-button text-cyan-400"></i>
            <span>Floor Picker Mobile App Simulator</span>
          </h2>
          <p class="text-xs text-slate-400">Simulates handheld terminal barcode scanning, bin picking & damaged goods reporting</p>
        </div>
        <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
          PICKER TERMINAL #P-02 ONLINE
        </span>
      </div>

      <!-- Mobile Device Mockup Frame -->
      <div class="bg-dark-950 p-6 rounded-3xl border-2 border-dark-700 shadow-2xl space-y-5">
        
        <!-- Active Order Select Dropdown -->
        <div class="flex items-center justify-between bg-dark-900 p-3 rounded-xl border border-dark-800">
          <div>
            <span class="text-[10px] font-mono text-slate-400 uppercase font-bold">Assigned Pick Order:</span>
            <select id="picker-order-select" class="block w-full bg-dark-850 border border-dark-700 font-mono font-bold text-xs text-cyan-300 rounded px-2 py-1 mt-0.5">
              ${orders.map(o => `<option value="${o.id}" ${o.id === (pickingOrder ? pickingOrder.id : '') ? 'selected' : ''}>${o.id} — ${o.customer} (${o.status})</option>`).join('')}
            </select>
          </div>
          <span class="px-2.5 py-1 text-xs font-mono font-bold rounded-md ${pickingOrder && pickingOrder.customerTier === 'VIP' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'}">
            ${pickingOrder ? pickingOrder.customerTier : 'Standard'} Tier
          </span>
        </div>

        ${pickingOrder ? `
          <!-- Item Pick Checklist -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Item Pick Checklist & Bin Guidance</h3>
            
            <div class="space-y-2">
              ${pickingOrder.items.map((item, idx) => {
                const inv = inventory.find(i => i.sku === item.sku);
                const bin = inv ? inv.binLocation : "Bin A-01";
                const isQuarantined = inv && inv.status === "QUARANTINED";

                return `
                  <div class="bg-dark-900 p-4 rounded-2xl border ${isQuarantined ? 'border-rose-500/50 bg-rose-950/20' : 'border-dark-700'} space-y-3">
                    <div class="flex items-start justify-between">
                      <div>
                        <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300">
                          📍 TARGET: ${bin}
                        </span>
                        <h4 class="font-extrabold text-sm text-white mt-1">${item.name}</h4>
                        <div class="text-xs font-mono text-slate-400">SKU: ${item.sku} | Quantity Required: <strong class="text-white">${item.qty}x</strong></div>
                      </div>

                      ${isQuarantined ? `
                        <span class="px-2 py-1 text-[10px] font-mono font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          BIN QUARANTINED
                        </span>
                      ` : `
                        <button data-sku="${item.sku}" data-bin="${bin}" class="btn-scan-item px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1">
                          <i class="fa-solid fa-barcode"></i>
                          <span>Scan Barcode</span>
                        </button>
                      `}
                    </div>

                    <!-- Exception Reporting Action Bar -->
                    <div class="pt-2 border-t border-dark-800/80 flex items-center justify-between">
                      <span class="text-[11px] text-slate-400">Item Issue / Damage detected?</span>
                      <button data-sku="${item.sku}" data-bin="${bin}" class="btn-flag-damaged px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition-all flex items-center space-x-1.5">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>Flag Damaged / Missing Item</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bottom Stage Advance -->
          <div class="pt-3 border-t border-dark-800 flex items-center justify-between">
            <span class="text-xs text-slate-400">Complete all item picks to advance to Packing Hub.</span>
            <button id="btn-complete-pick" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg flex items-center space-x-2">
              <span>Complete Pick → Advance to Packing</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        ` : `
          <div class="p-8 text-center text-xs font-mono text-slate-400">No active pick orders available.</div>
        `}

      </div>

    </div>
  `;

  // Attach Event Listeners
  const orderSelect = container.querySelector('#picker-order-select');
  if (orderSelect) {
    orderSelect.addEventListener('change', (e) => {
      renderPickerSimView(container, stateStore);
    });
  }

  container.querySelectorAll('.btn-scan-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sku = e.currentTarget.dataset.sku;
      const bin = e.currentTarget.dataset.bin;

      if (typeof confetti === 'function') {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      }

      stateStore.addAuditLog("BARCODE_SCANNED", pickingOrder.id, `✅ BARCODE MATCH: Picker scanned ${sku} in ${bin}. Verified!`, "INFO");
      alert(`Barcode Scan Successful!\nVerified SKU: ${sku}\nBin: ${bin}`);
    });
  });

  container.querySelectorAll('.btn-flag-damaged').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sku = e.currentTarget.dataset.sku;
      const bin = e.currentTarget.dataset.bin;

      const reason = prompt(`Report Exception for SKU ${sku} in ${bin}:\n1. Damaged / Broken Packaging\n2. Crushed Seal\n3. Missing from Bin Location`, "Broken Packaging / Crushed Box");

      if (reason) {
        stateStore.flagDamagedItem(pickingOrder.id, sku, reason, bin);
        alert(`🚨 EXCEPTION REPORTED!\nBin ${bin} has been QUARANTINED in the system.\nAI Decision Engine is searching backup zones for replacement stock.`);
        renderPickerSimView(container, stateStore);
      }
    });
  });

  const btnCompletePick = container.querySelector('#btn-complete-pick');
  if (btnCompletePick) {
    btnCompletePick.addEventListener('click', () => {
      if (pickingOrder) {
        stateStore.advanceOrderStatus(pickingOrder.id, "PACKING");
        alert(`Pick Order ${pickingOrder.id} complete! Transferred to Packing Station Bay #2.`);
        renderPickerSimView(container, stateStore);
      }
    });
  }
}
