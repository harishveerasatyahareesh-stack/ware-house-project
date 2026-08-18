// Warehouse Floor Map Layout & Pick Path Optimization

export const warehouseZones = [
  {
    id: "zone-a",
    name: "Zone A — High Velocity Electronics",
    color: "#0284c7", // cyan/blue
    bounds: { x: 40, y: 40, width: 240, height: 170 },
    bins: [
      { id: "Bin A-01", name: "A-01", x: 75, y: 110, sku: "SOLAR-INV-500" },
      { id: "Bin A-02", name: "A-02 (GPU)", x: 155, y: 110, sku: "GPU-9090" },
      { id: "Bin A-05", name: "A-05 (CPU)", x: 235, y: 110, sku: "CPU-7950" },
      { id: "Bin A-08", name: "A-08", x: 155, y: 175, sku: "SOLAR-INV-500" }
    ]
  },
  {
    id: "zone-b",
    name: "Zone B — Apparel & Footwear",
    color: "#a855f7", // purple
    bounds: { x: 40, y: 240, width: 240, height: 170 },
    bins: [
      { id: "Bin B-14", name: "B-14 (Parka)", x: 85, y: 310, sku: "HOODIE-BLK-XL" },
      { id: "Bin B-22", name: "B-22 (Shoes)", x: 205, y: 310, sku: "SNEAKER-RUN-10" }
    ]
  },
  {
    id: "zone-c",
    name: "Zone C — Heavy Bulk Storage",
    color: "#f59e0b", // amber
    bounds: { x: 310, y: 40, width: 240, height: 170 },
    bins: [
      { id: "Bin C-01", name: "C-01 (Chemicals)", x: 360, y: 110, sku: "PALLET-DRUM-200" },
      { id: "Bin C-12", name: "C-12 (Overstock)", x: 470, y: 110, sku: "GPU-9090" }
    ]
  },
  {
    id: "zone-d",
    name: "Zone D — Cold Storage",
    color: "#10b981", // emerald
    bounds: { x: 310, y: 240, width: 240, height: 170 },
    bins: [
      { id: "Bin D-04", name: "D-04 (Vaccines)", x: 380, y: 310, sku: "PERISH-VAX-09" }
    ]
  },
  {
    id: "zone-e",
    name: "Zone E — Hazmat Enclosure",
    color: "#f43f5e", // rose
    bounds: { x: 580, y: 40, width: 180, height: 170 },
    bins: [
      { id: "Bin E-02", name: "E-02 (Solvent)", x: 640, y: 110, sku: "HAZMAT-SOLV-A" }
    ]
  },
  {
    id: "packing-hub",
    name: "Packing Hub & QC Stations",
    color: "#6366f1", // indigo
    bounds: { x: 580, y: 240, width: 180, height: 170 },
    stations: [
      { id: "Pack-1", name: "Bay 1", x: 620, y: 310 },
      { id: "Pack-2", name: "Bay 2", x: 700, y: 310 }
    ]
  },
  {
    id: "dispatch-dock",
    name: "Dispatch Loading Docks (Bays 1–3)",
    color: "#38bdf8", // cyan
    bounds: { x: 40, y: 435, width: 720, height: 75 },
    docks: [
      { id: "Dock-1", name: "FedEx Bay", x: 160, y: 475 },
      { id: "Dock-2", name: "DHL Bay", x: 400, y: 475 },
      { id: "Dock-3", name: "Freight Bay", x: 640, y: 475 }
    ]
  }
];

/**
 * Calculates an optimized picking route (waypoints) for an order
 * based on item bin coordinates in the warehouse map.
 */
export function calculatePickRoute(order, inventory) {
  const startPoint = { x: 400, y: 450, label: "Start Hub", shortTag: "Start Hub" };
  const waypoints = [startPoint];

  if (!order || !order.items || order.items.length === 0) return waypoints;

  order.items.forEach(item => {
    const invItem = inventory.find(i => i.sku === item.sku);
    if (!invItem) return;

    for (const zone of warehouseZones) {
      if (!zone.bins) continue;
      const bin = zone.bins.find(b => b.id === invItem.binLocation || b.sku === invItem.sku);
      if (bin) {
        waypoints.push({
          x: bin.x,
          y: bin.y,
          label: `${bin.name} (${item.qty}x)`,
          shortTag: `${bin.name.split(' ')[0]} (${item.qty}x)`,
          sku: item.sku,
          zone: zone.name
        });
        break;
      }
    }
  });

  // End point at Packing Hub Bay 2
  waypoints.push({ x: 700, y: 310, label: "Packing Bay 2", shortTag: "Pack Bay 2" });

  return waypoints;
}
