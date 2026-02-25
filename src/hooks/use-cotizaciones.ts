"use client";

import { useState, useEffect, useCallback } from "react";
import type { Cotizacion } from "@/lib/types";
import {
  getCotizaciones,
  getCotizacion,
  saveCotizacion,
  deleteCotizacion as deleteFromStorage,
} from "@/lib/storage";

export function useCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  const refresh = useCallback(() => {
    setCotizaciones(getCotizaciones());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    (cotizacion: Cotizacion) => {
      saveCotizacion(cotizacion);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      deleteFromStorage(id);
      refresh();
    },
    [refresh]
  );

  const get = useCallback((id: string) => {
    return getCotizacion(id);
  }, []);

  return { cotizaciones, save, remove, get, refresh };
}
