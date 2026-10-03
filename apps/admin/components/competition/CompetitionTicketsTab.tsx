"use client";

import {
  Field,
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
import { CurrencyInput } from "./CurrencyInput";
import type { CompetitionFormState } from "./types";

interface CompetitionTicketsTabProps {
  form: CompetitionFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormUpdate: (updater: (prev: CompetitionFormState) => CompetitionFormState) => void;
}

const TICKET_CURRENCY = "GBP";

function CompetitionTicketsTab({ form, onChange }: CompetitionTicketsTabProps) {
  return (
    <FieldGroup>
      <FieldSeparator>Ticket Pricing</FieldSeparator>

      <Field>
        <FieldLabel htmlFor="ticketPrice">Ticket Price</FieldLabel>
        <CurrencyInput
          id="ticketPrice"
          name="ticketPrice"
          currency={TICKET_CURRENCY}
          value={form.ticketPrice as unknown as string}
          onChange={onChange}
          placeholder="2.50"
        />
        <FieldDescription>
          Ticket price in {TICKET_CURRENCY}. Payments are always processed in GBP.
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="hasOriginalPrice">
          <input
            id="hasOriginalPrice"
            name="hasOriginalPrice"
            type="checkbox"
            checked={form.hasOriginalPrice}
            onChange={onChange}
            className="mr-2"
          />
          Show original price
        </FieldLabel>
        <FieldDescription>
          Display a higher compare-at price with strikethrough next to the ticket price
        </FieldDescription>
      </Field>

      {form.hasOriginalPrice && (
        <Field>
          <FieldLabel htmlFor="originalPrice">Original Price</FieldLabel>
          <CurrencyInput
            id="originalPrice"
            name="originalPrice"
            currency={TICKET_CURRENCY}
            value={form.originalPrice as unknown as string}
            onChange={onChange}
            placeholder="5.00"
          />
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="requireSignIn">
          <input
            id="requireSignIn"
            name="requireSignIn"
            type="checkbox"
            checked={form.requireSignIn}
            onChange={onChange}
            className="mr-2"
          />
          Require sign-in
        </FieldLabel>
        <FieldDescription>
          Guest users cannot add this competition to their cart. Only signed-in users can enter.
        </FieldDescription>
      </Field>

      <FieldSeparator>Capacity</FieldSeparator>

      <div className="flex flex-col gap-5 @md/field-group:flex-row">
        <Field className="@md/field-group:flex-1">
          <FieldLabel htmlFor="maxTickets">Max Tickets</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>Qty</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="maxTickets"
              name="maxTickets"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.maxTickets}
              onChange={onChange}
              placeholder="500"
            />
          </InputGroup>
          <FieldDescription>Total tickets available for this competition.</FieldDescription>
        </Field>
        <Field className="@md/field-group:flex-1">
          <FieldLabel htmlFor="maxTicketsPerUser">Max Tickets Per User</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>Max</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="maxTicketsPerUser"
              name="maxTicketsPerUser"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.maxTicketsPerUser}
              onChange={onChange}
              placeholder="10"
            />
          </InputGroup>
          <FieldDescription>Purchase limit per customer account.</FieldDescription>
        </Field>
      </div>
    </FieldGroup>
  );
}

export { CompetitionTicketsTab };
