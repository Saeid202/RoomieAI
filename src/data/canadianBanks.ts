// Canadian Banks with Institution Numbers
export interface CanadianBank {
  name: string;
  institutionNumber: string;
  shortName: string;
}

export const CANADIAN_BANKS: CanadianBank[] = [
  { name: 'Bank of Montreal (BMO)', institutionNumber: '001', shortName: 'BMO' },
  { name: 'Bank of Nova Scotia (Scotiabank)', institutionNumber: '002', shortName: 'Scotiabank' },
  { name: 'Royal Bank of Canada (RBC)', institutionNumber: '003', shortName: 'RBC' },
  { name: 'Toronto-Dominion Bank (TD)', institutionNumber: '004', shortName: 'TD' },
  { name: 'National Bank of Canada', institutionNumber: '006', shortName: 'National Bank' },
  { name: 'Canadian Imperial Bank of Commerce (CIBC)', institutionNumber: '010', shortName: 'CIBC' },
  { name: 'HSBC Bank Canada', institutionNumber: '016', shortName: 'HSBC' },
  { name: 'Canadian Western Bank', institutionNumber: '030', shortName: 'CWB' },
  { name: 'Laurentian Bank of Canada', institutionNumber: '039', shortName: 'Laurentian' },
  { name: 'ATB Financial', institutionNumber: '219', shortName: 'ATB' },
  { name: 'Tangerine Bank', institutionNumber: '614', shortName: 'Tangerine' },
  { name: 'Simplii Financial', institutionNumber: '010', shortName: 'Simplii' },
  { name: 'EQ Bank', institutionNumber: '623', shortName: 'EQ Bank' },
  { name: 'Manulife Bank', institutionNumber: '540', shortName: 'Manulife' },
  { name: 'Meridian Credit Union', institutionNumber: '837', shortName: 'Meridian' },
  { name: 'Desjardins', institutionNumber: '815', shortName: 'Desjardins' },
  { name: 'Alterna Savings', institutionNumber: '842', shortName: 'Alterna' },
  { name: 'Motusbank', institutionNumber: '608', shortName: 'Motusbank' },
  { name: 'PC Financial', institutionNumber: '010', shortName: 'PC Financial' },
  { name: 'Wealthsimple', institutionNumber: '621', shortName: 'Wealthsimple' },
];

// Helper function to search banks
export function searchBanks(query: string): CanadianBank[] {
  if (!query) return CANADIAN_BANKS;
  
  const lowerQuery = query.toLowerCase();
  return CANADIAN_BANKS.filter(bank => 
    bank.name.toLowerCase().includes(lowerQuery) ||
    bank.shortName.toLowerCase().includes(lowerQuery) ||
    bank.institutionNumber.includes(lowerQuery)
  );
}
