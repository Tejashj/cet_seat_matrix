// Branch/Course master data for Karnataka Engineering
export interface Branch {
  code: string;
  name: string;
  shortName: string;
  category: 'CS' | 'Electronics' | 'Mechanical' | 'Civil' | 'Chemical' | 'Emerging';
  demandIndex: number; // 1-10 scale (10 = most in demand)
  avgPlacementRate: number; // percentage
  avgPackage: number; // in LPA
}

export const BRANCHES: Branch[] = [
  { code: 'C001', name: 'Computer Science and Engineering', shortName: 'CSE', category: 'CS', demandIndex: 10, avgPlacementRate: 95, avgPackage: 8.5 },
  { code: 'C002', name: 'Information Science and Engineering', shortName: 'ISE', category: 'CS', demandIndex: 9, avgPlacementRate: 92, avgPackage: 7.8 },
  { code: 'C003', name: 'Electronics and Communication Engineering', shortName: 'ECE', category: 'Electronics', demandIndex: 8, avgPlacementRate: 88, avgPackage: 6.5 },
  { code: 'C004', name: 'Electrical and Electronics Engineering', shortName: 'EEE', category: 'Electronics', demandIndex: 7, avgPlacementRate: 85, avgPackage: 5.8 },
  { code: 'C005', name: 'Mechanical Engineering', shortName: 'ME', category: 'Mechanical', demandIndex: 6, avgPlacementRate: 80, avgPackage: 5.2 },
  { code: 'C006', name: 'Civil Engineering', shortName: 'Civil', category: 'Civil', demandIndex: 5, avgPlacementRate: 75, avgPackage: 4.8 },
  { code: 'C007', name: 'Chemical Engineering', shortName: 'Chem', category: 'Chemical', demandIndex: 4, avgPlacementRate: 70, avgPackage: 5.0 },
  { code: 'C008', name: 'Artificial Intelligence and Machine Learning', shortName: 'AIML', category: 'CS', demandIndex: 10, avgPlacementRate: 96, avgPackage: 9.5 },
  { code: 'C009', name: 'Data Science and Engineering', shortName: 'DS', category: 'CS', demandIndex: 10, avgPlacementRate: 94, avgPackage: 9.0 },
  { code: 'C010', name: 'Computer Science and Engineering (Cyber Security)', shortName: 'CS-CY', category: 'CS', demandIndex: 9, avgPlacementRate: 91, avgPackage: 8.2 },
  { code: 'C011', name: 'Computer Science and Engineering (IoT)', shortName: 'CS-IoT', category: 'CS', demandIndex: 8, avgPlacementRate: 89, avgPackage: 7.5 },
  { code: 'C012', name: 'Electronics and Telecommunication Engineering', shortName: 'ETE', category: 'Electronics', demandIndex: 6, avgPlacementRate: 82, avgPackage: 6.0 },
  { code: 'C013', name: 'Robotics and Automation Engineering', shortName: 'Robotics', category: 'Emerging', demandIndex: 7, avgPlacementRate: 83, avgPackage: 7.0 },
  { code: 'C014', name: 'Aerospace Engineering', shortName: 'Aero', category: 'Mechanical', demandIndex: 6, avgPlacementRate: 78, avgPackage: 6.5 },
  { code: 'C015', name: 'Biotechnology Engineering', shortName: 'Biotech', category: 'Chemical', demandIndex: 4, avgPlacementRate: 65, avgPackage: 4.5 },
];

export const BRANCH_CATEGORIES = ['CS', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Emerging'] as const;

export function getBranchByCode(code: string): Branch | undefined {
  return BRANCHES.find(b => b.code === code);
}
