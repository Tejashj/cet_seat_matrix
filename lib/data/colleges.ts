// Master data for Karnataka Engineering Colleges
export interface College {
  code: string;
  name: string;
  city: string;
  district: string;
  type: 'Government' | 'Aided' | 'Unaided' | 'Autonomous';
  naac: 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C' | 'N/A';
  ranking: number; // 1 = top, higher = lower tier
  annualFee: number; // in INR
  established: number;
  affiliatedTo: string;
}

export const COLLEGES: College[] = [
  // TIER 1 - Premier Government Colleges
  { code: 'E001', name: 'University Visvesvaraya College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Government', naac: 'A++', ranking: 1, annualFee: 45000, established: 1917, affiliatedTo: 'Bangalore University' },
  { code: 'E002', name: 'BMS College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Aided', naac: 'A++', ranking: 2, annualFee: 120000, established: 1946, affiliatedTo: 'VTU' },
  { code: 'E003', name: 'RV College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Aided', naac: 'A++', ranking: 3, annualFee: 115000, established: 1963, affiliatedTo: 'VTU' },
  { code: 'E004', name: 'MS Ramaiah Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Aided', naac: 'A+', ranking: 4, annualFee: 130000, established: 1962, affiliatedTo: 'VTU' },
  { code: 'E005', name: 'PES University', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Autonomous', naac: 'A+', ranking: 5, annualFee: 200000, established: 1988, affiliatedTo: 'PES University' },
  { code: 'E006', name: 'National Institute of Engineering', city: 'Mysuru', district: 'Mysuru', type: 'Aided', naac: 'A+', ranking: 6, annualFee: 95000, established: 1946, affiliatedTo: 'VTU' },
  { code: 'E007', name: 'Siddaganga Institute of Technology', city: 'Tumkur', district: 'Tumkur', type: 'Aided', naac: 'A+', ranking: 7, annualFee: 85000, established: 1963, affiliatedTo: 'VTU' },
  { code: 'E008', name: 'BMS Institute of Technology and Management', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A', ranking: 8, annualFee: 140000, established: 2002, affiliatedTo: 'VTU' },
  { code: 'E009', name: 'Dayananda Sagar College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Aided', naac: 'A+', ranking: 9, annualFee: 105000, established: 1979, affiliatedTo: 'VTU' },
  { code: 'E010', name: 'Sir M Visvesvaraya Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A', ranking: 10, annualFee: 125000, established: 1986, affiliatedTo: 'VTU' },

  // TIER 2 - Good Private Colleges
  { code: 'E011', name: 'JSS Academy of Technical Education', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A', ranking: 11, annualFee: 130000, established: 1998, affiliatedTo: 'VTU' },
  { code: 'E012', name: 'Nitte Meenakshi Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A', ranking: 12, annualFee: 120000, established: 2001, affiliatedTo: 'VTU' },
  { code: 'E013', name: 'New Horizon College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A+', ranking: 13, annualFee: 135000, established: 1998, affiliatedTo: 'VTU' },
  { code: 'E014', name: 'Sahyadri College of Engineering and Management', city: 'Mangaluru', district: 'Dakshina Kannada', type: 'Unaided', naac: 'A+', ranking: 14, annualFee: 100000, established: 2007, affiliatedTo: 'VTU' },
  { code: 'E015', name: 'Manipal Institute of Technology', city: 'Manipal', district: 'Udupi', type: 'Autonomous', naac: 'A++', ranking: 15, annualFee: 210000, established: 1957, affiliatedTo: 'MAHE' },
  { code: 'E016', name: 'KLE Technological University', city: 'Hubballi', district: 'Dharwad', type: 'Autonomous', naac: 'A+', ranking: 16, annualFee: 115000, established: 1947, affiliatedTo: 'KLE Tech' },
  { code: 'E017', name: 'Ramaiah University of Applied Sciences', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Autonomous', naac: 'A', ranking: 17, annualFee: 180000, established: 2013, affiliatedTo: 'RUAS' },
  { code: 'E018', name: 'CMR Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A+', ranking: 18, annualFee: 125000, established: 2000, affiliatedTo: 'VTU' },
  { code: 'E019', name: 'Vidyavardhaka College of Engineering', city: 'Mysuru', district: 'Mysuru', type: 'Unaided', naac: 'A', ranking: 19, annualFee: 90000, established: 1979, affiliatedTo: 'VTU' },
  { code: 'E020', name: 'SDM College of Engineering and Technology', city: 'Dharwad', district: 'Dharwad', type: 'Aided', naac: 'A+', ranking: 20, annualFee: 80000, established: 1979, affiliatedTo: 'VTU' },

  // TIER 2B - Mid-range Colleges
  { code: 'E021', name: 'Global Academy of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A', ranking: 21, annualFee: 110000, established: 2001, affiliatedTo: 'VTU' },
  { code: 'E022', name: 'East West Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B++', ranking: 22, annualFee: 100000, established: 2001, affiliatedTo: 'VTU' },
  { code: 'E023', name: 'Acharya Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A', ranking: 23, annualFee: 115000, established: 2000, affiliatedTo: 'VTU' },
  { code: 'E024', name: 'KS School of Engineering and Management', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B+', ranking: 24, annualFee: 95000, established: 2009, affiliatedTo: 'VTU' },
  { code: 'E025', name: 'Bangalore Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Government', naac: 'A', ranking: 25, annualFee: 42000, established: 1979, affiliatedTo: 'VTU' },
  { code: 'E026', name: 'Government Engineering College Hassan', city: 'Hassan', district: 'Hassan', type: 'Government', naac: 'B++', ranking: 26, annualFee: 35000, established: 1984, affiliatedTo: 'VTU' },
  { code: 'E027', name: 'Government Engineering College Raichur', city: 'Raichur', district: 'Raichur', type: 'Government', naac: 'B+', ranking: 27, annualFee: 33000, established: 1980, affiliatedTo: 'VTU' },
  { code: 'E028', name: 'Bapuji Institute of Engineering and Technology', city: 'Davangere', district: 'Davangere', type: 'Aided', naac: 'A', ranking: 28, annualFee: 75000, established: 1979, affiliatedTo: 'VTU' },
  { code: 'E029', name: 'Sri Siddhartha Institute of Technology', city: 'Tumkur', district: 'Tumkur', type: 'Aided', naac: 'A', ranking: 29, annualFee: 70000, established: 1996, affiliatedTo: 'VTU' },
  { code: 'E030', name: 'Proudhadevaraya Institute of Technology', city: 'Hospet', district: 'Ballari', type: 'Unaided', naac: 'B+', ranking: 30, annualFee: 80000, established: 2004, affiliatedTo: 'VTU' },

  // TIER 3 - Other Colleges
  { code: 'E031', name: 'Rajiv Gandhi Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Government', naac: 'B++', ranking: 31, annualFee: 38000, established: 1988, affiliatedTo: 'VTU' },
  { code: 'E032', name: 'Don Bosco Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B++', ranking: 32, annualFee: 105000, established: 1998, affiliatedTo: 'VTU' },
  { code: 'E033', name: 'Reva University', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Autonomous', naac: 'A', ranking: 33, annualFee: 150000, established: 2013, affiliatedTo: 'Reva University' },
  { code: 'E034', name: 'Canara Engineering College', city: 'Mangaluru', district: 'Dakshina Kannada', type: 'Aided', naac: 'B++', ranking: 34, annualFee: 78000, established: 1981, affiliatedTo: 'VTU' },
  { code: 'E035', name: 'Vivekananda College of Engineering and Technology', city: 'Puttur', district: 'Dakshina Kannada', type: 'Unaided', naac: 'B+', ranking: 35, annualFee: 72000, established: 2002, affiliatedTo: 'VTU' },
  { code: 'E036', name: 'Government Engineering College Kushalnagar', city: 'Kushalnagar', district: 'Kodagu', type: 'Government', naac: 'B+', ranking: 36, annualFee: 30000, established: 2010, affiliatedTo: 'VTU' },
  { code: 'E037', name: 'T John Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B', ranking: 37, annualFee: 90000, established: 1999, affiliatedTo: 'VTU' },
  { code: 'E038', name: 'AMC Engineering College', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B+', ranking: 38, annualFee: 95000, established: 2000, affiliatedTo: 'VTU' },
  { code: 'E039', name: 'Kammavari Sangha Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B+', ranking: 39, annualFee: 88000, established: 1999, affiliatedTo: 'VTU' },
  { code: 'E040', name: 'PESIT South Campus', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'A', ranking: 40, annualFee: 160000, established: 1999, affiliatedTo: 'VTU' },
  { code: 'E041', name: 'Government Engineering College Gangavathi', city: 'Gangavathi', district: 'Koppal', type: 'Government', naac: 'B', ranking: 41, annualFee: 30000, established: 2012, affiliatedTo: 'VTU' },
  { code: 'E042', name: 'Jawaharlal Nehru National College of Engineering', city: 'Shivamogga', district: 'Shivamogga', type: 'Aided', naac: 'A', ranking: 42, annualFee: 72000, established: 1979, affiliatedTo: 'VTU' },
  { code: 'E043', name: 'P.A. College of Engineering', city: 'Mangaluru', district: 'Dakshina Kannada', type: 'Unaided', naac: 'A', ranking: 43, annualFee: 98000, established: 2000, affiliatedTo: 'VTU' },
  { code: 'E044', name: 'Sri Venkateshwara College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B++', ranking: 44, annualFee: 102000, established: 1999, affiliatedTo: 'VTU' },
  { code: 'E045', name: 'Government Engineering College Bidar', city: 'Bidar', district: 'Bidar', type: 'Government', naac: 'B+', ranking: 45, annualFee: 32000, established: 1980, affiliatedTo: 'VTU' },
  { code: 'E046', name: 'HKBK College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B+', ranking: 46, annualFee: 90000, established: 2001, affiliatedTo: 'VTU' },
  { code: 'E047', name: 'Shri Madhwa Vadiraja Institute of Technology and Management', city: 'Bantwal', district: 'Dakshina Kannada', type: 'Unaided', naac: 'B+', ranking: 47, annualFee: 75000, established: 2009, affiliatedTo: 'VTU' },
  { code: 'E048', name: 'Brindavan College of Engineering', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B', ranking: 48, annualFee: 85000, established: 1997, affiliatedTo: 'VTU' },
  { code: 'E049', name: 'Kalpataru Institute of Technology', city: 'Tiptur', district: 'Tumkur', type: 'Unaided', naac: 'B++', ranking: 49, annualFee: 70000, established: 1993, affiliatedTo: 'VTU' },
  { code: 'E050', name: 'Sri Krishna Institute of Technology', city: 'Bengaluru', district: 'Bengaluru Urban', type: 'Unaided', naac: 'B+', ranking: 50, annualFee: 95000, established: 1999, affiliatedTo: 'VTU' },
];

export const CITIES = [...new Set(COLLEGES.map(c => c.city))].sort();
export const DISTRICTS = [...new Set(COLLEGES.map(c => c.district))].sort();
export const COLLEGE_TYPES = ['Government', 'Aided', 'Unaided', 'Autonomous'] as const;

export function getCollegeByCode(code: string): College | undefined {
  return COLLEGES.find(c => c.code === code);
}
