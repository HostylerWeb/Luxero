// Pure i18n interpolation helpers (no React/vike imports) so they can be unit-tested.

// Romanian marks plural with word-specific forms (not a single suffix), so the
// "one" / "other" form for every word that precedes `{plural}` in ro.json is
// listed explicitly. Few/other always share the same form for these nouns, so a
// one-vs-other split is grammatically correct.

const RO_PLURAL_FORMS: Record<string, { one: string; other: string }> = {
  articol: { one: "articol", other: "articole" },
  actualizat: { one: "actualizat", other: "actualizate" },
  bilet: { one: "bilet", other: "bilete" },
  disponibil: { one: "disponibil", other: "disponibile" },
  premiu: { one: "premiu", other: "premii" },
  cumpărat: { one: "cumpărat", other: "cumpărate" },
  câștig: { one: "câștig", other: "câștiguri" },
  etapă: { one: "etapă", other: "etape" },
  extragere: { one: "extragere", other: "extrageri" },
  atinsă: { one: "atinsă", other: "atinse" },
  acordat: { one: "acordat", other: "acordate" },
  configurată: { one: "configurată", other: "configurate" },
  activ: { one: "activ", other: "active" },
  răscumpărabil: { one: "răscumpărabil", other: "răscumpărabili" },
  răscumpărat: { one: "răscumpărat", other: "răscumpărate" },
  rămas: { one: "rămas", other: "rămase" },
};

/**
 * Coerce a plural-driving value to a number, tolerating locale-formatted
 * strings. `Number("1,000")` is NaN and `Number("1.000")` is 1 (ro-RO grouping
 * separator), both of which break `Intl.PluralRules.select()`. Grouping
 * separators are stripped per locale before parsing.
 */
function toPluralNumber(value: string | number | undefined, locale?: string): number {
  if (value === undefined) return NaN;
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const str = String(value).trim();
  if (!str) return NaN;
  const normalized =
    locale === "ro" ? str.replace(/\./g, "").replace(/,/g, ".") : str.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
  locale?: string
): string {
  if (!params) return template;

  const loc = locale ?? "en";

  // Resolve {plural} with locale-aware plural rules
  const hasPluralDriver = params.count !== undefined || params.n !== undefined;
  const count = toPluralNumber(params.count !== undefined ? params.count : params.n, loc);

  if (hasPluralDriver && Number.isFinite(count)) {
    const rules = new Intl.PluralRules(loc);
    const category = rules.select(count);

    if (loc === "ro") {
      // Romanian: word-specific plural forms
      template = template.replace(/([^\s{]+)\{plural\}/g, (_match, word: string) => {
        const forms = RO_PLURAL_FORMS[String(word).toLowerCase()];
        if (!forms) return word;
        return category === "one" ? forms.one : forms.other;
      });
    } else {
      // English and other locales: simple "s" suffix
      template = template.replace(/\{plural\}/g, category === "one" ? "" : "s");
    }
  }

  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export { interpolate, RO_PLURAL_FORMS, toPluralNumber };
