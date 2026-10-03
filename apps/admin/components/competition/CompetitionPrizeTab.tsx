"use client";

import { DateTimePicker } from "@/components/DateTimePicker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "./CurrencyInput";
import type { CompetitionFormState } from "./types";

interface CompetitionPrizeTabProps {
  form: CompetitionFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormUpdate: (updater: (prev: CompetitionFormState) => CompetitionFormState) => void;
  drawDateError?: string;
}

function CompetitionPrizeTab({
  form,
  onChange,
  onFormUpdate,
  drawDateError,
}: CompetitionPrizeTabProps) {
  return (
    <FieldGroup>
      <FieldSeparator>Prize & Draw</FieldSeparator>

      <div className="flex flex-col gap-5 @md/field-group:flex-row">
        <Field className="@md/field-group:flex-1">
          <FieldLabel htmlFor="prizeValue">Prize Value</FieldLabel>
          <CurrencyInput
            id="prizeValue"
            name="prizeValue"
            currency={form.currency}
            value={form.prizeValue as unknown as string}
            onChange={onChange}
            placeholder="75000.00"
          />
          <FieldDescription>
            Cash value of the prize. Shown as the &apos;Cash Alternative&apos; (or the cash prize
            when &apos;Cash prize&apos; is enabled) on the storefront.
          </FieldDescription>
        </Field>
        <Field className="@md/field-group:flex-1">
          <FieldLabel htmlFor="prizeCurrency">Prize Currency</FieldLabel>
          <Select
            value={form.currency}
            onValueChange={(value) =>
              onFormUpdate((p) => ({ ...p, currency: value as CompetitionFormState["currency"] }))
            }
          >
            <SelectTrigger id="prizeCurrency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">{"GBP (\u00A3) \u2014 British Pound"}</SelectItem>
              <SelectItem value="EUR">{"EUR (\u20AC) \u2014 Euro"}</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            Currency applied only to the prize cash value. Ticket prices are always charged in GBP.
          </FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="drawDate">Draw Date</FieldLabel>
        <DateTimePicker
          id="drawDate"
          value={form.drawDate}
          onChange={(value) => onFormUpdate((p) => ({ ...p, drawDate: value }))}
          placeholder="Schedule draw date and time"
          error={drawDateError}
        />
        <FieldDescription>When the main prize draw is scheduled.</FieldDescription>
      </Field>

      <FieldSeparator>Display</FieldSeparator>

      <Field>
        <FieldLabel htmlFor="displayOrder">Display Order</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>#</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id="displayOrder"
            name="displayOrder"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={form.displayOrder}
            onChange={onChange}
            placeholder="0"
          />
        </InputGroup>
        <FieldDescription>Lower numbers appear first on the storefront.</FieldDescription>
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="isFeatured"
          checked={form.isFeatured}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            onFormUpdate((p) => ({ ...p, isFeatured: checked === true }))
          }
          className="border-gold/50 data-checked:border-gold data-checked:bg-gold"
        />
        <FieldContent>
          <FieldLabel htmlFor="isFeatured">Featured Competition</FieldLabel>
          <FieldDescription>
            Highlights this competition on the homepage and in featured carousels. Featured
            competitions only appear on the storefront when status is Active.
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="isCashOnly"
          name="isCashOnly"
          checked={form.isCashOnly}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            onFormUpdate((p) => ({ ...p, isCashOnly: checked === true }))
          }
          className="border-gold/50 data-checked:border-gold data-checked:bg-gold"
        />
        <FieldContent>
          <FieldLabel htmlFor="isCashOnly">Cash prize</FieldLabel>
          <FieldDescription>
            Cash prizes are paid out in money and display 'Tax Free' instead of 'Cash Alternative'.
            Set this independently of the competition's category.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}

export { CompetitionPrizeTab };
