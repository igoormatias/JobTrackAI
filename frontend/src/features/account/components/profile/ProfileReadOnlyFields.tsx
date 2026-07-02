"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { AccountUser } from "@/types";

export type ProfileReadOnlyFieldsProps = {
  user: AccountUser;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const ProfileReadOnlyFields = ({ user }: ProfileReadOnlyFieldsProps) => (
  <div className="rounded-xl border border-border bg-card p-6">
    <h2 className="mb-4 text-sm font-semibold text-foreground">Dados da conta Google</h2>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="h-16 w-16">
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="account-name">Nome</Label>
          <Input id="account-name" value={user.name} readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-email">E-mail</Label>
          <Input id="account-email" value={user.email} readOnly disabled />
        </div>
      </div>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">
      Nome, e-mail e foto são gerenciados pela sua conta Google e não podem ser alterados aqui.
    </p>
  </div>
);
