export interface BusinessInfoData {
  company_name: string
  country: string
  legal_form: string
  registration_number: string
  address: string
}

export interface AccountOwnerData {
  given_names: string
  last_name: string
  email: string
  role_in_company: string
}

export interface PersonalInfoData {
  birth_date_day: number
  birth_date_month: number
  birth_date_year: number
  nationality: string
  address_single_line: string
  phone_number: string
}

export type PersonRole = 'DIRECTOR' | 'UBO' | 'SHAREHOLDER' | 'ACCOUNT_OWNER'

export interface RelationPerson {
  id: string
  given_names: string
  last_name: string
  email?: string
  roles: PersonRole[]
  direct_ownership_percentage?: number
  nationalities?: string[]
  birth_date_day?: number
  birth_date_month?: number
  birth_date_year?: number
  address_single_line?: string
  fromEnrichment?: boolean
}

export interface DocumentFile {
  file: File | null
  fileName: string | null
  fileId?: string
  expectedDocumentId?: string
}

export interface ExpectedDocument {
  id: string
  name: string
  slug: string
  is_mandatory: boolean
  attached_to: string
}

// Helper to check if an expected document is person-specific based on attached_to
export function isPersonDocument(doc: ExpectedDocument): boolean {
  const personAttachedTo = [
    'PERSON', 'ACCOUNT_OWNER', 'PERSON_DIRECTOR', 'PERSON_UBO', 'PERSON_SHAREHOLDER',
    'RELATED_BUSINESS_DIRECTOR',
  ]
  return personAttachedTo.includes(doc.attached_to)
}

// Helper to check if an expected document is for company/business
export function isCompanyDocument(doc: ExpectedDocument): boolean {
  return !isPersonDocument(doc)
}

export interface PersonDocuments {
  personId: string
  personName: string
  expectedDocumentId?: string
  expectedDocumentName?: string
  front: DocumentFile
  back: DocumentFile
}

export interface DocumentsData {
  kbis: DocumentFile
  companyFiles?: DocumentFile[]
  personDocuments: PersonDocuments[]
  expectedDocuments?: ExpectedDocument[]
}

export interface SectionState<T> {
  completed: boolean
  data: T | null
}

export interface PortalState {
  applicationId: string | null
  relationsEnriched: boolean
  sections: {
    businessInfo: SectionState<BusinessInfoData>
    accountOwner: SectionState<AccountOwnerData>
    personalInfo: SectionState<PersonalInfoData>
    relations: SectionState<RelationPerson[]>
    documents: SectionState<DocumentsData>
  }
}

export type SectionKey = keyof PortalState['sections']
