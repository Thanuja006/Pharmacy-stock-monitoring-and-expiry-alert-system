import type { Medicine } from "@/lib/medicine-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MedicineTableProps {
  medicines: Medicine[];
  title?: string;
  compact?: boolean;
}

const MedicineTable = ({ medicines, title, compact }: MedicineTableProps) => {
  const now = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const getStatusBadge = (m: Medicine) => {
    const exp = new Date(m.expiryDate);
    if (exp < now) return <Badge variant="destructive">Expired</Badge>;
    if (exp <= thirtyDays) return <Badge className="bg-warning text-warning-foreground">Expiring</Badge>;
    if (m.quantity < 10) return <Badge variant="destructive">Low Stock</Badge>;
    return <Badge className="bg-success-soft text-success border border-success-soft">OK</Badge>;
  };

  return (
    <div>
      {title && <h3 className="font-semibold text-foreground mb-3">{title}</h3>}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Medicine Name</TableHead>
              {!compact && <TableHead className="text-right">Qty</TableHead>}
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={compact ? 5 : 6} className="text-center text-muted-foreground py-8">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              medicines.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.id}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  {!compact && <TableCell className="text-right">{m.quantity}</TableCell>}
                  <TableCell className="text-right">${m.price.toFixed(2)}</TableCell>
                  <TableCell>{m.expiryDate}</TableCell>
                  <TableCell>{getStatusBadge(m)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{medicines.length} record(s)</p>
    </div>
  );
};

export default MedicineTable;
