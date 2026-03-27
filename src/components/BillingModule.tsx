// === BILLING MODULE COMPONENT ===
// Supports multi-item billing with dropdown selection, expiry checks, and formatted bill display

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, AlertTriangle, Printer, Receipt, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  getMedicineById, checkExpiryStatus, processBill,
  type Bill,
} from "@/lib/medicine-store";
import { useMedicines } from "@/hooks/use-medicines";

interface CartItem {
  medicineId: number;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  warning?: string;
}

const BillingModule = () => {
  const { medicines } = useMedicines();
  const [customerName, setCustomerName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedQty, setSelectedQty] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);

  // --- Currently selected medicine preview ---
  const selectedMed = selectedId ? getMedicineById(parseInt(selectedId)) : null;

  // --- Add medicine to cart with expiry validation ---
  const handleAddToCart = () => {
    if (!selectedId || !selectedQty) {
      toast.error("Select a medicine and enter quantity");
      return;
    }

    const id = parseInt(selectedId);
    const qty = parseInt(selectedQty);
    const med = getMedicineById(id);

    if (!med) { toast.error("Medicine not found"); return; }
    if (qty <= 0) { toast.error("Quantity must be greater than 0"); return; }

    // Expiry check during billing
    const expiryCheck = checkExpiryStatus(id);
    if (expiryCheck.status === "expired") {
      toast.error(expiryCheck.message);
      return; // Block expired medicines
    }

    // Check available stock (minus what's already in cart)
    const cartQty = cart.filter((c) => c.medicineId === id).reduce((s, c) => s + c.quantity, 0);
    if (qty + cartQty > med.quantity) {
      toast.error(`Insufficient stock for "${med.name}" (available: ${med.quantity - cartQty})`);
      return;
    }

    const item: CartItem = {
      medicineId: id,
      medicineName: med.name,
      unitPrice: med.price,
      quantity: qty,
      total: qty * med.price,
      warning: expiryCheck.status === "near-expiry" ? expiryCheck.message : undefined,
    };

    // Show warning for near-expiry (7 days)
    if (expiryCheck.status === "near-expiry") {
      toast.warning(expiryCheck.message);
    }

    setCart([...cart, item]);
    setSelectedId("");
    setSelectedQty("");
    toast.success(`Added ${med.name} × ${qty} to cart`);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // --- Process the bill ---
  const handleGenerateBill = () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (cart.length === 0) { toast.error("Add at least one medicine to the cart"); return; }

    const result = processBill(
      customerName,
      cart.map((c) => ({ id: c.medicineId, qty: c.quantity }))
    );

    if (result.success && result.bill) {
      setGeneratedBill(result.bill);
      setCart([]);
      setCustomerName("");
      toast.success(`Bill #${result.bill.billNumber} generated — Total: $${result.bill.grandTotal.toFixed(2)}`);
    } else {
      toast.error(result.error);
    }
  };

  // --- Print bill ---
  const handlePrint = () => window.print();

  // Filter out expired medicines from dropdown
  const availableMedicines = medicines.filter((m) => {
    const exp = new Date(m.expiryDate);
    return exp >= new Date() && m.quantity > 0;
  });

  return (
    <div className="space-y-6">
      {/* === Billing Form + Live Summary Side-by-Side === */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* --- Left: Medicine selection --- */}
        <div className="lg:col-span-3 space-y-4">

          {/* Customer Name Card */}
          <Card className="shadow-md border-border/60">
            <CardContent className="pt-5 pb-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Customer Name
              </Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="mt-1.5"
              />
            </CardContent>
          </Card>

          {/* Add Medicine Card — DROPDOWN instead of manual ID */}
          <Card className="shadow-md border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Add Medicine to Bill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {/* === DROPDOWN SELECTION (replaces manual ID input) === */}
                <div className="col-span-2">
                  <Label className="text-xs">Select Medicine</Label>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose medicine..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMedicines.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name} — ${m.price.toFixed(2)} (Stock: {m.quantity})
                        </SelectItem>
                      ))}
                      {availableMedicines.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">No medicines available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(e.target.value)}
                    placeholder="Qty"
                    className="mt-1"
                    min={1}
                    max={selectedMed?.quantity}
                  />
                </div>
              </div>

              {/* Auto-fetched medicine preview */}
              {selectedMed && (
                <div className="text-xs rounded-lg p-3 space-y-1 bg-primary/5 border border-primary/10">
                  <p><span className="text-muted-foreground">Name:</span> <strong>{selectedMed.name}</strong></p>
                  <p><span className="text-muted-foreground">Unit Price:</span> <strong className="text-primary">${selectedMed.price.toFixed(2)}</strong></p>
                  <p><span className="text-muted-foreground">In Stock:</span> <strong>{selectedMed.quantity}</strong></p>
                  <p><span className="text-muted-foreground">Expiry:</span> <strong>{selectedMed.expiryDate}</strong></p>
                  {selectedQty && parseInt(selectedQty) > 0 && (
                    <p className="pt-1 border-t border-primary/10 font-semibold">
                      Subtotal: <span className="text-primary">${(selectedMed.price * parseInt(selectedQty)).toFixed(2)}</span>
                    </p>
                  )}
                </div>
              )}

              <Button onClick={handleAddToCart} className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" /> Add to Bill
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* --- Right: LIVE BILL SUMMARY (always visible) --- */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-2 border-primary/15 sticky top-24">
            <CardHeader className="pb-3 bg-primary/5 rounded-t-[var(--radius)]">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> Live Bill Summary
              </CardTitle>
              {customerName && (
                <p className="text-xs text-muted-foreground">Customer: <strong className="text-foreground">{customerName}</strong></p>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No items added yet</p>
                  <p className="text-xs mt-1">Select a medicine and add it to the bill</p>
                </div>
              ) : (
                <>
                  <div className="max-h-[320px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary/5">
                          <TableHead className="text-xs">Medicine</TableHead>
                          <TableHead className="text-right text-xs">Qty</TableHead>
                          <TableHead className="text-right text-xs">Total</TableHead>
                          <TableHead className="w-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs">
                              <span className="font-medium">{item.medicineName}</span>
                              <span className="text-muted-foreground block text-[10px]">${item.unitPrice.toFixed(2)} each</span>
                              {item.warning && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <AlertTriangle className="w-3 h-3 text-warning" />
                                  <span className="text-[10px] text-warning">Near expiry</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs">{item.quantity}</TableCell>
                            <TableCell className="text-right text-xs font-semibold">${item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(idx)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Grand Total */}
                  <div className="border-t-2 border-primary/20 p-4 bg-primary/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">{cart.length} item(s)</p>
                        <p className="text-sm font-bold text-foreground">Grand Total</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">${grandTotal.toFixed(2)}</p>
                    </div>
                    <Button onClick={handleGenerateBill} className="w-full mt-3" size="lg">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Generate Bill
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* === Generated Bill Display (Invoice) === */}
      {generatedBill && (
        <Card className="border-2 border-primary/20 shadow-xl print:border-black print:shadow-none" id="printable-bill">
          <CardHeader className="text-center border-b pb-4 bg-primary/5 rounded-t-[var(--radius)]">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">💊 Pharmacy Billing System</p>
            <CardTitle className="text-xl">Invoice</CardTitle>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Bill No: <strong className="text-foreground">#{generatedBill.billNumber}</strong></span>
              <span>Date: <strong className="text-foreground">{generatedBill.date}</strong></span>
            </div>
            <p className="text-sm mt-1">Customer: <strong>{generatedBill.customerName}</strong></p>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead>#</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedBill.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.medicineName}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-primary/5 font-bold text-base">
                  <TableCell colSpan={4} className="text-right">Grand Total</TableCell>
                  <TableCell className="text-right text-primary">${generatedBill.grandTotal.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" /> Print Bill
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingModule;
