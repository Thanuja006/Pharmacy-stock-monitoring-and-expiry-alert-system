// === BILLING MODULE COMPONENT ===
// Supports multi-item billing, expiry checks, and formatted bill display

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, AlertTriangle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  getMedicineById, checkExpiryStatus, processBill,
  type Medicine, type Bill,
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

  // --- Add medicine to cart with expiry validation ---
  const handleAddToCart = () => {
    if (!selectedId || !selectedQty) {
      toast.error("Select a medicine and enter quantity");
      return;
    }

    const id = parseInt(selectedId);
    const qty = parseInt(selectedQty);
    const med = getMedicineById(id);

    if (!med) { toast.error(`Medicine ID ${id} not found`); return; }
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

  return (
    <div className="space-y-6">
      {/* --- Bill Generation Form --- */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {/* Customer Name */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer Name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="mt-1.5"
              />
            </CardContent>
          </Card>

          {/* Add medicine to cart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Medicine to Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Medicine ID</Label>
                  <Input type="number" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} placeholder="ID" />
                </div>
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input type="number" value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)} placeholder="Qty" />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddToCart} className="w-full">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Auto-fetch preview */}
              {selectedId && getMedicineById(parseInt(selectedId)) && (
                <div className="text-xs bg-muted/50 rounded-md p-2.5 space-y-0.5">
                  <p><span className="text-muted-foreground">Name:</span> <strong>{getMedicineById(parseInt(selectedId))!.name}</strong></p>
                  <p><span className="text-muted-foreground">Price:</span> ${getMedicineById(parseInt(selectedId))!.price.toFixed(2)}</p>
                  <p><span className="text-muted-foreground">In Stock:</span> {getMedicineById(parseInt(selectedId))!.quantity}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart Table */}
          {cart.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Cart ({cart.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {item.medicineName}
                          {item.warning && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-warning" />
                              <span className="text-[10px] text-warning">Near expiry</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(idx)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                      <TableCell className="text-right">${grandTotal.toFixed(2)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
                <Button onClick={handleGenerateBill} className="w-full mt-4" size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Generate Bill
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Available Stock sidebar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Available Stock</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[420px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((m) => {
                      const exp = new Date(m.expiryDate);
                      const isExpired = exp < new Date();
                      return (
                        <TableRow key={m.id} className={isExpired ? "opacity-50" : ""}>
                          <TableCell className="font-medium">{m.id}</TableCell>
                          <TableCell className="text-xs">
                            {m.name}
                            {isExpired && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">EXP</Badge>}
                          </TableCell>
                          <TableCell className="text-right">{m.quantity}</TableCell>
                          <TableCell className="text-right">${m.price.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- Generated Bill Display --- */}
      {generatedBill && (
        <Card className="border-2 border-primary/20 print:border-black" id="printable-bill">
          <CardHeader className="text-center border-b pb-4">
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
                <TableRow className="bg-muted/50">
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
