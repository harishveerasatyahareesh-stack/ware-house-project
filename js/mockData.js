// Initial Mock Data for VortexWarehouse OS

export const initialInventory = [
  {
    sku: "GPU-9090",
    name: "NVIDIA RTX 4090 Workstation Edition",
    category: "Electronics",
    zone: "Zone A (Electronics)",
    binLocation: "Bin A-02",
    onHand: 15,
    allocated: 12,
    available: 3,
    unitCost: 1599,
    reorderPoint: 8,
    safetyStock: 4,
    leadTimeDays: 5,
    dailyVelocity: 2.2,
    status: "LOW_STOCK", // IN_STOCK, LOW_STOCK, OUT_OF_STOCK, QUARANTINED
    quarantinedQty: 0
  },
  {
    sku: "CPU-7950",
    name: "AMD Ryzen 9 7950X Processor",
    category: "Electronics",
    zone: "Zone A (Electronics)",
    binLocation: "Bin A-05",
    onHand: 42,
    allocated: 18,
    available: 24,
    unitCost: 549,
    reorderPoint: 15,
    safetyStock: 8,
    leadTimeDays: 3,
    dailyVelocity: 4.1,
    status: "IN_STOCK",
    quarantinedQty: 0
  },
  {
    sku: "HOODIE-BLK-XL",
    name: "TechWear Waterproof Tactical Parka (Black/XL)",
    category: "Apparel",
    zone: "Zone B (Apparel)",
    binLocation: "Bin B-14",
    onHand: 85,
    allocated: 20,
    available: 65,
    unitCost: 89,
    reorderPoint: 25,
    safetyStock: 10,
    leadTimeDays: 7,
    dailyVelocity: 5.5,
    status: "IN_STOCK",
    quarantinedQty: 0
  },
  {
    sku: "SNEAKER-RUN-10",
    name: "Vortex Aero Cushion Running Shoes (US 10)",
    category: "Apparel",
    zone: "Zone B (Apparel)",
    binLocation: "Bin B-22",
    onHand: 18,
    allocated: 16,
    available: 2,
    unitCost: 120,
    reorderPoint: 20,
    safetyStock: 5,
    leadTimeDays: 4,
    dailyVelocity: 3.8,
    status: "LOW_STOCK",
    quarantinedQty: 0
  },
  {
    sku: "PALLET-DRUM-200",
    name: "Industrial Lubricant Chemical Drum (200L)",
    category: "Bulk Storage",
    zone: "Zone C (Bulk)",
    binLocation: "Bin C-01",
    onHand: 60,
    allocated: 15,
    available: 45,
    unitCost: 450,
    reorderPoint: 12,
    safetyStock: 6,
    leadTimeDays: 10,
    dailyVelocity: 1.5,
    status: "IN_STOCK",
    quarantinedQty: 0
  },
  {
    sku: "PERISH-VAX-09",
    name: "Temperature Controlled Vaccine Vials (Box 50)",
    category: "Perishables",
    zone: "Zone D (Cold Storage)",
    binLocation: "Bin D-04",
    onHand: 30,
    allocated: 25,
    available: 5,
    unitCost: 1250,
    reorderPoint: 15,
    safetyStock: 10,
    leadTimeDays: 2,
    dailyVelocity: 6.0,
    status: "LOW_STOCK",
    quarantinedQty: 0
  },
  {
    sku: "HAZMAT-SOLV-A",
    name: "High Purity Chemical Solvent (Type-A 25L)",
    category: "Hazmat",
    zone: "Zone E (Hazmat)",
    binLocation: "Bin E-02",
    onHand: 14,
    allocated: 4,
    available: 10,
    unitCost: 310,
    reorderPoint: 10,
    safetyStock: 4,
    leadTimeDays: 6,
    dailyVelocity: 1.1,
    status: "IN_STOCK",
    quarantinedQty: 0
  },
  {
    sku: "SOLAR-INV-500",
    name: "Vortex Micro Inverter 500W Solar Pack",
    category: "Electronics",
    zone: "Zone A (Electronics)",
    binLocation: "Bin A-08",
    onHand: 0,
    allocated: 0,
    available: 0,
    unitCost: 280,
    reorderPoint: 10,
    safetyStock: 5,
    leadTimeDays: 7,
    dailyVelocity: 2.0,
    status: "OUT_OF_STOCK",
    quarantinedQty: 0
  }
];

