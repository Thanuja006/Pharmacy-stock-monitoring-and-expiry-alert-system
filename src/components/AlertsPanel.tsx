import { AlertTriangle, XCircle, AlertCircle } from "lucide-react";
import { getExpiringWithin30Days, getExpired, getLowStock } from "@/lib/medicine-store";
import { useMedicines } from "@/hooks/use-medicines";

const AlertsPanel = () => {
  useMedicines(); // subscribe to changes
  const expiring = getExpiringWithin30Days();
  const expired = getExpired();
  const lowStock = getLowStock();

  if (expiring.length === 0 && expired.length === 0 && lowStock.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-3 mb-6">
      {expired.length > 0 && (
        <div className="bg-danger-soft border border-danger-soft rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Expired ({expired.length})</h3>
          </div>
          {expired.map((m) => (
            <p key={m.id} className="text-sm text-destructive/80 ml-7">
              {m.name} — {m.expiryDate}
            </p>
          ))}
        </div>
      )}
      {expiring.length > 0 && (
        <div className="bg-warning-soft border border-warning-soft rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-warning">Expiring Soon ({expiring.length})</h3>
          </div>
          {expiring.map((m) => (
            <p key={m.id} className="text-sm text-warning/80 ml-7">
              {m.name} — {m.expiryDate}
            </p>
          ))}
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="bg-danger-soft border border-danger-soft rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Low Stock ({lowStock.length})</h3>
          </div>
          {lowStock.map((m) => (
            <p key={m.id} className="text-sm text-destructive/80 ml-7">
              {m.name} — Qty: {m.quantity}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
