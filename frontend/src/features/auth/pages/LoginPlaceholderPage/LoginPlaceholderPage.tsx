"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/typography";

export const LoginPlaceholderPage = () => (
  <Card className="w-full max-w-md">
    <CardHeader className="space-y-2 text-center">
      <Heading level={2}>JobTrack AI</Heading>
      <p className="text-sm text-muted-foreground">Entre para gerenciar sua carreira</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <Button variant="outline" className="w-full" disabled>
        Entrar com Google
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">ou</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" placeholder="••••••••" disabled />
      </div>
      <Button className="w-full" disabled>
        Entrar na Plataforma
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="text-primary hover:underline">
          Continuar para o app (dev)
        </Link>
      </p>
    </CardContent>
  </Card>
);
