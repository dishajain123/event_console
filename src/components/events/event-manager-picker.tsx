"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listEventManagers } from "@/api/identity";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function EventManagerPicker({ value, onChange, enabled = true }: {
  value: string; onChange: (value: string) => void; enabled?: boolean;
}) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const managers = useQuery({ queryKey: ["event-managers"], queryFn: listEventManagers, enabled });
  const matches = (managers.data ?? []).filter(user => user.id === value ||
    [user.name, user.mobile_number, user.email].some(field => field?.toLowerCase().includes(search.toLowerCase())));
  return <div className="space-y-2">
    <label htmlFor={searchId} className="block text-sm font-medium">Event Manager</label>
    <Input id={searchId} placeholder="Search name, mobile or email" value={search} onChange={e => setSearch(e.target.value)} />
    <Select aria-label="Event Manager account" value={value} onChange={e => onChange(e.target.value)} disabled={managers.isPending || managers.isError}>
      <option value="">{managers.isPending ? "Loading managers…" : "Select an existing Event Manager"}</option>
      {matches.map(user => <option key={user.id} value={user.id}>{user.name || "Unnamed account"} — {user.mobile_number || user.email}</option>)}
    </Select>
    {managers.isError && <div role="alert" className="text-sm text-[var(--danger)]">Couldn&apos;t load managers. <Button type="button" variant="ghost" onClick={() => managers.refetch()}>Try again</Button></div>}
    {managers.isSuccess && managers.data.length === 0 && <p className="text-sm">Create an Event Manager account first in <Link className="underline" href="/ops/admin-accounts">Admin Accounts</Link>.</p>}
    {managers.isSuccess && managers.data.length > 0 && matches.length === 0 && <p className="text-sm">No managers match your search.</p>}
  </div>;
}
