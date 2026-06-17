/**
 * IndexedDB persistence layer for uploaded KCET allotment data.
 * Uses the `idb` library for a clean Promise-based API.
 * Stores real uploaded data separately from synthetic baseline.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { RawAllotmentRecord } from './excelImport';
import type { Round } from './roundFactors';

interface KCETSchema extends DBSchema {
  allotments: {
    key: number; // auto-increment
    value: RawAllotmentRecord;
    indexes: {
      'by-year-round': [number, Round];
      'by-college-branch-category': [string, string, string];
      'by-category': string;
    };
  };
  imports: {
    key: string; // `${year}-${round}`
    value: {
      id: string;
      academicYear: number;
      round: Round;
      fileName: string;
      rowCount: number;
      importedAt: string;
    };
  };
}

let _db: IDBPDatabase<KCETSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<KCETSchema>> {
  if (_db) return _db;
  _db = await openDB<KCETSchema>('kcet-planner', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('allotments', { autoIncrement: true });
        store.createIndex('by-year-round', ['academicYear', 'round']);
        store.createIndex('by-college-branch-category', ['collegeCode', 'branchCode', 'category']);
        store.createIndex('by-category', 'category');
        db.createObjectStore('imports', { keyPath: 'id' });
      }
    },
  });
  return _db;
}

/**
 * Save a batch of parsed allotment records (for one year+round).
 * First deletes any existing records for that year+round to avoid duplicates.
 */
export async function saveAllotmentData(
  records: RawAllotmentRecord[],
  year: number,
  round: Round,
  fileName: string
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['allotments', 'imports'], 'readwrite');

  // Delete existing records for this year+round
  const existing = await tx.objectStore('allotments').index('by-year-round').getAllKeys([year, round]);
  for (const key of existing) {
    await tx.objectStore('allotments').delete(key);
  }

  // Insert new records
  for (const record of records) {
    await tx.objectStore('allotments').add(record);
  }

  // Record this import
  await tx.objectStore('imports').put({
    id: `${year}-${round}`,
    academicYear: year,
    round,
    fileName,
    rowCount: records.length,
    importedAt: new Date().toISOString(),
  });

  await tx.done;
}

/**
 * Load all uploaded allotment records
 */
export async function loadAllUploadedData(): Promise<RawAllotmentRecord[]> {
  const db = await getDB();
  return db.getAll('allotments');
}

/**
 * Load records for a specific year + round
 */
export async function loadByYearRound(year: number, round: Round): Promise<RawAllotmentRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('allotments', 'by-year-round', [year, round]);
}

/**
 * Load records for a specific college + branch + category
 */
export async function loadCutoffHistory(
  collegeCode: string,
  branchCode: string,
  category: string
): Promise<RawAllotmentRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('allotments', 'by-college-branch-category', [collegeCode, branchCode, category]);
}

/**
 * Get import history (what files have been uploaded)
 */
export async function getImportHistory() {
  const db = await getDB();
  return db.getAll('imports');
}

/**
 * Delete all data for a specific year+round
 */
export async function deleteImport(year: number, round: Round): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['allotments', 'imports'], 'readwrite');
  const keys = await tx.objectStore('allotments').index('by-year-round').getAllKeys([year, round]);
  for (const key of keys) await tx.objectStore('allotments').delete(key);
  await tx.objectStore('imports').delete(`${year}-${round}`);
  await tx.done;
}

/**
 * Get data summary for display
 */
export async function getDataSummary(): Promise<{
  totalRecords: number;
  years: number[];
  rounds: Round[];
  imports: Awaited<ReturnType<typeof getImportHistory>>;
}> {
  const db = await getDB();
  const allRecords = await db.getAll('allotments');
  const imports = await db.getAll('imports');

  const years = [...new Set(allRecords.map(r => r.academicYear))].sort();
  const rounds = [...new Set(allRecords.map(r => r.round))] as Round[];

  return {
    totalRecords: allRecords.length,
    years,
    rounds,
    imports,
  };
}
