import { describe, it, expect } from 'vitest'
import {
  parseFormFields,
  validateCustomData,
  displayValue,
  FORM_FIELD_TYPES,
  type FormField,
} from '@/lib/eventForm'

// ---------------------------------------------------------------------------
// parseFormFields
// ---------------------------------------------------------------------------

describe('parseFormFields', () => {
  it('returns empty array for non-array input', () => {
    expect(parseFormFields(null)).toEqual([])
    expect(parseFormFields(undefined)).toEqual([])
    expect(parseFormFields({})).toEqual([])
    expect(parseFormFields('string')).toEqual([])
    expect(parseFormFields(42)).toEqual([])
  })

  it('returns empty array for empty array input', () => {
    expect(parseFormFields([])).toEqual([])
  })

  it('drops entries that are not objects', () => {
    const result = parseFormFields([null, 'string', 42, true])
    expect(result).toHaveLength(0)
  })

  it('drops entries missing id', () => {
    const result = parseFormFields([{ label: 'Name', type: 'text', required: false }])
    expect(result).toHaveLength(0)
  })

  it('drops entries with non-string id', () => {
    const result = parseFormFields([{ id: 123, label: 'Name', type: 'text', required: false }])
    expect(result).toHaveLength(0)
  })

  it('drops entries missing label', () => {
    const result = parseFormFields([{ id: 'f1', type: 'text', required: false }])
    expect(result).toHaveLength(0)
  })

  it('drops entries with non-string label', () => {
    const result = parseFormFields([{ id: 'f1', label: 99, type: 'text', required: false }])
    expect(result).toHaveLength(0)
  })

  it('drops entries with invalid type', () => {
    const result = parseFormFields([{ id: 'f1', label: 'X', type: 'radio', required: false }])
    expect(result).toHaveLength(0)
  })

  it('drops entries with missing type', () => {
    const result = parseFormFields([{ id: 'f1', label: 'X', required: false }])
    expect(result).toHaveLength(0)
  })

  it('accepts all valid FORM_FIELD_TYPES', () => {
    const raw = FORM_FIELD_TYPES.map((type, i) => ({ id: `f${i}`, label: `Field ${i}`, type, required: false }))
    const result = parseFormFields(raw)
    expect(result).toHaveLength(FORM_FIELD_TYPES.length)
  })

  it('keeps a valid text field', () => {
    const raw = [{ id: 'f1', label: 'Name', type: 'text', required: true }]
    const result = parseFormFields(raw)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 'f1', label: 'Name', type: 'text', required: true })
  })

  it('treats required as false when not exactly true', () => {
    const raw = [{ id: 'f1', label: 'X', type: 'text', required: 'yes' }]
    const result = parseFormFields(raw)
    expect(result[0].required).toBe(false)
  })

  it('strips non-string options from select fields', () => {
    const raw = [{ id: 'f1', label: 'Color', type: 'select', required: false, options: ['red', 42, 'blue', null] }]
    const result = parseFormFields(raw)
    expect(result[0].options).toEqual(['red', 'blue'])
  })

  it('assigns no options when options is not an array on select', () => {
    const raw = [{ id: 'f1', label: 'Color', type: 'select', required: false, options: 'red,blue' }]
    const result = parseFormFields(raw)
    expect(result[0].options).toBeUndefined()
  })

  it('does not attach options to non-select fields', () => {
    const raw = [{ id: 'f1', label: 'Name', type: 'text', required: false, options: ['a', 'b'] }]
    const result = parseFormFields(raw)
    expect(result[0].options).toBeUndefined()
  })

  it('copies placeholder when it is a string', () => {
    const raw = [{ id: 'f1', label: 'Name', type: 'text', required: false, placeholder: 'Enter name' }]
    const result = parseFormFields(raw)
    expect(result[0].placeholder).toBe('Enter name')
  })

  it('does not copy placeholder when it is not a string', () => {
    const raw = [{ id: 'f1', label: 'Name', type: 'text', required: false, placeholder: 123 }]
    const result = parseFormFields(raw)
    expect(result[0].placeholder).toBeUndefined()
  })

  it('parses a mixed array and keeps only valid entries', () => {
    const raw = [
      { id: 'f1', label: 'Name', type: 'text', required: true },
      { label: 'Missing id', type: 'text', required: false },
      { id: 'f3', label: 'Choice', type: 'select', required: false, options: ['A', 'B'] },
    ]
    const result = parseFormFields(raw)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('f1')
    expect(result[1].id).toBe('f3')
  })
})

// ---------------------------------------------------------------------------
// validateCustomData
// ---------------------------------------------------------------------------

