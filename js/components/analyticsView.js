// Operational Analytics & Bottleneck View Component

export function renderAnalyticsView(container, stateStore) {
  const orders = stateStore.getOrders();
  const inventory = stateStore.getInventory();

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Control Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-4 rounded-2xl border border-dark-700/60 glass-card">
        <div>
          <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <i class="fa-solid fa-chart-pie text-cyan-400"></i>
            <span>Operational Analytics & Bottleneck Detector</span>
          </h2>
          <p class="text-xs text-slate-400">Real-Time Throughput Analytics, SLA Accuracy & Bottleneck Diagnostics</p>
        </div>

        <div class="flex items-center space-x-2 font-mono text-xs">
          <span class="text-slate-400">Time Range:</span>
          <span class="px-3 py-1 rounded-lg bg-dark-850 border border-dark-700 text-cyan-400 font-bold">Today (Shift A)</span>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Chart 1: Hourly Fulfillment Velocity -->
        <div class="glass-card p-5 rounded-2xl border border-dark-700/60 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-white">Fulfillment Velocity (Orders / Hour)</h3>
            <span class="text-xs font-mono text-emerald-400 font-bold">+18.5% vs SLA</span>
          </div>
          <div class="h-64 relative w-full">
            <canvas id="chart-velocity"></canvas>
          </div>
        </div>

        <!-- Chart 2: Zone Storage Allocation Distribution -->
        <div class="glass-card p-5 rounded-2xl border border-dark-700/60 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-white">Zone Inventory Allocation Heatmap</h3>
            <span class="text-xs font-mono text-cyan-400 font-bold">2,410 Bins</span>
          </div>
          <div class="h-64 relative w-full">
            <canvas id="chart-zones"></canvas>
          </div>
        </div>

      </div>

      <!-- Bottleneck Diagnostic Matrix -->
      <div class="glass-card p-5 rounded-2xl border border-dark-700/60 space-y-4">
        <h3 class="text-sm font-extrabold text-white">AI Bottleneck & Efficiency Diagnostics</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-dark-950 p-4 rounded-xl border border-dark-700 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300">Picker Travel Efficiency</span>
              <span class="text-xs font-mono font-bold text-emerald-400">94.2%</span>
            </div>
            <p class="text-[11px] text-slate-400">A* path optimization reduced picker walking distance by 1.8km per shift.</p>
          </div>

          <div class="bg-dark-950 p-4 rounded-xl border border-dark-700 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300">Stock Reallocation Latency</span>
              <span class="text-xs font-mono font-bold text-cyan-400">120ms</span>
            </div>
            <p class="text-[11px] text-slate-400">Autonomous shortage snatch algorithm resolves allocation conflicts in milliseconds.</p>
          </div>

          <div class="bg-dark-950 p-4 rounded-xl border border-dark-700 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300">Quarantine Resolution Time</span>
              <span class="text-xs font-mono font-bold text-amber-400">4.5 min</span>
            </div>
            <p class="text-[11px] text-slate-400">Damaged goods exceptions auto-locked and rerouted to secondary bins.</p>
          </div>
        </div>
      </div>

    </div>
  `;

  // Render Chart.js charts
  setTimeout(() => {
    const ctxVelocity = container.querySelector('#chart-velocity');
    if (ctxVelocity && window.Chart) {
      new window.Chart(ctxVelocity, {
        type: 'line',
        data: {
          labels: ['04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00'],
          datasets: [
            {
              label: 'Orders Fulfilled',
              data: [12, 28, 45, 62, 58, 74, 85],
              borderColor: '#00f2fe',
              backgroundColor: 'rgba(0, 242, 254, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'SLA Target Baseline',
              data: [20, 20, 40, 40, 60, 60, 80],
              borderColor: '#f59e0b',
              borderDash: [5, 5],
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } } } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51,65,85,0.3)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51,65,85,0.3)' } }
          }
        }
      });
    }

    const ctxZones = container.querySelector('#chart-zones');
    if (ctxZones && window.Chart) {
      new window.Chart(ctxZones, {
        type: 'doughnut',
        data: {
          labels: ['Zone A (Electronics)', 'Zone B (Apparel)', 'Zone C (Bulk)', 'Zone D (Cold)', 'Zone E (Hazmat)'],
          datasets: [{
            data: [35, 25, 20, 12, 8],
            backgroundColor: ['#0284c7', '#a855f7', '#f59e0b', '#10b981', '#f43f5e']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } } } }
        }
      });
    }
  }, 50);
}
