import { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Eye, RefreshCw, Trash2, Search, Clock, AlertCircle, ShoppingCart, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AlertsPanel from "@/components/AlertsPanel";
import MedicineTable from "@/components/MedicineTable";
import { useMedicines } from "@/hooks/use-medicines";
import {
  addMedicine, updateQuantity, deleteMedicine, searchByName,
  getExpiringWithin30Days, getLowStock, sellMedicine, type Medicine,
} from "@/lib/medicine-store";

type Screen = "menu" | "add" | "viewAll" | "update" | "delete" | "search" | "expiring" | "lowStock" | "billing";

const menuItems = [
  { key: "add", label: "Add Medicine", icon: Plus, desc: "Add a new medicine to inventory" },
  { key: "viewAll", label: "View All", icon: Eye, desc: "Browse complete inventory" },
  { key: "update", label: "Update Qty", icon: RefreshCw, desc: "Update medicine quantity" },
  { key: "delete", label: "Delete", icon: Trash2, desc: "Remove a medicine record" },
  { key: "search", label: "Search", icon: Search, desc: "Search medicines by name" },
  { key: "expiring", label: "Expiry Tracking", icon: Clock, desc: "Medicines expiring in 30 days" },
  { key: "lowStock", label: "Low Stock", icon: AlertCircle, desc: "Quantity below 10" },
  { key: "billing", label: "Billing", icon: ShoppingCart, desc: "Sell medicine & generate bill" },
] as const;

const Index = () => {
  const { medicines } = useMedicines();
  const [screen, setScreen] = useState<Screen>("menu");

  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addExpiry, setAddExpiry] = useState("");

  const [updateId, setUpdateId] = useState("");
  const [updateQtyVal, setUpdateQtyVal] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [billId, setBillId] = useState("");
  const [billQty, setBillQty] = useState("");

  const goMenu = () => setScreen("menu");

  const handleAdd = () => {
    if (!addName || !addQty || !addPrice || !addExpiry) { toast.error("All fields are required"); return; }
    const med = addMedicine({ name: addName, quantity: parseInt(addQty), price: parseFloat(addPrice), expiryDate: addExpiry });
    toast.success(`"${med.name}" added (ID: ${med.id})`);
    setAddName(""); setAddQty(""); setAddPrice(""); setAddExpiry("");
  };

  const handleUpdate = () => {
    if (!updateId || !updateQtyVal) { toast.error("ID and quantity required"); return; }
    const ok = updateQuantity(parseInt(updateId), parseInt(updateQtyVal));
    ok ? toast.success(`Record #${updateId} updated`) : toast.error(`ID ${updateId} not found`);
    setUpdateId(""); setUpdateQtyVal("");
  };

  const handleDelete = () => {
    if (!deleteId) { toast.error("ID required"); return; }
    const ok = deleteMedicine(parseInt(deleteId));
    ok ? toast.success(`Record #${deleteId} deleted`) : toast.error(`ID ${deleteId} not found`);
    setDeleteId("");
  };

  const handleSearch = () => {
    if (!searchQuery) { toast.error("Enter a search term"); return; }
    setSearchResults(searchByName(searchQuery));
  };

  const handleBill = () => {
    if (!billId || !billQty) { toast.error("Medicine ID and quantity required"); return; }
    const r = sellMedicine(parseInt(billId), parseInt(billQty));
    r.success ? toast.success(`Sale complete! Total: $${r.total!.toFixed(2)}`) : toast.error(r.error!);
    setBillId(""); setBillQty("");
  };

  const BackButton = () => (
    <Button variant="outline" size="sm" onClick={goMenu} className="mb-4">
      <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">💊 Medical Inventory System</h1>
            <p className="text-sm text-muted-foreground">Student Prototype — Inventory & Expiry Tracking</p>
          </div>
          <p className="text-xs text-muted-foreground hidden md:block">{new Date().toLocaleDateString()}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {screen === "menu" && (
          <>
            <AlertsPanel />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {menuItems.map((item) => (
                <Card
                  key={item.key}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => setScreen(item.key as Screen)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8">
              <MedicineTable medicines={medicines} title="Inventory Overview" />
            </div>
          </>
        )}

        {screen === "add" && (
          <>
            <BackButton />
            <Card className="max-w-md">
              <CardHeader><CardTitle>Add New Medicine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Medicine Name</Label><Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Aspirin 100mg" /></div>
                <div><Label>Quantity</Label><Input type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} /></div>
                <div><Label>Price ($)</Label><Input type="number" step="0.01" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} /></div>
                <div><Label>Expiry Date</Label><Input type="date" value={addExpiry} onChange={(e) => setAddExpiry(e.target.value)} /></div>
                <Button onClick={handleAdd} className="w-full">Add Medicine</Button>
              </CardContent>
            </Card>
          </>
        )}

        {screen === "viewAll" && (
          <>
            <BackButton />
            <MedicineTable medicines={medicines} title="All Medicines" />
          </>
        )}

        {screen === "update" && (
          <>
            <BackButton />
            <Card className="max-w-md">
              <CardHeader><CardTitle>Update Quantity</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Medicine ID</Label><Input type="number" value={updateId} onChange={(e) => setUpdateId(e.target.value)} /></div>
                <div><Label>New Quantity</Label><Input type="number" value={updateQtyVal} onChange={(e) => setUpdateQtyVal(e.target.value)} /></div>
                <Button onClick={handleUpdate} className="w-full">Update</Button>
              </CardContent>
            </Card>
          </>
        )}

        {screen === "delete" && (
          <>
            <BackButton />
            <Card className="max-w-md">
              <CardHeader><CardTitle>Delete Medicine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Medicine ID</Label><Input type="number" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} /></div>
                <Button variant="destructive" onClick={handleDelete} className="w-full">Delete</Button>
              </CardContent>
            </Card>
          </>
        )}

        {screen === "search" && (
          <>
            <BackButton />
            <Card className="max-w-md mb-4">
              <CardHeader><CardTitle>Search Medicine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Medicine Name</Label><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. Para" /></div>
                <Button onClick={handleSearch} className="w-full">Search</Button>
              </CardContent>
            </Card>
            {searchResults.length > 0 && <MedicineTable medicines={searchResults} title="Search Results" />}
          </>
        )}

        {screen === "expiring" && (
          <>
            <BackButton />
            <MedicineTable medicines={getExpiringWithin30Days()} title="Medicines Expiring Within 30 Days" />
          </>
        )}

        {screen === "lowStock" && (
          <>
            <BackButton />
            <MedicineTable medicines={getLowStock()} title="Low Stock Medicines (Qty < 10)" />
          </>
        )}

        {screen === "billing" && (
          <>
            <BackButton />
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Sell Medicine</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><Label>Medicine ID</Label><Input type="number" value={billId} onChange={(e) => setBillId(e.target.value)} /></div>
                  <div><Label>Quantity</Label><Input type="number" value={billQty} onChange={(e) => setBillQty(e.target.value)} /></div>
                  <Button onClick={handleBill} className="w-full">Process Sale</Button>
                </CardContent>
              </Card>
              <MedicineTable medicines={medicines} title="Available Stock" compact />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
