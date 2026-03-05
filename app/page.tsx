"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, Monitor } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">OTI NetMonitor</h1>
        <p className="text-muted-foreground text-lg">
          Sistema de Registro de Access Points y Operatividad de Aulas Digitales
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Link href="/access-points">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="text-center py-10">
              <Wifi className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle className="text-xl">Registro de Access Points</CardTitle>
              <CardDescription>
                Registra APs, agrega mediciones de ping y velocidad, y consulta
                el historial
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/verificaciones">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="text-center py-10">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle className="text-xl">Aulas Digitales</CardTitle>
              <CardDescription>
                Verificacion y operatividad de aulas digitales con generacion de
                constancia PDF
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </main>
  );
}
