"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useCotizaciones } from "@/hooks/use-cotizaciones";
import { useSettings } from "@/hooks/use-settings";
import { useCalculation } from "@/hooks/use-calculation";
import { getNextFolio } from "@/lib/storage";
import { formatMXN } from "@/lib/format";
import type { DatosCaja, DatosCliente, Resistencia } from "@/lib/types";
import { RESISTENCIAS, MAX_TINTAS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const initialCliente: DatosCliente = {
  nombre: "",
  empresa: "",
  telefono: "",
  email: "",
};

const initialCaja: DatosCaja = {
  largo: 0,
  ancho: 0,
  alto: 0,
  resistencia: "32EST",
  numTintas: 0,
  cantidad: 1,
};

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const { save } = useCotizaciones();
  const { settings } = useSettings();
  const [cliente, setCliente] = useState<DatosCliente>(initialCliente);
  const [caja, setCaja] = useState<DatosCaja>(initialCaja);
  const [notas, setNotas] = useState("");

  const precios = useMemo(
    () => settings?.precios ?? [],
    [settings]
  );

  const cajaForCalc = useMemo(
    () => (caja.largo > 0 && caja.ancho > 0 && caja.alto > 0 && caja.cantidad > 0 ? caja : null),
    [caja]
  );

  const calculo = useCalculation(cajaForCalc, precios);

  const handleCajaChange = (field: keyof DatosCaja, value: string) => {
    if (field === "resistencia") {
      setCaja((prev) => ({ ...prev, resistencia: value as Resistencia }));
    } else {
      const num = parseFloat(value) || 0;
      setCaja((prev) => ({ ...prev, [field]: num }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente.nombre.trim()) {
      toast.error("Ingresa el nombre del cliente");
      return;
    }
    if (!caja.largo || !caja.ancho || !caja.alto) {
      toast.error("Ingresa las dimensiones de la caja");
      return;
    }
    if (!caja.cantidad || caja.cantidad < 1) {
      toast.error("Ingresa una cantidad válida");
      return;
    }
    if (!calculo) {
      toast.error("Error en el cálculo");
      return;
    }

    const cotizacion = {
      id: uuidv4(),
      folio: getNextFolio(),
      fecha: new Date().toISOString(),
      cliente,
      caja,
      calculo,
      notas,
    };

    save(cotizacion);
    toast.success(`Cotización ${cotizacion.folio} creada`);
    router.push(`/cotizaciones/${cotizacion.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cotizaciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nueva cotización</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        {/* Columna izquierda: form */}
        <div className="space-y-4 lg:col-span-2">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={cliente.nombre}
                  onChange={(e) =>
                    setCliente((p) => ({ ...p, nombre: e.target.value }))
                  }
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={cliente.empresa}
                  onChange={(e) =>
                    setCliente((p) => ({ ...p, empresa: e.target.value }))
                  }
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={cliente.telefono}
                  onChange={(e) =>
                    setCliente((p) => ({ ...p, telefono: e.target.value }))
                  }
                  placeholder="Teléfono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={cliente.email}
                  onChange={(e) =>
                    setCliente((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Caja */}
          <Card>
            <CardHeader>
              <CardTitle>Especificaciones de la caja</CardTitle>
              <CardDescription>
                Dimensiones interiores en centímetros
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="largo">Largo (L) *</Label>
                <Input
                  id="largo"
                  type="number"
                  min={0}
                  step={0.1}
                  value={caja.largo || ""}
                  onChange={(e) => handleCajaChange("largo", e.target.value)}
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ancho">Ancho (W) *</Label>
                <Input
                  id="ancho"
                  type="number"
                  min={0}
                  step={0.1}
                  value={caja.ancho || ""}
                  onChange={(e) => handleCajaChange("ancho", e.target.value)}
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alto">Alto (H) *</Label>
                <Input
                  id="alto"
                  type="number"
                  min={0}
                  step={0.1}
                  value={caja.alto || ""}
                  onChange={(e) => handleCajaChange("alto", e.target.value)}
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resistencia">Resistencia</Label>
                <Select
                  value={caja.resistencia}
                  onValueChange={(v) => handleCajaChange("resistencia", v)}
                >
                  <SelectTrigger id="resistencia">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESISTENCIAS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tintas">Tintas (0-{MAX_TINTAS})</Label>
                <Select
                  value={String(caja.numTintas)}
                  onValueChange={(v) => handleCajaChange("numTintas", v)}
                >
                  <SelectTrigger id="tintas">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: MAX_TINTAS + 1 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i === 0 ? "Sin tintas" : `${i} tinta${i > 1 ? "s" : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min={1}
                  value={caja.cantidad || ""}
                  onChange={(e) => handleCajaChange("cantidad", e.target.value)}
                  placeholder="Piezas"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales (opcional)"
              />
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: resumen */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen de cotización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {calculo ? (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Largo pliego</span>
                      <span>{calculo.largoPliego} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ancho pliego</span>
                      <span>{calculo.anchoPliego} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Área</span>
                      <span>{calculo.areaM2} m²</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Costo base</span>
                      <span>{formatMXN(calculo.costoBase)}</span>
                    </div>
                    {calculo.recargoTintas > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Recargo tintas ({caja.numTintas}×3%)
                        </span>
                        <span>{formatMXN(calculo.recargoTintas)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio unitario</span>
                      <span>{formatMXN(calculo.precioVenta)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total ({caja.cantidad.toLocaleString()} pzas)</span>
                      <span>{formatMXN(calculo.total)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ingresa las dimensiones y cantidad para ver el cálculo
                </p>
              )}

              <Button type="submit" className="w-full" disabled={!calculo}>
                <Save className="mr-2 h-4 w-4" />
                Guardar cotización
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
