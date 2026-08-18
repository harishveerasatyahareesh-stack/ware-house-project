// Order Management View Component

export function renderOrdersView(container, stateStore) {
  const orders = stateStore.getOrders();
  const inventory = stateStore.getInventory();

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Control Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-4 rounded-2xl border border-dark-700/60 glass-card">
        <div>
          <h2 class="text-xl font-extrabold text-white tracking-tight">Order Management & Prioritization</h2>
          <p class="text-xs text-slate-400 font-medium">Decision Engine SLA Scoring, Stock Allocation & Fulfillment Lifecycle</p>
        </div>
        <div class="flex items-center space-x-3">
          <button id="btn-reset-demo-data" class="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold text-xs border border-dark-700 transition-all flex items-center space-x-1.5" title="Reset LocalStorage to Original Default State">
            <i class="fa-solid fa-rotate-left"></i>
            <span>Reset Demo Data</span>
          </button>
          <button id="btn-create-order" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2">
            <i class="fa-solid fa-cart-plus"></i>
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-dark-950 p-3 rounded-xl border border-dark-700">
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <span class="text-xs font-bold text-slate-400 font-mono">Filter Stage:</span>
          <select id="filter-stage" class="bg-dark-850 border border-dark-700 text-xs font-semibold text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="ALL">All Stages</option>
            <option value="SHORTAGE_EXCEPTION">Shortage Exceptions 🚨</option>
            <option value="CREATED">Created</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="PICKING">Picking</option>
            <option value="PACKING">Packing</option>
            <option value="QC_CHECK">QC Check</option>
            <option value="DISPATCHED">Dispatched</option>
          </select>
        </div>

        <div class="w-full sm:w-64">
          <input type="text" id="search-orders" placeholder="Search Order ID or Customer..." class="w-full bg-dark-850 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500">
        </div>
      </div>

      <!-- Orders List Table -->
      <div class="glass-card rounded-2xl border border-dark-700/60 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-dark-700 bg-dark-900/80 text-slate-400 uppercase font-mono text-[10px]">
                <th class="py-3 px-4">Order ID</th>
                <th class="py-3 px-4">Customer & Tier</th>
                <th class="py-3 px-4">SLA Urgency</th>
                <th class="py-3 px-4">Items Requested</th>
                <th class="py-3 px-4">Allocation Status</th>
                <th class="py-3 px-4">Priority Score</th>
                <th class="py-3 px-4">Stage</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="orders-tbody" class="divide-y divide-dark-700/60">
              <!-- Rendered via updateOrderTable -->
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  const tbody = container.querySelector('#orders-tbody');
  const filterStageSelect = container.querySelector('#filter-stage');
  const searchInput = container.querySelector('#search-orders');

  function updateOrderTable() {
    const stageFilter = filterStageSelect.value;
    const search = searchInput.value.toLowerCase();

    let filtered = orders.filter(o => {
      const matchStage = stageFilter === "ALL" || o.status === stageFilter;
      const matchSearch = o.id.toLowerCase().includes(search) || o.customer.toLowerCase().includes(search);
      return matchStage && matchSearch;
    });

    tbody.innerHTML = filtered.map(o => `
      <tr class="hover:bg-dark-800/50 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-slate-200">
          ${o.id}
          ${o.notes && o.notes.includes('snatch') ? '<span class="ml-1 text-amber-400" title="Stock snatched">⚡</span>' : ''}
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-200">${o.customer}</div>
          <span class="px-1.5 py-0.5 text-[9px] font-bold rounded ${o.customerTier === 'VIP' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'}">
            ${o.customerTier} Tier
          </span>
        </td>
        <td class="py-3 px-4">
          <div class="text-[11px] font-semibold text-slate-300">${o.slaType}</div>
          <div class="text-[10px] font-mono text-cyan-400">${o.slaHoursRemaining}h remaining</div>
        </td>
        <td class="py-3 px-4">
          <div class="space-y-1">
            ${o.items.map(it => `
              <div class="text-[11px] font-mono flex items-center space-x-1">
                <span class="font-bold text-slate-200">${it.qty}x</span>
                <span class="text-slate-400">${it.sku}</span>
                <span class="text-[10px] ${ (it.allocatedQty || 0) < it.qty ? 'text-rose-400 font-bold' : 'text-emerald-400'}">
                  (${it.allocatedQty || 0}/${it.qty} alloc)
                </span>
              </div>
            `).join('')}
          </div>
        </td>
        <td class="py-3 px-4">
          ${isFullyAllocated(o) ? `
            <span class="text-[11px] font-bold text-emerald-400 flex items-center">
              <i class="fa-solid fa-check-circle mr-1"></i>100% Reserved
            </span>
          ` : `
            <span class="text-[11px] font-bold text-rose-400 flex items-center animate-pulse">
              <i class="fa-solid fa-triangle-exclamation mr-1"></i>Shortage (${getShortageDeficit(o)} units)
            </span>
          `}
        </td>
        <td class="py-3 px-4 font-mono font-bold text-amber-300 text-sm">
          ${o.priorityScore}
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-1 text-[10px] font-mono font-bold rounded-md ${getStatusBadgeClass(o.status)}">
            ${o.status}
          </span>
        </td>
        <td class="py-3 px-4 text-right space-x-1.5">
          <button data-id="${o.id}" class="btn-inspect-order p-1.5 rounded bg-dark-800 hover:bg-dark-700 text-cyan-400 border border-dark-700" title="Inspect Order Details">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${o.status === "SHORTAGE_EXCEPTION" ? `
            <button data-id="${o.id}" class="btn-snatch-stock px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-[10px]">
              ⚡ Reallocate
            </button>
          ` : `
            <button data-id="${o.id}" class="btn-next-stage px-2 py-1 rounded bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold text-[10px] border border-dark-700">
              Next Stage →
            </button>
          `}
        </td>
      </tr>
    `).join('');

    // Attach listeners
    tbody.querySelectorAll('.btn-inspect-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openOrderModal(id, stateStore);
      });
    });

    tbody.querySelectorAll('.btn-snatch-stock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        stateStore.resolveShortageForOrder(id);
      });
    });

    tbody.querySelectorAll('.btn-next-stage').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        stateStore.advanceOrderStatus(id);
      });
    });
  }

  filterStageSelect.addEventListener('change', updateOrderTable);
  searchInput.addEventListener('input', updateOrderTable);
  updateOrderTable();

  // Reset demo data button listener
  container.querySelector('#btn-reset-demo-data').addEventListener('click', () => {
    stateStore.resetToDefaults();
    renderOrdersView(container, stateStore);
  });

  // New Order button listener
  container.querySelector('#btn-create-order').addEventListener('click', () => {
    openCreateOrderModal(stateStore);
  });
}

