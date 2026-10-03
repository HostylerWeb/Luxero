import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import type { CompetitionCurrency } from "./types";

const CURRENCY_SYMBOLS: Record<CompetitionCurrency, string> = {
  GBP: "\u00A3",
  EUR: "\u20AC",
};

interface CurrencyInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string;
  step?: string;
  required?: boolean;
  disabled?: boolean;
  currency?: CompetitionCurrency;
}

function CurrencyInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  min = "0",
  step = "0.01",
  required,
  disabled,
  currency = "GBP",
}: CurrencyInputProps) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? CURRENCY_SYMBOLS.GBP;
  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText>{symbol}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </InputGroup>
  );
}

export { CurrencyInput };
