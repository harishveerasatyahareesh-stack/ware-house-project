// 2D Interactive Warehouse Floor Map Canvas Engine

import { warehouseZones, calculatePickRoute } from './routeOptimizer.js';

export class WarehouseCanvasRenderer {
  constructor(canvasElement, state) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.state = state;
    this.selectedOrderId = null;
    this.hoveredBin = null;
    this.animationFrameId = null;

    this.initCanvas();
    this.setupEventListeners();
  }

  initCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const displayWidth = rect.width || 800;
    const displayHeight = rect.height || 540;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';

    this.ctx.scale(dpr, dpr);
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    window.addEventListener('resize', () => this.initCanvas());
  }

  setSelectedOrder(orderId) {
    this.selectedOrderId = orderId;
    this.render();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    for (const zone of warehouseZones) {
      if (!zone.bins) continue;
      for (const bin of zone.bins) {
        const dist = Math.hypot(bin.x - mouseX, bin.y - mouseY);
        if (dist < 18) {
          found = bin;
          break;
        }
      }
    }

    if (this.hoveredBin !== found) {
      this.hoveredBin = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';
      this.render();
    }
  }

  handleClick(e) {
    if (this.hoveredBin) {
      const inv = this.state.getInventory().find(i => i.binLocation === this.hoveredBin.id || i.sku === this.hoveredBin.sku);
      if (inv) {
        this.state.triggerEvent("INSPECT_BIN", inv);
      }
    }
  }

  startAnimationLoop() {
    const animate = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  stopAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  render() {
    const ctx = this.ctx;
    const width = this.displayWidth;
    const height = this.displayHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw Zones
    for (const zone of warehouseZones) {
      this.drawZone(zone);
    }

    // Draw Selected Order Pick Route
    if (this.selectedOrderId) {
      const order = this.state.getOrders().find(o => o.id === this.selectedOrderId);
      if (order) {
        const waypoints = calculatePickRoute(order, this.state.getInventory());
        this.drawPickRoute(waypoints);
      }
    }

    // Draw Pickers
    const pickers = this.state.getPickers();
    pickers.forEach(p => this.drawPicker(p));

    // Draw Tooltip if hovering a bin
    if (this.hoveredBin) {
      this.drawBinTooltip(this.hoveredBin);
    }
  }

  drawZone(zone) {
    const ctx = this.ctx;
    const { bounds, name, color, bins, stations, docks } = zone;

    // Zone Background fill
    ctx.save();
    ctx.fillStyle = color + "15"; // sleek opacity
    ctx.strokeStyle = color + "70";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, 12);
    ctx.fill();
    ctx.stroke();

    // Zone Title Header Bar
    ctx.fillStyle = color + "30";
    ctx.beginPath();
    ctx.roundRect(bounds.x, bounds.y, bounds.width, 28, [12, 12, 0, 0]);
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(name, bounds.x + 12, bounds.y + 18);

    // Draw Bins
    if (bins) {
      bins.forEach(bin => {
        const inv = this.state.getInventory().find(i => i.binLocation === bin.id || i.sku === bin.sku);
        const isQuarantined = inv && inv.status === "QUARANTINED";
        const isLowStock = inv && inv.status === "LOW_STOCK";

        ctx.beginPath();
        ctx.arc(bin.x, bin.y, 11, 0, Math.PI * 2);

        if (isQuarantined) {
          ctx.fillStyle = "#f43f5e"; // red
          ctx.strokeStyle = "#ffffff";
        } else if (isLowStock) {
          ctx.fillStyle = "#f59e0b"; // amber
          ctx.strokeStyle = "#fef08a";
        } else {
          ctx.fillStyle = color;
          ctx.strokeStyle = "#ffffff";
        }

        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Inner core dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(bin.x, bin.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Bin Label
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(bin.name, bin.x, bin.y + 24);
      });
    }

    // Draw Stations / Docks
    if (stations) {
      stations.forEach(st => {
        ctx.fillStyle = "#6366f1";
        ctx.beginPath();
        ctx.roundRect(st.x - 14, st.y - 14, 28, 28, 6);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(st.name, st.x, st.y + 24);
      });
    }

    if (docks) {
      docks.forEach(dk => {
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.roundRect(dk.x - 45, dk.y - 12, 90, 24, 6);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(dk.name, dk.x, dk.y + 4);
      });
    }

    ctx.restore();
  }

  drawPickRoute(waypoints) {
    if (waypoints.length < 2) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = "#00f2fe"; // Neon Cyan
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);

    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);

    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Waypoint nodes with clean background badge tags
    waypoints.forEach((wp, idx) => {
      const nodeColor = idx === 0 ? "#10b981" : (idx === waypoints.length - 1 ? "#a855f7" : "#00f2fe");

      // Outer halo
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor + "40";
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Badge Label Box
      const tagText = `#${idx + 1} ${wp.shortTag || wp.label || ''}`;
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      const textWidth = ctx.measureText(tagText).width;
      const boxWidth = textWidth + 12;
      const boxHeight = 18;
      const boxX = wp.x - boxWidth / 2;
      const boxY = wp.y - 26;

      // Label background box
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = nodeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
      ctx.fill();
      ctx.stroke();

      // Label text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(tagText, wp.x, boxY + 13);
    });

    ctx.restore();
  }

  drawPicker(picker) {
    const ctx = this.ctx;
    ctx.save();

    // Pulse glow around active picker
    ctx.beginPath();
    ctx.arc(picker.x, picker.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 242, 254, 0.25)";
    ctx.fill();

    // Picker icon circle
    ctx.beginPath();
    ctx.arc(picker.x, picker.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = picker.status === "PICKING" ? "#10b981" : "#0284c7";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(picker.name.split(' ')[0], picker.x, picker.y - 18);

    ctx.restore();
  }

  drawBinTooltip(bin) {
    const ctx = this.ctx;
    const inv = this.state.getInventory().find(i => i.binLocation === bin.id || i.sku === bin.sku);
    if (!inv) return;

    ctx.save();
    const tooltipX = Math.min(bin.x + 15, this.displayWidth - 220);
    const tooltipY = Math.max(bin.y - 65, 10);

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, 210, 75, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${inv.sku} (${bin.name})`, tooltipX + 10, tooltipY + 20);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(inv.name.substring(0, 28) + "...", tooltipX + 10, tooltipY + 36);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`OnHand: ${inv.onHand} | Available: ${inv.available}`, tooltipX + 10, tooltipY + 54);
    ctx.fillText(`Status: ${inv.status}`, tooltipX + 10, tooltipY + 67);

    ctx.restore();
  }
}