export const initialOrders = [
  {
    id: "ORD-9901",
    customer: "Apex Robotics Systems",
    customerTier: "VIP", // VIP, Standard
    slaType: "VIP Express (2-Hour)", // VIP Express (2-Hour), Same-Day, Standard Ground
    slaHoursRemaining: 1.5,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    totalValue: 15990,
    items: [
      { sku: "GPU-9090", name: "NVIDIA RTX 4090 Workstation Edition", qty: 10, allocatedQty: 3 }
    ],
    status: "SHORTAGE_EXCEPTION", // CREATED, ALLOCATED, PICKING, PACKING, QC_CHECK, DISPATCHED, SHORTAGE_EXCEPTION
    priorityScore: 98,
    assignedPicker: null,
    carrier: "FedEx Priority Overnight",
    notes: "Requires 10x GPU-9090. Only 3 available in stock! Shortage detected."
  },
  {
    id: "ORD-9884",
    customer: "Metro Digital Labs",
    customerTier: "Standard",
    slaType: "Standard Ground (48-Hour)",
    slaHoursRemaining: 42.0,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    totalValue: 7995,
    items: [
      { sku: "GPU-9090", name: "NVIDIA RTX 4090 Workstation Edition", qty: 5, allocatedQty: 5 }
    ],
    status: "ALLOCATED",
    priorityScore: 42,
    assignedPicker: "Picker-1 (John)",
    carrier: "UPS Ground",
    notes: "Holding 5x allocated GPU-9090 units."
  },
  {
    id: "ORD-9888",
    customer: "Quantum Data Corp",
    customerTier: "VIP",
    slaType: "Same-Day Express",
    slaHoursRemaining: 3.2,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    totalValue: 3294,
    items: [
      { sku: "CPU-7950", name: "AMD Ryzen 9 7950X Processor", qty: 6, allocatedQty: 6 }
    ],
    status: "PICKING",
    priorityScore: 89,
    assignedPicker: "Picker-2 (Elena)",
    carrier: "DHL Express",
    notes: "Picker currently in Zone A-05."
  },
  {
    id: "ORD-9870",
    customer: "Urban Tech Outfitters",
    customerTier: "Standard",
    slaType: "Standard Ground (48-Hour)",
    slaHoursRemaining: 18.0,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    totalValue: 1068,
    items: [
      { sku: "HOODIE-BLK-XL", name: "TechWear Waterproof Tactical Parka", qty: 12, allocatedQty: 12 }
    ],
    status: "PACKING",
    priorityScore: 65,
    assignedPicker: "Picker-3 (Marcus)",
    carrier: "FedEx Ground",
    notes: "At Packing Station #2."
  },
  {
    id: "ORD-9865",
    customer: "BioLife Healthcare",
    customerTier: "VIP",
    slaType: "VIP Express (2-Hour)",
    slaHoursRemaining: 0.8,
    createdAt: new Date(Date.now() - 70 * 60000).toISOString(),
    totalValue: 6250,
    items: [
      { sku: "PERISH-VAX-09", name: "Temperature Controlled Vaccine Vials", qty: 5, allocatedQty: 5 }
    ],
    status: "QC_CHECK",
    priorityScore: 99,
    assignedPicker: "Picker-4 (Sarah)",
    carrier: "ColdChain Express Courier",
    notes: "Urgent medical cargo, QC temp verification in progress."
  },
  {
    id: "ORD-9850",
    customer: "Global Energy Logistics",
    customerTier: "Standard",
    slaType: "Standard Ground",
    slaHoursRemaining: 24.0,
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
    totalValue: 2700,
    items: [
      { sku: "PALLET-DRUM-200", name: "Industrial Lubricant Chemical Drum", qty: 6, allocatedQty: 6 }
    ],
    status: "DISPATCHED",
    priorityScore: 50,
    assignedPicker: "Picker-1 (John)",
    carrier: "FreightLine Heavy Truck",
    trackingNumber: "TRK-FL-8839210",
    dispatchedAt: new Date(Date.now() - 1 * 3600000).toISOString()
  }
];

export const initialPickers = [
  { id: "P-1", name: "John Miller", zone: "Zone A", status: "PICKING", activeOrderId: "ORD-9884", x: 180, y: 120 },
  { id: "P-2", name: "Elena Rostova", zone: "Zone A", status: "PICKING", activeOrderId: "ORD-9888", x: 220, y: 140 },
  { id: "P-3", name: "Marcus Vance", zone: "Packing Hub", status: "PACKING", activeOrderId: "ORD-9870", x: 550, y: 350 },
  { id: "P-4", name: "Sarah Lin", zone: "Zone D (Cold)", status: "QC_CHECK", activeOrderId: "ORD-9865", x: 420, y: 220 },
  { id: "P-5", name: "David Kim", zone: "Zone B", status: "IDLE", activeOrderId: null, x: 120, y: 320 }
];

export const initialAuditLogs = [
  {
    id: "LOG-101",
    timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString(),
    type: "SHORTAGE_DETECTED",
    orderId: "ORD-9901",
    message: "🚨 SHORTAGE DETECTED: VIP Order ORD-9901 requires 10x GPU-9090 but only 3 available in stock. Low-priority reallocation suggested.",
    severity: "CRITICAL"
  },
  {
    id: "LOG-100",
    timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString(),
    type: "ORDER_CREATED",
    orderId: "ORD-9901",
    message: "📦 Order ORD-9901 created by Apex Robotics Systems (VIP Tier). SLA Target: 2-Hour Express.",
    severity: "INFO"
  },
  {
    id: "LOG-99",
    timestamp: new Date(Date.now() - 60 * 60000).toLocaleTimeString(),
    type: "ROP_ALERT",
    orderId: null,
    message: "⚠️ ROP ALERT: SKU SNEAKER-RUN-10 reached Reorder Point (Available: 2, ROP: 20). EOQ Recommendation: 85 units.",
    severity: "WARNING"
  }
];
