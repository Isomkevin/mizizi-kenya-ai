import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useCreateFarmer } from "@/api/hooks/use-farmers";
import type { CreateFarmerInput } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm: CreateFarmerInput = {
  name: "",
  farmerId: "",
  phone: "",
  county: "",
  cooperative: "",
  cropType: "",
};

interface CreateFarmerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFarmerDialog({ open, onOpenChange }: CreateFarmerDialogProps) {
  const navigate = useNavigate();
  const createFarmer = useCreateFarmer();
  const [form, setForm] = useState<CreateFarmerInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CreateFarmerInput>(key: K, value: CreateFarmerInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(emptyForm);
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.farmerId.trim() || !form.county.trim()) {
      setError("Name, farmer ID, and county are required.");
      return;
    }

    try {
      const farmer = await createFarmer.mutateAsync({
        name: form.name.trim(),
        farmerId: form.farmerId.trim(),
        phone: form.phone?.trim() || undefined,
        county: form.county.trim(),
        cooperative: form.cooperative.trim() || "Unassigned cooperative",
        cropType: form.cropType.trim() || "Maize",
      });
      handleOpenChange(false);
      void navigate({ to: "/app/farmers/$farmerId", params: { farmerId: farmer.id } });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create farmer.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create farmer profile</DialogTitle>
          <DialogDescription>
            Register a new farmer to begin risk assessment and relationship mapping.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <Field label="Full name" id="farmer-name" required>
            <Input
              id="farmer-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Wanjiru Kamau"
              autoComplete="name"
            />
          </Field>

          <Field label="Farmer / national ID" id="farmer-id" required>
            <Input
              id="farmer-id"
              value={form.farmerId}
              onChange={(event) => updateField("farmerId", event.target.value)}
              placeholder="F004-NAK-2026"
            />
          </Field>

          <Field label="Phone" id="farmer-phone">
            <Input
              id="farmer-phone"
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+254 7XX XXX XXX"
              autoComplete="tel"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="County" id="farmer-county" required>
              <Input
                id="farmer-county"
                value={form.county}
                onChange={(event) => updateField("county", event.target.value)}
                placeholder="Nakuru"
              />
            </Field>
            <Field label="Crop type" id="farmer-crop">
              <Input
                id="farmer-crop"
                value={form.cropType}
                onChange={(event) => updateField("cropType", event.target.value)}
                placeholder="Potato"
              />
            </Field>
          </div>

          <Field label="Cooperative" id="farmer-coop">
            <Input
              id="farmer-coop"
              value={form.cooperative}
              onChange={(event) => updateField("cooperative", event.target.value)}
              placeholder="Molo Farmers Cooperative"
            />
          </Field>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFarmer.isPending}>
              {createFarmer.isPending ? "Creating…" : "Create profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
