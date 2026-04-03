import { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Eye, RefreshCw, Trash2, Search, Clock, AlertCircle, ShoppingCart, ArrowLeft, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AlertsPanel from "@/components/AlertsPanel";
import MedicineTable from "@/components/MedicineTable";
import BillingModule from "@/components/BillingModule";
import LoginScreen from "@/components/LoginScreen";
import { useMedicines } from "@/hooks/use-medicines";
import {
  addMedicine, updateQuantity, deleteMedicine, searchByName,
  getExpiringWithin30Days, getLowStock, type Medicine,
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
  { key: "billing", label: "Billing", icon: ShoppingCart, desc: "Multi-item bill generation" },
] as const;

const Index = () => {
  const { medicines } = useMedicines();
  const [screen, setScreen] = useState<Screen>("menu");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addExpiry, setAddExpiry] = useState("");

  const [updateId, setUpdateId] = useState("");
  const [updateQtyVal, setUpdateQtyVal] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addExpiry, setAddExpiry] = useState("");

  const [updateId, setUpdateId] = useState("");
  const [updateQtyVal, setUpdateQtyVal] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);

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

  const BackButton = () => (
    <Button variant="outline" size="sm" onClick={goMenu} className="mb-5 shadow-sm">
      <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
    </Button>
  );

  return (
    <div className="min-h-screen">
      {/* === HEADER === */}
      <header className="border-b bg-card/80 backdrop-blur-sm px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">💊 Pharmacy Inventory System</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Medicine Inventory &amp; Expiry Tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Student Prototype Project</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsLoggedIn(false)}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">

        {/* === DASHBOARD MENU === */}
        {screen === "menu" && (
          <>
            <AlertsPanel />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {menuItems.map((item) => (
                <Card
                  key={item.key}
                  className="cursor-pointer hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => setScreen(item.key as Screen)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <MedicineTable medicines={medicines} title="📋 Inventory Overview" />
          </>
        )}

        {/* === ADD MEDICINE SCREEN === */}
        {screen === "add" && (
          <>
            <BackButton />
            <Card className="max-w-lg shadow-md">
              <CardHeader>
                <CardTitle>Add New Medicine</CardTitle>
                <CardDescription>Fill in the details to add a medicine to inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Medicine Name</Label><Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Aspirin 100mg" className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Quantity</Label><Input type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} className="mt-1" /></div>
                  <div><Label>Price ($)</Label><Input type="number" step="0.01" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} className="mt-1" /></div>
                </div>
                <div><Label>Expiry Date</Label><Input type="date" value={addExpiry} onChange={(e) => setAddExpiry(e.target.value)} className="mt-1" /></div>
                <Button onClick={handleAdd} className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" /> Add Medicine
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* === VIEW ALL === */}
        {screen === "viewAll" && (
          <><BackButton /><MedicineTable medicines={medicines} title="📋 All Medicines" /></>
        )}

        {/* === UPDATE QUANTITY === */}
        {screen === "update" && (
          <>
            <BackButton />
            <Card className="max-w-lg shadow-md">
              <CardHeader>
                <CardTitle>Update Quantity</CardTitle>
                <CardDescription>Enter the medicine ID and new stock quantity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Medicine ID</Label><Input type="number" value={updateId} onChange={(e) => setUpdateId(e.target.value)} className="mt-1" /></div>
                  <div><Label>New Quantity</Label><Input type="number" value={updateQtyVal} onChange={(e) => setUpdateQtyVal(e.target.value)} className="mt-1" /></div>
                </div>
                <Button onClick={handleUpdate} className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" /> Update
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* === DELETE MEDICINE === */}
        {screen === "delete" && (
          <>
            <BackButton />
            <Card className="max-w-lg shadow-md">
              <CardHeader>
                <CardTitle>Delete Medicine</CardTitle>
                <CardDescription>Enter the ID of the medicine to remove</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Medicine ID</Label><Input type="number" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} className="mt-1" /></div>
                <Button variant="destructive" onClick={handleDelete} className="w-full" size="lg">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* === SEARCH === */}
        {screen === "search" && (
          <>
            <BackButton />
            <Card className="max-w-lg mb-6 shadow-md">
              <CardHeader>
                <CardTitle>Search Medicine</CardTitle>
                <CardDescription>Search by medicine name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Medicine Name</Label><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. Para" className="mt-1" /></div>
                <Button onClick={handleSearch} className="w-full" size="lg">
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </CardContent>
            </Card>
            {searchResults.length > 0 && <MedicineTable medicines={searchResults} title="🔍 Search Results" />}
          </>
        )}

        {/* === EXPIRY TRACKING === */}
        {screen === "expiring" && (
          <><BackButton /><MedicineTable medicines={getExpiringWithin30Days()} title="⏰ Medicines Expiring Within 30 Days" /></>
        )}

        {/* === LOW STOCK === */}
        {screen === "lowStock" && (
          <><BackButton /><MedicineTable medicines={getLowStock()} title="⚠️ Low Stock Medicines (Qty &lt; 10)" /></>
        )}

        {/* === BILLING MODULE (NEW) === */}
        {screen === "billing" && (
          <>
            <BackButton />
            <h2 className="text-lg font-bold text-foreground mb-4">🧾 Bill Generation</h2>
            <BillingModule />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
