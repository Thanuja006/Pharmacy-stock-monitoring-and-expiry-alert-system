import { useState, useEffect, useCallback } from "react";
import { getMedicines, subscribe, type Medicine } from "@/lib/medicine-store";

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>(getMedicines);

  useEffect(() => {
    return subscribe(() => setMedicines(getMedicines()));
  }, []);

  const refresh = useCallback(() => setMedicines(getMedicines()), []);

  return { medicines, refresh };
}
