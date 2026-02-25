"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import type { DatosEmpresa, PrecioResistencia } from "@/lib/types";
import { RESISTENCIAS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracionPage() {
  const { settings, save } = useSettings();
  const [empresa, setEmpresa] = useState<DatosEmpresa | null>(null);
  const [precios, setPrecios] = useState<PrecioResistencia[]>([]);

  useEffect(() => {
    if (settings) {
      setEmpresa(settings.empresa);
      setPrecios(settings.precios);
    }
  }, [settings]);

  const handleSaveEmpresa = () => {
    if (!settings || !empresa) return;
    save({ ...settings, empresa });
    toast.success("Datos de empresa guardados");
  };

  const handleSavePrecios = () => {
    if (!settings) return;
    save({ ...settings, precios });
    toast.success("Precios actualizados");
  };

  const handlePrecioChange = (resistencia: string, value: string) => {
    setPrecios((prev) =>
      prev.map((p) =>
        p.resistencia === resistencia
          ? { ...p, precioM2: parseFloat(value) || 0 }
          : p
      )
    );
  };

  if (!empresa) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Datos de empresa</TabsTrigger>
          <TabsTrigger value="precios">Lista de precios</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de empresa</CardTitle>
              <CardDescription>
                Estos datos aparecerán en los PDFs de cotización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emp-nombre">Nombre de empresa</Label>
                  <Input
                    id="emp-nombre"
                    value={empresa.nombre}
                    onChange={(e) =>
                      setEmpresa((p) => p && { ...p, nombre: e.target.value })
                    }
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-rfc">RFC</Label>
                  <Input
                    id="emp-rfc"
                    value={empresa.rfc}
                    onChange={(e) =>
                      setEmpresa((p) => p && { ...p, rfc: e.target.value })
                    }
                    placeholder="RFC"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="emp-direccion">Dirección</Label>
                  <Input
                    id="emp-direccion"
                    value={empresa.direccion}
                    onChange={(e) =>
                      setEmpresa((p) => p && { ...p, direccion: e.target.value })
                    }
                    placeholder="Dirección completa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-telefono">Teléfono</Label>
                  <Input
                    id="emp-telefono"
                    value={empresa.telefono}
                    onChange={(e) =>
                      setEmpresa((p) => p && { ...p, telefono: e.target.value })
                    }
                    placeholder="Teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-email">Email</Label>
                  <Input
                    id="emp-email"
                    type="email"
                    value={empresa.email}
                    onChange={(e) =>
                      setEmpresa((p) => p && { ...p, email: e.target.value })
                    }
                    placeholder="correo@empresa.com"
                  />
                </div>
              </div>
              <Button onClick={handleSaveEmpresa}>
                <Save className="mr-2 h-4 w-4" />
                Guardar datos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="precios" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Precios por resistencia</CardTitle>
              <CardDescription>
                Precio en MXN por metro cuadrado de cartón
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {RESISTENCIAS.map((r) => {
                  const precio = precios.find((p) => p.resistencia === r);
                  return (
                    <div key={r} className="space-y-2">
                      <Label htmlFor={`precio-${r}`}>{r}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
                        <Input
                          id={`precio-${r}`}
                          type="number"
                          min={0}
                          step={0.01}
                          value={precio?.precioM2 ?? 0}
                          onChange={(e) => handlePrecioChange(r, e.target.value)}
                          className="pl-7"
                          placeholder="0.00"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          /m²
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button onClick={handleSavePrecios}>
                <Save className="mr-2 h-4 w-4" />
                Guardar precios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
