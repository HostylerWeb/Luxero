"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { CompetitionSettingsFormState } from "./types";

interface CompetitionSettingsFormProps {
  form: CompetitionSettingsFormState;
  onFormUpdate: (
    updater: (prev: CompetitionSettingsFormState) => CompetitionSettingsFormState
  ) => void;
}

function CompetitionSettingsForm({ form, onFormUpdate }: CompetitionSettingsFormProps) {
  return (
    <FieldGroup className="gap-6">
      <Field>
        <FieldLabel>Combine conditions with</FieldLabel>
        <RadioGroup
          value={form.endingSoonCombineMode}
          onValueChange={(value: string) =>
            onFormUpdate((p) => ({
              ...p,
              endingSoonCombineMode: value as "and" | "or",
            }))
          }
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="or" id="ending-soon-or" />
            <Label htmlFor="ending-soon-or" className="font-normal">
              OR (either condition)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="and" id="ending-soon-and" />
            <Label htmlFor="ending-soon-and" className="font-normal">
              AND (both conditions)
            </Label>
          </div>
        </RadioGroup>
        <FieldDescription>
          OR shows competitions matching any enabled rule; AND requires every enabled rule to match.
        </FieldDescription>
      </Field>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <FieldLabel htmlFor="endingSoonTimeEnabled">Time condition</FieldLabel>
            <FieldDescription>
              Competition ends within the configured number of days.
            </FieldDescription>
          </div>
          <Switch
            id="endingSoonTimeEnabled"
            checked={form.endingSoonTimeEnabled}
            onCheckedChange={(checked) =>
              onFormUpdate((p) => ({ ...p, endingSoonTimeEnabled: checked }))
            }
            aria-label="Enable time condition"
          />
        </div>
        <Field>
          <FieldLabel htmlFor="endingSoonDaysThreshold">Days threshold</FieldLabel>
          <Input
            id="endingSoonDaysThreshold"
            type="number"
            min="1"
            value={form.endingSoonDaysThreshold}
            disabled={!form.endingSoonTimeEnabled}
            onChange={(e) =>
              onFormUpdate((p) => ({
                ...p,
                endingSoonDaysThreshold: e.target.value,
              }))
            }
          />
        </Field>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <FieldLabel htmlFor="endingSoonTicketsEnabled">Ticket condition</FieldLabel>
            <FieldDescription>
              Competition meets a ticket availability or sales percentage threshold.
            </FieldDescription>
          </div>
          <Switch
            id="endingSoonTicketsEnabled"
            checked={form.endingSoonTicketsEnabled}
            onCheckedChange={(checked) =>
              onFormUpdate((p) => ({ ...p, endingSoonTicketsEnabled: checked }))
            }
            aria-label="Enable ticket condition"
          />
        </div>
        <Field>
          <FieldLabel htmlFor="endingSoonTicketsMetric">Ticket metric</FieldLabel>
          <Select
            value={form.endingSoonTicketsMetric}
            onValueChange={(value) =>
              onFormUpdate((p) => ({
                ...p,
                endingSoonTicketsMetric: value as "remaining" | "sold",
              }))
            }
            disabled={!form.endingSoonTicketsEnabled}
          >
            <SelectTrigger id="endingSoonTicketsMetric" className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remaining">Remaining % (low stock)</SelectItem>
              <SelectItem value="sold">Sold % (high demand)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="endingSoonTicketsThreshold">Threshold (%)</FieldLabel>
          <Input
            id="endingSoonTicketsThreshold"
            type="number"
            min="0"
            max="100"
            value={form.endingSoonTicketsThreshold}
            disabled={!form.endingSoonTicketsEnabled}
            onChange={(e) =>
              onFormUpdate((p) => ({
                ...p,
                endingSoonTicketsThreshold: e.target.value,
              }))
            }
          />
          <FieldDescription>
            {form.endingSoonTicketsMetric === "sold"
              ? "Qualifies when at least this percentage of tickets have been sold."
              : "Qualifies when at most this percentage of tickets remain available."}
          </FieldDescription>
        </Field>
      </div>
    </FieldGroup>
  );
}

export { CompetitionSettingsForm };
