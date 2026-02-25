import type { PrecioResistencia, Resistencia, Settings } from "./types";

export const AUTH_PIN = "0956";
export const AUTH_KEY = "cotizador_auth";
export const COTIZACIONES_KEY = "cotizador_cotizaciones";
export const SETTINGS_KEY = "cotizador_settings";

export const RESISTENCIAS: Resistencia[] = ["29EST", "32EST", "40EST"];

export const PRECIOS_DEFAULT: PrecioResistencia[] = [
  { resistencia: "29EST", precioM2: 9.8 },
  { resistencia: "32EST", precioM2: 10.79 },
  { resistencia: "40EST", precioM2: 12.2 },
];

export const MAX_TINTAS = 4;
export const PORCENTAJE_TINTA = 0.03; // 3% por tinta
export const MARGEN_VENTA = 1.3; // 30% margen

export const DEFAULT_SETTINGS: Settings = {
  empresa: {
    nombre: "Cajas CRR",
    direccion: "",
    telefono: "",
    email: "",
    rfc: "",
  },
  precios: PRECIOS_DEFAULT,
};