const textField: FormField = { id: 'name', label: 'Naam', type: 'text', required: true }
const optionalText: FormField = { id: 'bio', label: 'Bio', type: 'text', required: false }
const selectField: FormField = { id: 'color', label: 'Kleur', type: 'select', required: true, options: ['rood', 'blauw'] }
const checkboxRequired: FormField = { id: 'agree', label: 'Akkoord', type: 'checkbox', required: true }
const checkboxOptional: FormField = { id: 'newsletter', label: 'Nieuwsbrief', type: 'checkbox', required: false }
const numberField: FormField = { id: 'age', label: 'Leeftijd', type: 'number', required: true }
const dateField: FormField = { id: 'dob', label: 'Geboortedatum', type: 'date', required: true }

describe('validateCustomData', () => {
  describe('non-object submitted data', () => {
    it('treats null as empty object — fails required fields', () => {
      const result = validateCustomData([textField], null)
      expect(result.ok).toBe(false)
    })

    it('treats a string as empty object — fails required fields', () => {
      const result = validateCustomData([textField], 'bad input')
      expect(result.ok).toBe(false)
    })

    it('passes when no fields defined and data is null', () => {
      const result = validateCustomData([], null)
      expect(result.ok).toBe(true)
      expect(result.clean).toEqual({})
    })
  })

  describe('required text field', () => {
    it('fails when required text field is missing', () => {
      const result = validateCustomData([textField], {})
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Naam')
    })

    it('fails when required text field is empty string', () => {
      const result = validateCustomData([textField], { name: '' })
      expect(result.ok).toBe(false)
    })

    it('fails when required text field is whitespace only', () => {
      const result = validateCustomData([textField], { name: '   ' })
      expect(result.ok).toBe(false)
    })

    it('passes when required text field has a value', () => {
      const result = validateCustomData([textField], { name: 'Jan' })
      expect(result.ok).toBe(true)
      expect(result.clean.name).toBe('Jan')
    })

    it('trims leading/trailing whitespace', () => {
      const result = validateCustomData([textField], { name: '  Jan  ' })
      expect(result.ok).toBe(true)
      expect(result.clean.name).toBe('Jan')
    })
  })

  describe('optional text field', () => {
    it('passes when optional field is absent', () => {
      const result = validateCustomData([optionalText], {})
      expect(result.ok).toBe(true)
      expect(result.clean.bio).toBeUndefined()
    })

    it('passes when optional field is empty string', () => {
      const result = validateCustomData([optionalText], { bio: '' })
      expect(result.ok).toBe(true)
    })

    it('stores value when optional field is provided', () => {
      const result = validateCustomData([optionalText], { bio: 'Developer' })
      expect(result.ok).toBe(true)
      expect(result.clean.bio).toBe('Developer')
    })
  })

  describe('checkbox field', () => {
    it('fails when required checkbox is false (boolean)', () => {
      const result = validateCustomData([checkboxRequired], { agree: false })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Akkoord')
    })

    it('fails when required checkbox is absent', () => {
      const result = validateCustomData([checkboxRequired], {})
      expect(result.ok).toBe(false)
    })

    it('passes when required checkbox is true (boolean)', () => {
      const result = validateCustomData([checkboxRequired], { agree: true })
      expect(result.ok).toBe(true)
      expect(result.clean.agree).toBe(true)
    })

    it('passes when required checkbox is string "true"', () => {
      const result = validateCustomData([checkboxRequired], { agree: 'true' })
      expect(result.ok).toBe(true)
      expect(result.clean.agree).toBe(true)
    })

    it('passes when required checkbox is string "on"', () => {
      const result = validateCustomData([checkboxRequired], { agree: 'on' })
      expect(result.ok).toBe(true)
      expect(result.clean.agree).toBe(true)
    })

    it('normalizes truthy string to boolean true', () => {
      const result = validateCustomData([checkboxOptional], { newsletter: 'true' })
      expect(result.clean.newsletter).toBe(true)
    })

    it('normalizes absent optional checkbox to false', () => {
      const result = validateCustomData([checkboxOptional], {})
      expect(result.ok).toBe(true)
      expect(result.clean.newsletter).toBe(false)
    })
  })

  describe('select field', () => {
    it('fails when submitted value is not in options', () => {
      const result = validateCustomData([selectField], { color: 'groen' })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Kleur')
    })

    it('passes when submitted value is a valid option', () => {
      const result = validateCustomData([selectField], { color: 'rood' })
      expect(result.ok).toBe(true)
      expect(result.clean.color).toBe('rood')
    })

    it('fails when select field is required and empty', () => {
      const result = validateCustomData([selectField], { color: '' })
      expect(result.ok).toBe(false)
    })

    it('fails for select field with no options defined', () => {
      const noOptionsSelect: FormField = { id: 'size', label: 'Maat', type: 'select', required: false }
      const result = validateCustomData([noOptionsSelect], { size: 'L' })
      expect(result.ok).toBe(false)
    })
  })

  describe('number field', () => {
    it('fails when value is not a number', () => {
      const result = validateCustomData([numberField], { age: 'abc' })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Leeftijd')
    })

    it('passes for a valid integer string', () => {
      const result = validateCustomData([numberField], { age: '25' })
      expect(result.ok).toBe(true)
      expect(result.clean.age).toBe('25')
    })

    it('passes for a valid float string', () => {
      const result = validateCustomData([numberField], { age: '3.14' })
      expect(result.ok).toBe(true)
    })

    it('passes for zero', () => {
      const result = validateCustomData([numberField], { age: '0' })
      expect(result.ok).toBe(true)
    })
  })

  describe('date field', () => {
    it('fails when value is not a parseable date', () => {
      const result = validateCustomData([dateField], { dob: 'not-a-date' })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Geboortedatum')
    })

    it('passes for an ISO date string', () => {
      const result = validateCustomData([dateField], { dob: '2000-01-15' })
      expect(result.ok).toBe(true)
      expect(result.clean.dob).toBe('2000-01-15')
    })

    it('passes for a full ISO datetime string', () => {
      const result = validateCustomData([dateField], { dob: '2000-01-15T10:30:00Z' })
      expect(result.ok).toBe(true)
    })
  })

  describe('max-length enforcement', () => {
    it('fails when value exceeds 2000 characters', () => {
      const result = validateCustomData([optionalText], { bio: 'x'.repeat(2001) })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('te lang')
    })

    it('passes when value is exactly 2000 characters', () => {
      const result = validateCustomData([optionalText], { bio: 'x'.repeat(2000) })
      expect(result.ok).toBe(true)
    })
  })

  describe('unknown field ids are ignored', () => {
    it('does not include unknown fields in clean output', () => {
      const result = validateCustomData([textField], { name: 'Jan', unknown_field: 'surprise' })
      expect(result.ok).toBe(true)
      expect(result.clean).not.toHaveProperty('unknown_field')
    })

    it('passes with no known fields even when unknown data is submitted', () => {
      const result = validateCustomData([], { ghost: 'value' })
      expect(result.ok).toBe(true)
      expect(Object.keys(result.clean)).toHaveLength(0)
    })
  })

  describe('multiple fields', () => {
    it('validates all fields and returns combined clean data', () => {
      const fields: FormField[] = [textField, checkboxRequired, selectField]
      const result = validateCustomData(fields, { name: 'Jan', agree: true, color: 'blauw' })
      expect(result.ok).toBe(true)
      expect(result.clean).toMatchObject({ name: 'Jan', agree: true, color: 'blauw' })
    })

    it('stops at first failure and returns error', () => {
      const fields: FormField[] = [textField, checkboxRequired]
      const result = validateCustomData(fields, { name: 'Jan', agree: false })
      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})

// ---------------------------------------------------------------------------
// displayValue
// ---------------------------------------------------------------------------

describe('displayValue', () => {
  const cbField: FormField = { id: 'agree', label: 'Akkoord', type: 'checkbox', required: false }
  const txtField: FormField = { id: 'name', label: 'Naam', type: 'text', required: false }

  it('returns "Ja" when checkbox value is true', () => {
    expect(displayValue(cbField, { agree: true })).toBe('Ja')
  })

  it('returns "Nee" when checkbox value is false', () => {
    expect(displayValue(cbField, { agree: false })).toBe('Nee')
  })

  it('returns "Nee" when checkbox key is absent in data', () => {
    expect(displayValue(cbField, {})).toBe('Nee')
  })

  it('returns empty string when text field value is undefined', () => {
    expect(displayValue(txtField, {})).toBe('')
  })

  it('returns empty string when text field value is null', () => {
    // CustomData type only allows string|boolean, but null from DB could slip through
    expect(displayValue(txtField, { name: null as unknown as string })).toBe('')
  })

  it('returns the string value for a text field', () => {
    expect(displayValue(txtField, { name: 'Jan' })).toBe('Jan')
  })

  it('converts non-string non-boolean value to string', () => {
    const numField: FormField = { id: 'age', label: 'Leeftijd', type: 'number', required: false }
    expect(displayValue(numField, { age: '42' })).toBe('42')
  })
})
