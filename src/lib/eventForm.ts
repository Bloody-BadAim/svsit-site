// Custom aanmeld-velden per event. Definities staan op event.form_fields,
// antwoorden op ticket.custom_data. Gedeeld tussen admin-builder, publieke
// TicketForm en de tickets-API (server-side validatie).

export const FORM_FIELD_TYPES = ['text', 'textarea', 'select', 'checkbox', 'number', 'date'] as const

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number]

export interface FormField {
  id: string
  label: string
  type: FormFieldType
  required: boolean
  options?: string[]
  placeholder?: string | null
}

export const FORM_FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: 'Korte tekst',
  textarea: 'Lange tekst',
  select: 'Keuze (dropdown)',
  checkbox: 'Aanvinkvakje',
  number: 'Getal',
  date: 'Datum',
}

/** Antwoord per veld-id. checkbox -> boolean, rest -> string. */
export type CustomData = Record<string, string | boolean>

let idCounter = 0
export function newFieldId(): string {
  idCounter += 1
  return `f${Date.now().toString(36)}${idCounter}`
}

/** Parse onbekende json (uit DB) naar een veilige FormField[]. */
export function parseFormFields(raw: unknown): FormField[] {
  if (!Array.isArray(raw)) return []
  const out: FormField[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const f = item as Record<string, unknown>
    if (typeof f.id !== 'string' || typeof f.label !== 'string') continue
    if (!FORM_FIELD_TYPES.includes(f.type as FormFieldType)) continue
    const field: FormField = {
      id: f.id,
      label: f.label,
      type: f.type as FormFieldType,
      required: f.required === true,
    }
    if (field.type === 'select' && Array.isArray(f.options)) {
      field.options = f.options.filter((o): o is string => typeof o === 'string')
    }
    if (typeof f.placeholder === 'string') field.placeholder = f.placeholder
    out.push(field)
  }
  return out
}

export interface ValidationResult {
  ok: boolean
  error?: string
  /** Genormaliseerde data: alleen bekende velden, juiste types. */
  clean: CustomData
}

/**
 * Valideer ingezonden antwoorden tegen de velddefinities van het event.
 * Negeert onbekende veld-ids. Checkt required + dropdown-opties + getal/datum.
 */
export function validateCustomData(fields: FormField[], submitted: unknown): ValidationResult {
  const data = (submitted && typeof submitted === 'object' ? submitted : {}) as Record<string, unknown>
  const clean: CustomData = {}

  for (const field of fields) {
    const raw = data[field.id]

    if (field.type === 'checkbox') {
      const checked = raw === true || raw === 'true' || raw === 'on'
      if (field.required && !checked) {
        return { ok: false, error: `"${field.label}" is verplicht`, clean }
      }
      clean[field.id] = checked
      continue
    }

    const value = raw == null ? '' : String(raw).trim()

    if (!value) {
      if (field.required) return { ok: false, error: `"${field.label}" is verplicht`, clean }
      continue
    }

    if (field.type === 'select') {
      const options = field.options ?? []
      if (!options.includes(value)) {
        return { ok: false, error: `Ongeldige keuze bij "${field.label}"`, clean }
      }
    }

    if (field.type === 'number' && Number.isNaN(Number(value))) {
      return { ok: false, error: `"${field.label}" moet een getal zijn`, clean }
    }

    if (field.type === 'date' && Number.isNaN(Date.parse(value))) {
      return { ok: false, error: `"${field.label}" moet een geldige datum zijn`, clean }
    }

    if (value.length > 2000) {
      return { ok: false, error: `"${field.label}" is te lang (max 2000 tekens)`, clean }
    }

    clean[field.id] = value
  }

  return { ok: true, clean }
}

/** Toon-waarde voor admin-lijst / CSV. */
export function displayValue(field: FormField, data: CustomData): string {
  const v = data[field.id]
  if (field.type === 'checkbox') return v === true ? 'Ja' : 'Nee'
  if (v == null) return ''
  return String(v)
}
