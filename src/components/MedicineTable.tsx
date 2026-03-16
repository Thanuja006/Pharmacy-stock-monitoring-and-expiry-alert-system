import type { Medicine } from "@/lib/medicine-store";

interface MedicineTableProps {
  medicines: Medicine[];
  title?: string;
}

const MedicineTable = ({ medicines, title }: MedicineTableProps) => {
  const now = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const getRowClass = (m: Medicine) => {
    const exp = new Date(m.expiryDate);
    if (exp < now) return "text-danger";
    if (exp <= thirtyDays) return "text-warning";
    if (m.quantity < 10) return "text-danger";
    return "text-foreground";
  };

  return (
    <div className="text-sm">
      {title && <p className="text-primary font-bold mb-2">{title}</p>}
      <div className="overflow-x-auto">
        <pre className="text-muted-foreground">
{`┌──────┬──────────────────────────┬───────┬──────────┬────────────┐
│  ID  │ NAME                     │  QTY  │  PRICE   │  EXPIRY    │
├──────┼──────────────────────────┼───────┼──────────┼────────────┤`}
        </pre>
        {medicines.length === 0 ? (
          <pre className="text-muted-foreground">
{`│      │  No records found.       │       │          │            │`}
          </pre>
        ) : (
          medicines.map((m) => (
            <pre key={m.id} className={getRowClass(m)}>
{`│ ${String(m.id).padStart(4)} │ ${m.name.padEnd(24).slice(0, 24)} │ ${String(m.quantity).padStart(5)} │ $${m.price.toFixed(2).padStart(7)} │ ${m.expiryDate} │`}
            </pre>
          ))
        )}
        <pre className="text-muted-foreground">
{`└──────┴──────────────────────────┴───────┴──────────┴────────────┘`}
        </pre>
      </div>
      <p className="text-muted-foreground mt-1">Total records: {medicines.length}</p>
    </div>
  );
};

export default MedicineTable;
