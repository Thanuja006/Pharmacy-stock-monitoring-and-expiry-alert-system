import { useState } from "react";
import ConsoleHeader from "@/components/ConsoleHeader";
import AlertsPanel from "@/components/AlertsPanel";
import MenuButton from "@/components/MenuButton";
import MedicineTable from "@/components/MedicineTable";
import ConsoleInput from "@/components/ConsoleInput";
import { useMedicines } from "@/hooks/use-medicines";
import {
  addMedicine,
  updateQuantity,
  deleteMedicine,
  searchByName,
  getExpiringWithin30Days,
  getLowStock,
  sellMedicine,
  type Medicine,
} from "@/lib/medicine-store";

type Screen =
  | "menu"
  | "add"
  | "viewAll"
  | "update"
  | "delete"
  | "search"
  | "expiring"
  | "lowStock"
  | "billing";

const Index = () => {
  const { medicines } = useMedicines();
  const [screen, setScreen] = useState<Screen>("menu");
  const [feedback, setFeedback] = useState("");

  // Add form
  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addExpiry, setAddExpiry] = useState("");

  // Update form
  const [updateId, setUpdateId] = useState("");
  const [updateQty, setUpdateQty] = useState("");

  // Delete form
  const [deleteId, setDeleteId] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);

  // Billing
  const [billId, setBillId] = useState("");
  const [billQty, setBillQty] = useState("");

  const goMenu = () => {
    setScreen("menu");
    setFeedback("");
  };

  const handleAdd = () => {
    if (!addName || !addQty || !addPrice || !addExpiry) {
      setFeedback("[ERROR] All fields are required.");
      return;
    }
    const med = addMedicine({
      name: addName,
      quantity: parseInt(addQty),
      price: parseFloat(addPrice),
      expiryDate: addExpiry,
    });
    setFeedback(`[✓] Medicine "${med.name}" added successfully (ID: ${med.id})`);
    setAddName(""); setAddQty(""); setAddPrice(""); setAddExpiry("");
  };

  const handleUpdate = () => {
    if (!updateId || !updateQty) { setFeedback("[ERROR] ID and quantity required."); return; }
    const ok = updateQuantity(parseInt(updateId), parseInt(updateQty));
    setFeedback(ok ? `[✓] Record ID ${updateId} updated successfully.` : `[ERROR] Medicine ID ${updateId} not found.`);
    setUpdateId(""); setUpdateQty("");
  };

  const handleDelete = () => {
    if (!deleteId) { setFeedback("[ERROR] ID required."); return; }
    const ok = deleteMedicine(parseInt(deleteId));
    setFeedback(ok ? `[✓] Record ID ${deleteId} deleted successfully.` : `[ERROR] Medicine ID ${deleteId} not found.`);
    setDeleteId("");
  };

  const handleSearch = () => {
    if (!searchQuery) { setFeedback("[ERROR] Enter a search term."); return; }
    const results = searchByName(searchQuery);
    setSearchResults(results);
    setFeedback(results.length > 0 ? `Found ${results.length} result(s).` : "No medicines found matching query.");
  };

  const handleBill = () => {
    if (!billId || !billQty) { setFeedback("[ERROR] Medicine ID and quantity required."); return; }
    const result = sellMedicine(parseInt(billId), parseInt(billQty));
    if (result.success) {
      setFeedback(`[✓] Sale completed! Total: $${result.total!.toFixed(2)}. Stock reduced.`);
    } else {
      setFeedback(`[ERROR] ${result.error}`);
    }
    setBillId(""); setBillQty("");
  };

  const breadcrumbs: Record<Screen, string> = {
    menu: "Main Menu",
    add: "Main Menu > Add Medicine",
    viewAll: "Main Menu > View All Medicines",
    update: "Main Menu > Update Quantity",
    delete: "Main Menu > Delete Medicine",
    search: "Main Menu > Search Medicine",
    expiring: "Main Menu > Expiry Tracking",
    lowStock: "Main Menu > Low Stock Alert",
    billing: "Main Menu > Billing",
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto">
      <ConsoleHeader breadcrumb={breadcrumbs[screen]} />

      {screen === "menu" && <AlertsPanel />}

      {feedback && (
        <p className={`text-sm mb-3 ${feedback.startsWith("[✓]") ? "text-success glow-success" : feedback.startsWith("[ERROR]") ? "text-danger" : "text-foreground"}`}>
          {feedback}
        </p>
      )}

      {screen === "menu" && (
        <div className="space-y-1 max-w-xs">
          <p className="text-primary font-bold text-sm mb-2">--- MAIN MENU ---</p>
          <MenuButton number={1} label="Add Medicine" onClick={() => { setScreen("add"); setFeedback(""); }} />
          <MenuButton number={2} label="View All Medicines" onClick={() => { setScreen("viewAll"); setFeedback(""); }} />
          <MenuButton number={3} label="Update Medicine Quantity" onClick={() => { setScreen("update"); setFeedback(""); }} />
          <MenuButton number={4} label="Delete Medicine" onClick={() => { setScreen("delete"); setFeedback(""); }} />
          <MenuButton number={5} label="Search Medicine by Name" onClick={() => { setScreen("search"); setFeedback(""); }} />
          <MenuButton number={6} label="Expiry Tracking (30 days)" onClick={() => { setScreen("expiring"); setFeedback(""); }} />
          <MenuButton number={7} label="Low Stock Alert (qty < 10)" onClick={() => { setScreen("lowStock"); setFeedback(""); }} />
          <MenuButton number={8} label="Billing / Sell Medicine" onClick={() => { setScreen("billing"); setFeedback(""); }} />
        </div>
      )}

      {screen === "add" && (
        <div className="max-w-md space-y-1">
          <p className="text-primary font-bold text-sm mb-3">--- ADD NEW MEDICINE ---</p>
          <ConsoleInput label="Enter Name:" value={addName} onChange={setAddName} placeholder="e.g. Aspirin 100mg" />
          <ConsoleInput label="Enter Quantity (Integer):" value={addQty} onChange={setAddQty} type="number" />
          <ConsoleInput label="Enter Price ($):" value={addPrice} onChange={setAddPrice} type="number" />
          <ConsoleInput label="Enter Expiry (YYYY-MM-DD):" value={addExpiry} onChange={setAddExpiry} placeholder="2026-12-31" />
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="bg-primary text-primary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Submit]</button>
            <button onClick={goMenu} className="bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back]</button>
          </div>
        </div>
      )}

      {screen === "viewAll" && (
        <div>
          <MedicineTable medicines={medicines} title="--- ALL MEDICINES ---" />
          <button onClick={goMenu} className="mt-3 bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back to Menu]</button>
        </div>
      )}

      {screen === "update" && (
        <div className="max-w-md space-y-1">
          <p className="text-primary font-bold text-sm mb-3">--- UPDATE QUANTITY ---</p>
          <ConsoleInput label="Enter Medicine ID:" value={updateId} onChange={setUpdateId} type="number" />
          <ConsoleInput label="Enter New Quantity:" value={updateQty} onChange={setUpdateQty} type="number" />
          <div className="flex gap-2 mt-3">
            <button onClick={handleUpdate} className="bg-primary text-primary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Update]</button>
            <button onClick={goMenu} className="bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back]</button>
          </div>
        </div>
      )}

      {screen === "delete" && (
        <div className="max-w-md space-y-1">
          <p className="text-primary font-bold text-sm mb-3">--- DELETE MEDICINE ---</p>
          <ConsoleInput label="Enter Medicine ID to delete:" value={deleteId} onChange={setDeleteId} type="number" />
          <div className="flex gap-2 mt-3">
            <button onClick={handleDelete} className="bg-destructive text-destructive-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Delete]</button>
            <button onClick={goMenu} className="bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back]</button>
          </div>
        </div>
      )}

      {screen === "search" && (
        <div className="max-w-md space-y-1">
          <p className="text-primary font-bold text-sm mb-3">--- SEARCH MEDICINE ---</p>
          <ConsoleInput label="Enter medicine name:" value={searchQuery} onChange={setSearchQuery} placeholder="e.g. Para" />
          <button onClick={handleSearch} className="bg-primary text-primary-foreground px-4 py-1 rounded text-sm hover:opacity-90 mr-2">[Search]</button>
          <button onClick={goMenu} className="bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back]</button>
          {searchResults.length > 0 && (
            <div className="mt-3">
              <MedicineTable medicines={searchResults} />
            </div>
          )}
        </div>
      )}

      {screen === "expiring" && (
        <div>
          <MedicineTable medicines={getExpiringWithin30Days()} title="--- MEDICINES EXPIRING WITHIN 30 DAYS ---" />
          <button onClick={goMenu} className="mt-3 bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back to Menu]</button>
        </div>
      )}

      {screen === "lowStock" && (
        <div>
          <MedicineTable medicines={getLowStock()} title="--- LOW STOCK MEDICINES (QTY < 10) ---" />
          <button onClick={goMenu} className="mt-3 bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back to Menu]</button>
        </div>
      )}

      {screen === "billing" && (
        <div className="max-w-md space-y-1">
          <p className="text-primary font-bold text-sm mb-3">--- BILLING / SELL MEDICINE ---</p>
          <MedicineTable medicines={medicines} />
          <div className="mt-3">
            <ConsoleInput label="Enter Medicine ID:" value={billId} onChange={setBillId} type="number" />
            <ConsoleInput label="Enter Quantity to sell:" value={billQty} onChange={setBillQty} type="number" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleBill} className="bg-success text-success-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Process Sale]</button>
            <button onClick={goMenu} className="bg-secondary text-secondary-foreground px-4 py-1 rounded text-sm hover:opacity-90">[Back]</button>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-console pt-3 text-xs text-muted-foreground">
        Medical Inventory System © 2026 | Student Prototype | Date: {new Date().toISOString().split("T")[0]}
      </div>
    </div>
  );
};

export default Index;
