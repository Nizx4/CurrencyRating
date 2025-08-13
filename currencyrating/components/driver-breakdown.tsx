import { Drivers } from "@/lib/data";
import DriverBar from "./driver-bar";

export default function DriverBreakdown({ drivers }: { drivers: Drivers }) {
  const entries = Object.entries(drivers);
  return (
    <div className="cr-card p-4">
      <h3 className="font-semibold mb-3">Drivers</h3>
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <DriverBar key={k} label={k} value={v} />
        ))}
      </div>
    </div>
  );
}
