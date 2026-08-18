// Main Application Entrypoint & Router

import { stateStore } from './state.js';
import { initHeader } from './components/header.js';
import { initSimulatorPanel } from './components/simulatorPanel.js';
import { renderDashboardView } from './components/dashboardView.js';
import { renderOrdersView } from './components/ordersView.js';
import { renderInventoryView } from './components/inventoryView.js';
import { renderWarehouseMapView } from './components/warehouseMapView.js';
import { renderPickerSimView } from './components/pickerSimView.js';
import { renderDispatchView } from './components/dispatchView.js';
import { renderAnalyticsView } from './components/analyticsView.js';

class VortexApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.cleanupCurrentView = null;

    this.init();
  }

  init() {
    // Initialize Header & Simulator Panel
    initHeader(stateStore);
    initSimulatorPanel(stateStore);

    // Setup Sidebar Tab Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Handle Custom System Events
    stateStore.subscribe((eventType, payload) => {
      if (eventType === "SHOW_ORDER_ON_MAP") {
        this.switchTab("warehouse-map");
        setTimeout(() => {
          const selector = document.getElementById('map-order-selector');
          if (selector) {
            selector.value = payload;
            selector.dispatchEvent(new Event('change'));
          }
        }, 100);
      } else if (eventType === "OPEN_CREATE_ORDER_MODAL") {
        this.switchTab("orders");
      }
    });

    // Render Initial View
    this.renderCurrentView();
  }

  switchTab(tabName) {
    if (this.currentTab === tabName) return;

    this.currentTab = tabName;

    // Update active state in sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    const container = document.getElementById('view-container');
    if (!container) return;

    // Call cleanup on unmounting previous view if needed
    if (typeof this.cleanupCurrentView === 'function') {
      this.cleanupCurrentView();
      this.cleanupCurrentView = null;
    }

    container.innerHTML = '';

    switch (this.currentTab) {
      case 'dashboard':
        renderDashboardView(container, stateStore);
        break;
      case 'orders':
        renderOrdersView(container, stateStore);
        break;
      case 'inventory':
        renderInventoryView(container, stateStore);
        break;
      case 'warehouse-map':
        this.cleanupCurrentView = renderWarehouseMapView(container, stateStore);
        break;
      case 'picker-sim':
        renderPickerSimView(container, stateStore);
        break;
      case 'dispatch':
        renderDispatchView(container, stateStore);
        break;
      case 'analytics':
        renderAnalyticsView(container, stateStore);
        break;
      default:
        renderDashboardView(container, stateStore);
    }
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.vortexApp = new VortexApp();
});