function isFullyAllocated(order) {
  if (!order.items || order.items.length === 0) return false;
  return order.items.every(it => (it.allocatedQty || 0) >= (it.qty || 1));
}

function getShortageDeficit(order) {
  if (!order.items) return 0;
  return order.items.reduce((acc, it) => acc + Math.max(0, (it.qty || 1) - (it.allocatedQty || 0)), 0);
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

function openOrderModal(orderId, stateStore) {
  const order = stateStore.getOrders().find(o => o.id === orderId);
  if (!order) return;

  const modalContainer = document.getElementById('modal-container');
  const modalContent = document.getElementById('modal-content');

  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-dark-700 pb-3">
        <div>
          <h3 class="text-lg font-extrabold text-white flex items-center space-x-2">
            <span>Order ${order.id}</span>
            <span class="px-2 py-0.5 text-xs font-mono rounded bg-cyan-500/20 text-cyan-400 font-bold">${order.status}</span>
          </h3>
          <p class="text-xs text-slate-400">Customer: ${order.customer} (${order.customerTier} Tier)</p>
        </div>
        <button id="btn-close-modal" class="text-slate-400 hover:text-white">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="bg-dark-950 p-3 rounded-xl border border-dark-700">
          <span class="text-slate-400 font-mono">SLA Target:</span>
          <div class="font-bold text-slate-200 mt-1">${order.slaType}</div>
          <div class="text-cyan-400 font-mono mt-0.5">${order.slaHoursRemaining}h SLA remaining</div>
        </div>

        <div class="bg-dark-950 p-3 rounded-xl border border-dark-700">
          <span class="text-slate-400 font-mono">Decision Priority Score:</span>
          <div class="font-extrabold text-amber-300 text-lg font-mono mt-0.5">${order.priorityScore} / 100</div>
          <div class="text-[10px] text-slate-400">Calculated based on SLA & Tier</div>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-300 uppercase font-mono">Order Line Items & Stock Allocation</h4>
        <div class="bg-dark-950 p-3 rounded-xl border border-dark-700 divide-y divide-dark-800">
          ${order.items.map(it => `
            <div class="py-2 flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-slate-200">${it.name}</div>
                <div class="font-mono text-[10px] text-slate-400">SKU: ${it.sku}</div>
              </div>
              <div class="text-right">
                <div class="font-mono font-bold ${(it.allocatedQty || 0) < it.qty ? 'text-rose-400' : 'text-emerald-400'}">
                  ${it.allocatedQty || 0} / ${it.qty} Allocated
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${order.notes ? `
        <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono">
          <i class="fa-solid fa-info-circle mr-1"></i> System Note: ${order.notes}
        </div>
      ` : ''}

      <div class="flex items-center justify-end space-x-2 pt-2 border-t border-dark-700">
        <button id="btn-view-on-map" class="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-cyan-400 font-bold text-xs border border-dark-700">
          🗺️ View Pick Path on 2D Map
        </button>
        ${order.status === "SHORTAGE_EXCEPTION" ? `
          <button id="btn-modal-snatch" class="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs">
            ⚡ Run Autonomous Reallocation
          </button>
        ` : ''}
      </div>
    </div>
  `;

  modalContainer.classList.remove('hidden');
  setTimeout(() => modalContainer.classList.remove('opacity-0'), 10);

  const btnClose = modalContent.querySelector('#btn-close-modal');
  btnClose.addEventListener('click', () => closeModal());

  const btnMap = modalContent.querySelector('#btn-view-on-map');
  if (btnMap) {
    btnMap.addEventListener('click', () => {
      closeModal();
      stateStore.triggerEvent("SHOW_ORDER_ON_MAP", order.id);
    });
  }

  const btnSnatch = modalContent.querySelector('#btn-modal-snatch');
  if (btnSnatch) {
    btnSnatch.addEventListener('click', () => {
      closeModal();
      stateStore.resolveShortageForOrder(order.id);
    });
  }
}

function openCreateOrderModal(stateStore) {
  const modalContainer = document.getElementById('modal-container');
  const modalContent = document.getElementById('modal-content');
  const inventory = stateStore.getInventory();

  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-dark-700 pb-3">
        <h3 class="text-lg font-extrabold text-white">Create New Customer Order</h3>
        <button id="btn-close-modal" class="text-slate-400 hover:text-white">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <form id="form-create-order" class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-300 mb-1">Customer Name / Organization</label>
          <input type="text" id="input-customer" required placeholder="e.g. Cyberdyne Logistics" class="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Customer Tier</label>
            <select id="input-tier" class="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-slate-200">
              <option value="VIP">VIP (High Priority)</option>
              <option value="Standard">Standard Tier</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">SLA Shipping Target</label>
            <select id="input-sla" class="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-slate-200">
              <option value="VIP Express (2-Hour)">VIP Express (2-Hour)</option>
              <option value="Same-Day Express">Same-Day Express</option>
              <option value="Standard Ground (48-Hour)">Standard Ground</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-300 mb-1">Select Product SKU & Quantity</label>
          <div class="grid grid-cols-3 gap-2">
            <select id="input-sku" class="col-span-2 bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-slate-200">
              ${inventory.map(i => `<option value="${i.sku}">${i.sku} — ${i.name} (Avail: ${i.available})</option>`).join('')}
            </select>
            <input type="number" id="input-qty" min="1" max="100" value="5" class="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-slate-200">
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-3 border-t border-dark-700">
          <button type="button" id="btn-cancel-create" class="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg">Submit & Process Allocation</button>
        </div>
      </form>
    </div>
  `;

  modalContainer.classList.remove('hidden');
  setTimeout(() => modalContainer.classList.remove('opacity-0'), 10);

  modalContent.querySelector('#btn-close-modal').addEventListener('click', closeModal);
  modalContent.querySelector('#btn-cancel-create').addEventListener('click', closeModal);

  const form = modalContent.querySelector('#form-create-order');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const customer = form.querySelector('#input-customer').value;
    const tier = form.querySelector('#input-tier').value;
    const sla = form.querySelector('#input-sla').value;
    const sku = form.querySelector('#input-sku').value;
    const qty = parseInt(form.querySelector('#input-qty').value, 10);

    const inv = inventory.find(i => i.sku && i.sku.toUpperCase() === sku.toUpperCase());

    stateStore.createNewOrder({
      customer,
      customerTier: tier,
      slaType: sla,
      items: [{ sku, name: inv ? inv.name : sku, qty, unitCost: inv ? inv.unitCost : 100 }]
    });

    closeModal();
  });
}

function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.classList.add('opacity-0');
  setTimeout(() => modalContainer.classList.add('hidden'), 200);
}
