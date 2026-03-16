import { getExpiringWithin30Days, getExpired, getLowStock } from "@/lib/medicine-store";
import { useMedicines } from "@/hooks/use-medicines";

const AlertsPanel = () => {
  const { medicines } = useMedicines();
  const expiring = getExpiringWithin30Days();
  const expired = getExpired();
  const lowStock = getLowStock();

  if (expiring.length === 0 && expired.length === 0 && lowStock.length === 0) {
    return (
      <div className="mb-4 text-success text-sm">
        [✓] All inventory levels normal. No alerts.
      </div>
    );
  }

  return (
    <div className="mb-4 bg-console border border-console rounded p-3 text-sm space-y-2">
      <p className="text-primary font-bold">--- SYSTEM ALERTS ---</p>
      {expired.length > 0 && (
        <div>
          <p className="text-danger font-bold">[!] EXPIRED MEDICINES ({expired.length}):</p>
          {expired.map((m) => (
            <p key={m.id} className="text-danger ml-4">
              • {m.name} (Expired: {m.expiryDate})
            </p>
          ))}
        </div>
      )}
      {expiring.length > 0 && (
        <div>
          <p className="text-warning font-bold">[⚠] EXPIRING WITHIN 30 DAYS ({expiring.length}):</p>
          {expiring.map((m) => (
            <p key={m.id} className="text-warning ml-4">
              • {m.name} (Expires: {m.expiryDate})
            </p>
          ))}
        </div>
      )}
      {lowStock.length > 0 && (
        <div>
          <p className="text-danger font-bold">[⚠] LOW STOCK ({lowStock.length}):</p>
          {lowStock.map((m) => (
            <p key={m.id} className="text-danger ml-4">
              • {m.name} (Qty: {m.quantity})
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
