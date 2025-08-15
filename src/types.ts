// Gemeinsame Typen für Datenstrukturen

export type Applicant = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  street: string;
  postalCode: string;
  city: string;
  insuranceName: string;
  insuranceIdNumber?: string;
  careLevel?: number;
  impairments?: string;
  representative?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    phone?: string;
    email?: string;
  } | null;
};

export type CreateApplicationRequest = {
  applicant: Applicant;
  measures?: string[];
  notes?: string;
};
