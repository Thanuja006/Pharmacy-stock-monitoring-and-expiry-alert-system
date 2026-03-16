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
