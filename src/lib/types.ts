export type Resistencia = "29EST" | "32EST" | "40EST";

export interface DatosCaja {
  largo: number; // L en cm
  ancho: number; // W en cm
  alto: number; // H en cm
  resistencia: Resistencia;
  numTintas: number; // 0-4
  cantidad: number;
}

export interface Calculo {
  largoPliego: number; // cm
  anchoPliego: number; // cm
  areaM2: number;
  costoBase: number; // MXN
  recargoTintas: number; // MXN
  precioVenta: number; // MXN por pieza
  total: number; // MXN
}

export interface DatosCliente {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
}

export interface Cotizacion {
  id: string;
  folio: string;
  fecha: string; // ISO string
  cliente: DatosCliente;
  caja: DatosCaja;
  calculo: Calculo;
  notas: string;
}

export interface DatosEmpresa {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  rfc: string;
}

export interface PrecioResistencia {
  resistencia: Resistencia;
  precioM2: number;
}

export interface Settings {
  empresa: DatosEmpresa;
  precios: PrecioResistencia[];
}
