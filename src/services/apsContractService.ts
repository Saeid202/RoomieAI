// apsContractService.ts // HomieAI Agreement of Purchase and Sale // Original contract drafted by HomieAI Inc.

export interface APSContractData {
  // Date
  agreementDate: string

  // Buyer
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: string
  buyerUserId: string
  buyerCity: string

  // Seller
  sellerName: string
  sellerEmail: string
  sellerPhone: string
  sellerUserId: string

  // Property
  propertyAddress: string
  propertyCity: string
  propertyPostalCode: string
  propertyType: string
  propertyPin: string
  legalDescription: string
  unitNumber?: string
  condoCorpNumber?: string

  // Financial
  purchasePrice: number
  depositAmount: number
  balanceAmount: number
  annualPropertyTax?: number
  platformFee?: number
  mortgageAmount?: number

  // Conditions
  hasFinancingCondition: boolean
  financingDeadline?: string
  hasInspectionCondition: boolean
  inspectionDeadline?: string
  hasStatusCertCondition: boolean
  statusCertDeadline?: string

  // Dates
  closingDate: string
  possessionDate: string
  requisitionDate: string
  irrevocabilityDate: string
  irrevocabilityTime: string
  documentDate: string

  // Chattels
  includesRefrigerator: boolean
  includesStove: boolean
  includesDishwasher: boolean
  includesWasher: boolean
  includesDryer: boolean
  includesMicrowave: boolean
  includesAllBlinds: boolean
  includesAllCurtains: boolean
  additionalChattels: string
  excludedFixtures: string

  // Rental items
  hasRentalItems: boolean
  rentalItemsList: string
  rentalMonthlyCost: number

  // Lawyer
  lawyerName: string
  lawyerLicense: string

  // Platform
  transactionId: string

  // Signatures (filled after signing)
  buyerSignature?: string
  buyerSignDatetime?: string
  buyerIp?: string
  buyerBiometricVerified?: boolean
  sellerSignature?: string
  sellerSignDatetime?: string
  sellerIp?: string
  sellerBiometricVerified?: boolean
  lawyerSignature?: string
  lawyerSignDatetime?: string
  documentHash?: string
}

export function generateDocumentHash(data: APSContractData): string {
  // Simple hash for document integrity
  const content = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2
  }).format(amount)
}

export function formatDate(dateString: string): string {
  if (!dateString) return '________________'
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function buildContractData(
  property: any,
  buyer: any,
  seller: any,
  lawyer: any,
  propertyId: string
): APSContractData {
  const purchasePrice = property?.price || 0
  const today = new Date()
  const closingDate = new Date(today)
  closingDate.setDate(today.getDate() + 60)
  const requisitionDate = new Date(today)
  requisitionDate.setDate(today.getDate() + 30)
  const irrevocabilityDate = new Date(today)
  irrevocabilityDate.setDate(today.getDate() + 2)
  const financingDeadline = new Date(today)
  financingDeadline.setDate(today.getDate() + 14)
  const inspectionDeadline = new Date(today)
  inspectionDeadline.setDate(today.getDate() + 10)

  return {
    agreementDate: today.toLocaleDateString('en-CA'),
    buyerName: buyer?.full_name || '',
    buyerEmail: buyer?.email || '',
    buyerPhone: buyer?.phone_number || '',
    buyerAddress: buyer?.address || '',
    buyerUserId: buyer?.id || '',
    buyerCity: buyer?.city || '',
    sellerName: seller?.full_name || '',
    sellerEmail: seller?.email || '',
    sellerPhone: seller?.phone_number || '',
    sellerUserId: seller?.id || '',
    propertyAddress: property?.address || '',
    propertyCity: property?.city || '',
    propertyPostalCode: property?.postal_code || '',
    propertyType: property?.property_type || '',
    propertyPin: property?.pin_number || '',
    legalDescription: property?.legal_description || '',
    unitNumber: property?.unit_number || '',
    condoCorpNumber: property?.condo_corp_number || '',
    purchasePrice,
    depositAmount: purchasePrice * 0.05,
    balanceAmount: purchasePrice * 0.95,
    annualPropertyTax: property?.annual_tax || 0,
    platformFee: purchasePrice * 0.01,
    mortgageAmount: purchasePrice * 0.80,
    hasFinancingCondition: true,
    financingDeadline: financingDeadline.toISOString().split('T')[0],
    hasInspectionCondition: true,
    inspectionDeadline: inspectionDeadline.toISOString().split('T')[0],
    hasStatusCertCondition: property?.property_type?.toLowerCase().includes('condo') || false,
    statusCertDeadline: financingDeadline.toISOString().split('T')[0],
    closingDate: closingDate.toISOString().split('T')[0],
    possessionDate: closingDate.toISOString().split('T')[0],
    requisitionDate: requisitionDate.toISOString().split('T')[0],
    irrevocabilityDate: irrevocabilityDate.toISOString().split('T')[0],
    irrevocabilityTime: '11:59 PM',
    documentDate: requisitionDate.toISOString().split('T')[0],
    includesRefrigerator: true,
    includesStove: true,
    includesDishwasher: true,
    includesWasher: true,
    includesDryer: true,
    includesMicrowave: true,
    includesAllBlinds: true,
    includesAllCurtains: true,
    additionalChattels: '',
    excludedFixtures: '',
    hasRentalItems: false,
    rentalItemsList: '',
    rentalMonthlyCost: 0,
    lawyerName: lawyer?.full_name || '',
    lawyerLicense: lawyer?.license_number || '',
    transactionId: propertyId,
  }
}