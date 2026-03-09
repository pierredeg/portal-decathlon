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
}

export interface DocumentFile {
  file: File | null
  fileName: string | null
  fileId?: string
}

export interface PersonDocuments {
  personId: string
  personName: string
  front: DocumentFile
  back: DocumentFile
}

export interface DocumentsData {
  kbis: DocumentFile
  personDocuments: PersonDocuments[]
}

export interface SectionState<T> {
  completed: boolean
  data: T | null
}

export interface PortalState {
  applicationId: string | null
  sections: {
    businessInfo: SectionState<BusinessInfoData>
    accountOwner: SectionState<AccountOwnerData>
    personalInfo: SectionState<PersonalInfoData>
    relations: SectionState<RelationPerson[]>
    documents: SectionState<DocumentsData>
  }
}

export type SectionKey = keyof PortalState['sections']
