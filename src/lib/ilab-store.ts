export type ILabStatus = "active" | "draft" | "completed" | "pending" | "archived";

export type ClientRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
};

export type SupplierRecord = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  leadTimeDays: number;
};

export type PartRecord = {
  id: string;
  name: string;
  brand: string;
  model: string;
  quantity: number;
  unitCost: number;
  supplierId: string;
  status: ILabStatus;
};

export type DeviceRecord = {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  serialNumber: string;
  issue: string;
  status: ILabStatus;
};

export type ProjectRecord = {
  id: string;
  clientId: string;
  deviceId: string;
  title: string;
  dueDate: string;
  status: ILabStatus;
  estimate: number;
};

export type DraftProjectRecord = {
  id: string;
  clientName: string;
  deviceName: string;
  intakeNotes: string;
  createdAt: string;
};

export type OrderRecord = {
  id: string;
  supplierId: string;
  partId: string;
  quantity: number;
  orderedAt: string;
  status: ILabStatus;
};

export type CashierRecord = {
  id: string;
  label: string;
  amount: number;
  category: "sale" | "refund" | "expense";
  createdAt: string;
};

export type ILabWorkspace = {
  clients: ClientRecord[];
  suppliers: SupplierRecord[];
  parts: PartRecord[];
  devices: DeviceRecord[];
  projects: ProjectRecord[];
  draftProjects: DraftProjectRecord[];
  orders: OrderRecord[];
  cashierEntries: CashierRecord[];
};

const STORAGE_KEY = "ilab-web-workspace";

const defaultWorkspace: ILabWorkspace = {
  clients: [
    {
      id: "cl-1001",
      firstName: "Maya",
      lastName: "Levi",
      email: "maya.levi@northstar.example",
      phone: "+972-54-800-1201",
      company: "Northstar Dental",
      notes: "Prefers pickup updates by WhatsApp.",
    },
    {
      id: "cl-1002",
      firstName: "Daniel",
      lastName: "Cohen",
      email: "daniel.cohen@vertex.example",
      phone: "+972-52-991-1188",
      company: "Vertex Lab Systems",
      notes: "Quarterly maintenance contract.",
    },
  ],
  suppliers: [
    {
      id: "sup-1001",
      name: "MedCore Supply",
      contact: "Hila Barak",
      email: "hila@medcore.example",
      phone: "+972-3-555-8112",
      leadTimeDays: 4,
    },
    {
      id: "sup-1002",
      name: "Precision Parts EU",
      contact: "Erik Holst",
      email: "erik@precisionparts.example",
      phone: "+45-44-990-100",
      leadTimeDays: 9,
    },
  ],
  parts: [
    {
      id: "part-1001",
      name: "Optical Sensor",
      brand: "Orion",
      model: "S-4",
      quantity: 8,
      unitCost: 84,
      supplierId: "sup-1001",
      status: "active",
    },
    {
      id: "part-1002",
      name: "Cooling Fan",
      brand: "Apex",
      model: "CF-12",
      quantity: 2,
      unitCost: 22,
      supplierId: "sup-1002",
      status: "pending",
    },
  ],
  devices: [
    {
      id: "dev-1001",
      clientId: "cl-1001",
      brand: "Carestream",
      model: "CS 3600",
      serialNumber: "CS3600-8841",
      issue: "Intermittent scan freezes during calibration.",
      status: "active",
    },
    {
      id: "dev-1002",
      clientId: "cl-1002",
      brand: "3Shape",
      model: "TRIOS 5",
      serialNumber: "TRIOS5-0912",
      issue: "Battery module replacement.",
      status: "pending",
    },
  ],
  projects: [
    {
      id: "pr-1001",
      clientId: "cl-1001",
      deviceId: "dev-1001",
      title: "Scanner stability repair",
      dueDate: "2026-06-29",
      status: "active",
      estimate: 1250,
    },
    {
      id: "pr-1002",
      clientId: "cl-1002",
      deviceId: "dev-1002",
      title: "Battery and diagnostics service",
      dueDate: "2026-07-02",
      status: "pending",
      estimate: 640,
    },
  ],
  draftProjects: [
    {
      id: "dp-1001",
      clientName: "Rina Avital",
      deviceName: "Medit i700",
      intakeNotes: "Customer approved quote verbally, awaiting device drop-off.",
      createdAt: "2026-06-22",
    },
  ],
  orders: [
    {
      id: "ord-1001",
      supplierId: "sup-1001",
      partId: "part-1002",
      quantity: 6,
      orderedAt: "2026-06-21",
      status: "pending",
    },
  ],
  cashierEntries: [
    {
      id: "cash-1001",
      label: "Project deposit / Northstar Dental",
      amount: 500,
      category: "sale",
      createdAt: "2026-06-20",
    },
    {
      id: "cash-1002",
      label: "Courier shipment to supplier",
      amount: -68,
      category: "expense",
      createdAt: "2026-06-21",
    },
  ],
};

function cloneDefaultWorkspace() {
  return JSON.parse(JSON.stringify(defaultWorkspace)) as ILabWorkspace;
}

export function getDefaultWorkspace() {
  return cloneDefaultWorkspace();
}

export function loadWorkspace() {
  if (typeof window === "undefined") {
    return cloneDefaultWorkspace();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seeded = cloneDefaultWorkspace();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw) as ILabWorkspace;
  } catch {
    const reset = cloneDefaultWorkspace();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    return reset;
  }
}

export function saveWorkspace(workspace: ILabWorkspace) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export function resetWorkspace() {
  const reset = cloneDefaultWorkspace();
  saveWorkspace(reset);
  return reset;
}