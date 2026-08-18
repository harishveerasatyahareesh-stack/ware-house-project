// Hackathon Demo Simulator Drawer Component Controller

export function initSimulatorPanel(stateStore) {
  const auditLogEl = document.getElementById('sim-audit-log');
  const btnInjectShortage = document.getElementById('btn-inject-shortage');
  const btnInjectDamaged = document.getElementById('btn-inject-damaged');
  const btnInjectSurge = document.getElementById('btn-inject-surge');
  const btnClearLogs = document.getElementById('btn-clear-logs');
  const simTogglePlay = document.getElementById('sim-toggle-play');
  const simPlayText = document.getElementById('sim-play-text');
  const simStatusBadge = document.getElementById('sim-status-badge');
  const simSpeedBtns = document.querySelectorAll('.sim-speed-btn');

  let simRunning = true;
  let simSpeed = 1;

  // Render initial audit logs
  function renderAuditLogs() {
    if (!auditLogEl) return;
    const logs = stateStore.getAuditLogs();

    auditLogEl.innerHTML = logs.map(log => `
      <div class="p-2 rounded bg-dark-900 border ${getLogBorderClass(log.severity)} space-y-1">
        <div class="flex items-center justify-between text-[10px]">
          <span class="font-bold font-mono text-cyan-400">${log.timestamp}</span>
          <span class="px-1.5 py-0.2 rounded font-bold ${getLogSeverityBadge(log.severity)}">${log.type}</span>
        </div>
        <div class="text-[11px] text-slate-300 leading-snug">${log.message}</div>
      </div>
    `).join('');
  }

  stateStore.subscribe((eventType, payload) => {
    if (eventType === "AUDIT_LOG_ADDED" || eventType === "STATE_RESET") {
      renderAuditLogs();
    }
  });
  renderAuditLogs();

  // Controls
  if (simTogglePlay) {
    simTogglePlay.addEventListener('click', () => {
      simRunning = !simRunning;
      if (simPlayText) simPlayText.textContent = simRunning ? "Pause" : "Play";
      if (simStatusBadge) {
        simStatusBadge.textContent = simRunning ? `RUNNING (${simSpeed}x)` : "PAUSED";
        simStatusBadge.className = `px-2 py-0.5 text-[10px] rounded font-mono font-bold ${simRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`;
      }
    });
  }

  simSpeedBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      simSpeedBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      simSpeed = parseInt(e.target.dataset.speed, 10);
      if (simStatusBadge && simRunning) {
        simStatusBadge.textContent = `RUNNING (${simSpeed}x)`;
      }
    });
  });

  if (btnClearLogs) {
    btnClearLogs.addEventListener('click', () => {
      stateStore.auditLogs = [];
      renderAuditLogs();
    });
  }

  // Inject Scenario 1: Shortage & Stock Reallocation
  if (btnInjectShortage) {
    btnInjectShortage.addEventListener('click', () => {
      stateStore.addAuditLog("SIMULATOR_TRIGGER", null, "⚡ INJECTED SCENARIO: VIP Order Shortage Surge.", "CRITICAL");
      stateStore.resolveShortageForOrder("ORD-9901");
      alert("⚡ SCENARIO INJECTED: Urgent VIP Order ORD-9901 Stock Snatch Algorithm Executed!\nCheck the AI Decision Stream for trace details.");
    });
  }

  // Inject Scenario 2: Damaged Goods Exception
  if (btnInjectDamaged) {
    btnInjectDamaged.addEventListener('click', () => {
      stateStore.addAuditLog("SIMULATOR_TRIGGER", null, "🚨 INJECTED SCENARIO: Picker reported damaged GPU-9090 in Bin A-02.", "CRITICAL");
      stateStore.flagDamagedItem("ORD-9884", "GPU-9090", "Broken Seal in Bin A-02", "Bin A-02");
      alert("🚨 SCENARIO INJECTED: Damaged goods reported in Bin A-02!\nBin quarantined, backup stock allocated, and route updated.");
    });
  }

  // Inject Scenario 3: Flash Order Surge
  if (btnInjectSurge) {
    btnInjectSurge.addEventListener('click', () => {
      for (let i = 1; i <= 3; i++) {
        stateStore.createNewOrder({
          customer: `Surge Tech Client #${i}`,
          customerTier: i === 1 ? "VIP" : "Standard",
          slaType: i === 1 ? "VIP Express (2-Hour)" : "Standard Ground",
          items: [{ sku: "CPU-7950", name: "AMD Ryzen 9 7950X Processor", qty: 4 }]
        });
      }
      alert("📦 SCENARIO INJECTED: 3 Flash Customer Orders spawned simultaneously!");
    });
  }
}

function getLogBorderClass(severity) {
  switch (severity) {
    case "CRITICAL": return "border-rose-500/50 bg-rose-950/20";
    case "WARNING": return "border-amber-500/40 bg-amber-950/10";
    default: return "border-dark-700";
  }
}

function getLogSeverityBadge(severity) {
  switch (severity) {
    case "CRITICAL": return "bg-rose-500/20 text-rose-300";
    case "WARNING": return "bg-amber-500/20 text-amber-300";
    default: return "bg-cyan-500/20 text-cyan-300";
  }
}
