// Header Component Controller

export function initHeader(stateStore) {
  const clockEl = document.getElementById('header-clock');
  const simToggleBtn = document.getElementById('btn-toggle-sim');
  const simDrawer = document.getElementById('simulation-drawer');
  const simCloseBtn = document.getElementById('btn-close-sim');
  const roleSelector = document.getElementById('role-selector');

  // Live Clock
  setInterval(() => {
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString();
    }
  }, 1000);

  // Toggle Simulation Panel Drawer
  if (simToggleBtn && simDrawer) {
    simToggleBtn.addEventListener('click', () => {
      simDrawer.classList.toggle('translate-x-full');
    });
  }

  if (simCloseBtn && simDrawer) {
    simCloseBtn.addEventListener('click', () => {
      simDrawer.classList.add('translate-x-full');
    });
  }

  // Role Selector Switcher Event
  if (roleSelector) {
    roleSelector.addEventListener('change', (e) => {
      const role = e.target.value;
      stateStore.triggerEvent("ROLE_CHANGED", role);
    });
  }

  // Update Header Quick Stats on state change
  const updateStats = () => {
    const orders = stateStore.getOrders();
    const inv = stateStore.getInventory();

    // Risk SKUs
    const lowStockCount = inv.filter(i => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK").length;
    const stockRiskEl = document.getElementById('header-stock-risk');
    if (stockRiskEl) {
      stockRiskEl.textContent = `${lowStockCount > 0 ? 'WARNING' : 'LOW'} (${lowStockCount} SKUs)`;
      stockRiskEl.className = `text-xs font-mono font-bold ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`;
    }

    // Pending Orders count badge
    const pendingOrdersCount = orders.filter(o => o.status !== "DISPATCHED").length;
    const badgePending = document.getElementById('badge-pending-orders');
    if (badgePending) badgePending.textContent = pendingOrdersCount;

    // Low stock badge
    const badgeLow = document.getElementById('badge-low-stock');
    if (badgeLow) badgeLow.textContent = lowStockCount;
  };

  stateStore.subscribe(updateStats);
  updateStats();
}
