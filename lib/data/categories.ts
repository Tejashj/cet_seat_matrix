// KCET Categories and their descriptions
export interface Category {
  code: string;
  fullName: string;
  description: string;
  generalOrReserved: 'General' | 'Reserved';
  reservationPercent: number;
}

export const CATEGORIES: Category[] = [
  { code: 'GM',  fullName: 'General Merit',                          description: 'Open to all (unreserved)', generalOrReserved: 'General', reservationPercent: 0 },
  { code: 'GMK', fullName: 'General Merit - Kannada Medium',         description: 'Studied in Kannada medium', generalOrReserved: 'General', reservationPercent: 0 },
  { code: 'GMR', fullName: 'General Merit - Rural',                  description: 'Studied in rural schools', generalOrReserved: 'General', reservationPercent: 0 },
  { code: '1G',  fullName: 'Scheduled Caste (SC) - General',        description: 'SC category – general', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: '1K',  fullName: 'Scheduled Caste (SC) - Kannada Medium', description: 'SC – Kannada medium', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: '1R',  fullName: 'Scheduled Caste (SC) - Rural',          description: 'SC – rural schools', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: '2AG', fullName: 'Scheduled Tribe (ST) - General',        description: 'ST category – general', generalOrReserved: 'Reserved', reservationPercent: 3 },
  { code: '2AK', fullName: 'Scheduled Tribe (ST) - Kannada Medium', description: 'ST – Kannada medium', generalOrReserved: 'Reserved', reservationPercent: 3 },
  { code: '2AR', fullName: 'Scheduled Tribe (ST) - Rural',          description: 'ST – rural schools', generalOrReserved: 'Reserved', reservationPercent: 3 },
  { code: '2BG', fullName: 'OBC Category 2B - General',             description: 'OBC 2B – general', generalOrReserved: 'Reserved', reservationPercent: 5 },
  { code: '2BK', fullName: 'OBC Category 2B - Kannada Medium',      description: 'OBC 2B – Kannada medium', generalOrReserved: 'Reserved', reservationPercent: 5 },
  { code: '2BR', fullName: 'OBC Category 2B - Rural',               description: 'OBC 2B – rural', generalOrReserved: 'Reserved', reservationPercent: 5 },
  { code: '3AG', fullName: 'OBC Category 3A - General',             description: 'OBC 3A – general', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: '3AK', fullName: 'OBC Category 3A - Kannada Medium',      description: 'OBC 3A – Kannada medium', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: '3AR', fullName: 'OBC Category 3A - Rural',               description: 'OBC 3A – rural', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: '3BG', fullName: 'OBC Category 3B - General',             description: 'OBC 3B – general', generalOrReserved: 'Reserved', reservationPercent: 2 },
  { code: '3BK', fullName: 'OBC Category 3B - Kannada Medium',      description: 'OBC 3B – Kannada medium', generalOrReserved: 'Reserved', reservationPercent: 2 },
  { code: '3BR', fullName: 'OBC Category 3B - Rural',               description: 'OBC 3B – rural', generalOrReserved: 'Reserved', reservationPercent: 2 },
  { code: 'SCG', fullName: 'Scheduled Caste (SC) - General',        description: 'SC category government seat', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: 'SCK', fullName: 'Scheduled Caste (SC) - Kannada Medium', description: 'SC Kannada medium – government', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: 'SCR', fullName: 'Scheduled Caste (SC) - Rural',          description: 'SC rural – government', generalOrReserved: 'Reserved', reservationPercent: 15 },
  { code: 'STG', fullName: 'Scheduled Tribe (ST) - General',        description: 'ST category government seat', generalOrReserved: 'Reserved', reservationPercent: 3 },
  { code: 'STK', fullName: 'Scheduled Tribe (ST) - Kannada Medium', description: 'ST Kannada medium – government', generalOrReserved: 'Reserved', reservationPercent: 3 },
];

// Category multipliers — how much lower the cutoff rank is compared to GM
// E.g., if GM cutoff is 5000, SC cutoff for same seat might be 15000-25000
export const CATEGORY_RANK_MULTIPLIERS: Record<string, number> = {
  'GM':  1.0,
  'GMK': 1.1,
  'GMR': 1.15,
  '1G':  3.5,
  '1K':  3.8,
  '1R':  4.0,
  '2AG': 4.5,
  '2AK': 4.8,
  '2AR': 5.0,
  '2BG': 1.8,
  '2BK': 2.0,
  '2BR': 2.1,
  '3AG': 1.6,
  '3AK': 1.75,
  '3AR': 1.85,
  '3BG': 1.5,
  '3BK': 1.65,
  '3BR': 1.7,
  'SCG': 3.2,
  'SCK': 3.4,
  'SCR': 3.6,
  'STG': 4.2,
  'STK': 4.5,
};

export const CATEGORY_CODES = CATEGORIES.map(c => c.code);

export function getCategoryByCode(code: string): Category | undefined {
  return CATEGORIES.find(c => c.code === code);
}
