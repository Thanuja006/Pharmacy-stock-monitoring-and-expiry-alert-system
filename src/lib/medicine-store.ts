export interface Medicine {
  id: number;
  name: string;
  quantity: number;
  price: number;
  expiryDate: string; // YYYY-MM-DD
}

let nextId = 6;

const initialMedicines: Medicine[] = [
  { id: 1, name: "Paracetamol 500mg", quantity: 150, price: 2.50, expiryDate: "2026-04-10" },
  { id: 2, name: "Amoxicillin 250mg", quantity: 8, price: 5.75, expiryDate: "2026-03-25" },
  { id: 3, name: "Ibuprofen 400mg", quantity: 45, price: 3.20, expiryDate: "2026-12-01" },
  { id: 4, name: "Cetirizine 10mg", quantity: 5, price: 1.80, expiryDate: "2026-04-05" },
  { id: 5, name: "Metformin 500mg", quantity: 200, price: 4.50, expiryDate: "2025-12-15" },
];

let medicines: Medicine[] = [...initialMedicines];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getMedicines(): Medicine[] {
  return [...medicines];
}

export function addMedicine(med: Omit<Medicine, "id">): Medicine {
  const newMed = { ...med, id: nextId++ };
  medicines.push(newMed);
  notify();
  return newMed;
}

export function updateQuantity(id: number, quantity: number): boolean {
  const idx = medicines.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  medicines[idx] = { ...medicines[idx], quantity };
  notify();
  return true;
}

export function deleteMedicine(id: number): boolean {
  const len = medicines.length;
  medicines = medicines.filter((m) => m.id !== id);
  if (medicines.length < len) {
    notify();
    return true;
  }
  return false;
}

export function searchByName(query: string): Medicine[] {
  return medicines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );
}

export function getExpiringWithin30Days(): Medicine[] {
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + 30);
  return medicines.filter((m) => {
    const exp = new Date(m.expiryDate);
    return exp >= now && exp <= limit;
  });
}

export function getExpired(): Medicine[] {
  const now = new Date();
  return medicines.filter((m) => new Date(m.expiryDate) < now);
}

export function getLowStock(): Medicine[] {
  return medicines.filter((m) => m.quantity < 10);
}

export function sellMedicine(id: number, qty: number): { success: boolean; total?: number; error?: string } {
  const med = medicines.find((m) => m.id === id);
  if (!med) return { success: false, error: "Medicine not found" };
  if (med.quantity < qty) return { success: false, error: `Insufficient stock (available: ${med.quantity})` };
  med.quantity -= qty;
  const total = qty * med.price;
  notify();
  return { success: true, total };
}

// === BILL GENERATION MODULE ===

export interface BillItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Bill {
  billNumber: number;
  date: string;
  customerName: string;
  items: BillItem[];
  grandTotal: number;
}

let nextBillNumber = 1;
let bills: Bill[] = [];

/** Check medicine expiry status before billing */
export function checkExpiryStatus(id: number): { status: "ok" | "expired" | "near-expiry"; message?: string } {
  const med = medicines.find((m) => m.id === id);
  if (!med) return { status: "ok" };
  const exp = new Date(med.expiryDate);
  const now = new Date();
  const sevenDays = new Date();
  sevenDays.setDate(now.getDate() + 7);

  if (exp < now) return { status: "expired", message: `"${med.name}" is EXPIRED (${med.expiryDate}). Cannot bill.` };
  if (exp <= sevenDays) return { status: "near-expiry", message: `"${med.name}" expires on ${med.expiryDate} (within 7 days).` };
  return { status: "ok" };
}

/** Process a full bill with multiple items */
export function processBill(customerName: string, items: { id: number; qty: number }[]): { success: boolean; bill?: Bill; error?: string } {
  // Validate all items first
  for (const item of items) {
    const med = medicines.find((m) => m.id === item.id);
    if (!med) return { success: false, error: `Medicine ID ${item.id} not found` };
    const expiry = checkExpiryStatus(item.id);
    if (expiry.status === "expired") return { success: false, error: expiry.message };
    if (med.quantity < item.qty) return { success: false, error: `Insufficient stock for "${med.name}" (available: ${med.quantity})` };
  }

  // Deduct stock and build bill items
  const billItems: BillItem[] = items.map((item) => {
    const med = medicines.find((m) => m.id === item.id)!;
    med.quantity -= item.qty;
    return {
      medicineId: med.id,
      medicineName: med.name,
      quantity: item.qty,
      unitPrice: med.price,
      total: item.qty * med.price,
    };
  });

  const bill: Bill = {
    billNumber: nextBillNumber++,
    date: new Date().toLocaleString(),
    customerName,
    items: billItems,
    grandTotal: billItems.reduce((sum, i) => sum + i.total, 0),
  };

  bills.push(bill);
  notify();
  return { success: true, bill };
}

export function getBills(): Bill[] {
  return [...bills];
}

export function getMedicineById(id: number): Medicine | undefined {
  return medicines.find((m) => m.id === id);
}
