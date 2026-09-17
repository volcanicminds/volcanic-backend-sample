//
// Domain vocabularies.
//
// Plain string unions plus a frozen list, and not a TypeScript `enum`: the list is what the
// column check and the JSON schema are built from, so the values live in one place and a new
// one cannot be added to the type without appearing in the validation.
//
export const PARTNER_TYPES = ['client_supplier', 'client', 'supplier', 'contact', 'other'] as const
export type PartnerType = (typeof PARTNER_TYPES)[number]

export const USER_LANGUAGES = ['en', 'it'] as const
export type UserLanguage = (typeof USER_LANGUAGES)[number]
