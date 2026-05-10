export interface Specialty {
  value: string
  label: string
  description: string
  typicalDurationMinutes: number
}

export const SPECIALTIES: Specialty[] = [
  {
    value: "family-medicine",
    label: "Family Medicine",
    description: "Comprehensive primary care for patients of all ages",
    typicalDurationMinutes: 20,
  },
  {
    value: "internal-medicine",
    label: "Internal Medicine",
    description: "Diagnosis and treatment of complex adult diseases",
    typicalDurationMinutes: 30,
  },
  {
    value: "cardiology",
    label: "Cardiology",
    description: "Heart and cardiovascular system disorders",
    typicalDurationMinutes: 45,
  },
  {
    value: "psychiatry",
    label: "Psychiatry",
    description: "Mental health, mood disorders, and behavioural conditions",
    typicalDurationMinutes: 60,
  },
  {
    value: "pediatrics",
    label: "Pediatrics",
    description: "Medical care for infants, children, and adolescents",
    typicalDurationMinutes: 20,
  },
  {
    value: "emergency-medicine",
    label: "Emergency Medicine",
    description: "Acute and urgent medical conditions",
    typicalDurationMinutes: 30,
  },
  {
    value: "dermatology",
    label: "Dermatology",
    description: "Skin, hair, and nail conditions",
    typicalDurationMinutes: 20,
  },
  {
    value: "orthopedics",
    label: "Orthopedics",
    description: "Musculoskeletal system, bones, joints, and sports injuries",
    typicalDurationMinutes: 30,
  },
  {
    value: "neurology",
    label: "Neurology",
    description: "Disorders of the nervous system and brain",
    typicalDurationMinutes: 45,
  },
  {
    value: "obstetrics-gynecology",
    label: "Obstetrics & Gynecology",
    description: "Women's reproductive health and pregnancy care",
    typicalDurationMinutes: 30,
  },
]
