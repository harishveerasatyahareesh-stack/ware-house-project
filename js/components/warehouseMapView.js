// 2D Warehouse Floor Map View Component

import { WarehouseCanvasRenderer } from '../warehouseCanvas.js';

export function renderWarehouseMapView(container, stateStore) {
  const orders = stateStore.getOrders();
  const pickers = stateStore.getPickers();

  container.innerHTML = `
    <div class="space-y-4 h-full flex flex-col">
      
      <!-- Top Control Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900/60 p-4 rounded-2xl border border-dark-700/60 glass-card shrink-0">
        <div>
          <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>2D Warehouse Floor Map & Pick Path Visualizer</span>
            <span class="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">REALTIME A* ROUTE</span>
          </h2>
          <p class="text-xs text-slate-400">Interactive Floor Aisles, Shelf Bins, Active Picker Avatars & Waypoint Paths</p>
        </div>

        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-slate-400 font-mono">Highlight Pick Route:</span>
            <select id="map-order-selector" class="bg-dark-850 border border-dark-700 text-xs font-semibold text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500">
              <option value="">-- Select Order Pick Path --</option>
              ${orders.map(o => `<option value="${o.id}">${o.id} — ${o.customer} (${o.status})</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Main Map Grid (Canvas + Right Info Drawer) -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[500px]">
        
        <!-- Left 2D Canvas Container -->
        <div id="floor-canvas-container" class="lg:col-span-3 rounded-2xl border border-dark-700/80 overflow-hidden relative shadow-2xl flex flex-col">
          <!-- Canvas Top Legend -->
          <div class="bg-dark-900/80 backdrop-blur px-4 py-2 border-b border-dark-700/70 flex items-center justify-between z-10">
            <div class="flex items-center space-x-4 text-[11px] font-mono">
              <div class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
                <span class="text-slate-300">Zone A (Electronics)</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                <span class="text-slate-300">Zone B (Apparel)</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                <span class="text-slate-300">Zone C (Bulk)</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-slate-300">Zone D (Cold)</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span class="text-slate-300">Quarantined Bin</span>
              </div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono">Hover bin for inventory details</div>
          </div>

          <!-- HTML5 Canvas Element -->
          <div class="flex-1 w-full h-full relative">
            <canvas id="warehouse-canvas" class="w-full h-full block"></canvas>
          </div>
        </div>

        <!-- Right Picker & Zone Details Panel -->
        <div class="space-y-4 flex flex-col justify-between">
          <!-- Active Pickers List -->
          <div class="glass-card p-4 rounded-2xl border border-dark-700/60 space-y-3">
            <div class="flex items-center justify-between border-b border-dark-700 pb-2">
              <h3 class="text-xs font-extrabold text-white uppercase font-mono tracking-wider">Floor Pickers On Duty</h3>
              <span class="text-xs font-mono font-bold text-emerald-400">${pickers.length} Active</span>
            </div>

            <div class="space-y-2">
              ${pickers.map(p => `
                <div class="bg-dark-950 p-2.5 rounded-xl border border-dark-800 flex items-center justify-between text-xs">
                  <div class="flex items-center space-x-2">
                    <div class="h-7 w-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-[10px]">
                      ${p.id}
                    </div>
                    <div>
                      <div class="font-bold text-slate-200">${p.name}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${p.zone}</div>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 text-[9px] font-mono font-bold rounded ${p.status === 'PICKING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}">
                    ${p.status}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Selected Zone / Bin Details Box -->
          <div id="zone-inspector-box" class="glass-card p-4 rounded-2xl border border-dark-700/60 space-y-2">
            <h3 class="text-xs font-extrabold text-slate-400 uppercase font-mono">Bin Inspector</h3>
            <p class="text-xs text-slate-400">Click any bin on the 2D map to inspect real-time stock allocation & quarantine status.</p>
          </div>
        </div>

      </div>

    </div>
  `;

  const canvasEl = container.querySelector('#warehouse-canvas');
  const renderer = new WarehouseCanvasRenderer(canvasEl, stateStore);
  renderer.startAnimationLoop();

  const selector = container.querySelector('#map-order-selector');
  selector.addEventListener('change', (e) => {
    renderer.setSelectedOrder(e.target.value);
  });

  // Listen for INSPECT_BIN events from canvas click
  const unsubscribe = stateStore.subscribe((eventType, payload) => {
    if (eventType === "INSPECT_BIN" && payload) {
      const inspectorBox = container.querySelector('#zone-inspector-box');
      if (inspectorBox) {
        inspectorBox.innerHTML = `
          <h3 class="text-xs font-extrabold text-cyan-400 uppercase font-mono">Bin Location ${payload.binLocation}</h3>
          <div class="text-sm font-bold text-white">${payload.name}</div>
          <div class="text-xs text-slate-400 font-mono">SKU: ${payload.sku}</div>
          
          <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-dark-950 p-2 rounded-xl border border-dark-800 mt-2">
            <div><span class="text-slate-400 text-[10px] block">On-Hand:</span> <strong>${payload.onHand}</strong></div>
            <div><span class="text-slate-400 text-[10px] block">Available:</span> <strong class="text-emerald-400">${payload.available}</strong></div>
            <div><span class="text-slate-400 text-[10px] block">Allocated:</span> <strong class="text-cyan-400">${payload.allocated}</strong></div>
            <div><span class="text-slate-400 text-[10px] block">Status:</span> <strong class="${payload.status === 'QUARANTINED' ? 'text-rose-400' : 'text-slate-200'}">${payload.status}</strong></div>
          </div>
        `;
      }
    }
  });

  // Cleanup on view unmount
  return () => {
    renderer.stopAnimationLoop();
    unsubscribe();
  };
}
