import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.fost-data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

export interface UserStats {
  userId: string;
  sdksGenerated: number;
  web3SdksGenerated: number;
  apiSpecsProcessed: number;
  totalLanguages: number;
  creditsUsed: number;
  lastGeneratedAt?: string;
  createdAt: string;
}

// In-memory cache for performance
let statsCache: Map<string, UserStats> = new Map();
let cacheLoaded = false;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

async function loadStatsFromFile(): Promise<UserStats[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(STATS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid JSON - return empty array
    return [];
  }
}

async function saveStatsToFile(allStats: UserStats[]) {
  try {
    await ensureDataDir();
    await fs.writeFile(STATS_FILE, JSON.stringify(allStats, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

async function initializeCache() {
  if (cacheLoaded) return;
  
  const stats = await loadStatsFromFile();
  statsCache.clear();
  
  for (const stat of stats) {
    statsCache.set(stat.userId, stat);
  }
  
  cacheLoaded = true;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  await initializeCache();
  
  let stats = statsCache.get(userId);
  if (!stats) {
    stats = {
      userId,
      sdksGenerated: 0,
      web3SdksGenerated: 0,
      apiSpecsProcessed: 0,
      totalLanguages: 0,
      creditsUsed: 0,
      createdAt: new Date().toISOString(),
    };
    statsCache.set(userId, stats);
  }
  
  return stats;
}

export async function updateUserStats(
  userId: string,
  updates: Partial<UserStats>
): Promise<UserStats> {
  await initializeCache();
  
  let stats = await getUserStats(userId);
  stats = {
    ...stats,
    ...updates,
    userId, // Ensure userId is never overwritten
    createdAt: stats.createdAt, // Preserve original creation time
  };
  
  statsCache.set(userId, stats);
  
  // Persist to file
  const allStats = Array.from(statsCache.values());
  await saveStatsToFile(allStats);
  
  return stats;
}

export async function incrementSdkGenerated(userId: string, isWeb3 = false): Promise<UserStats> {
  const stats = await getUserStats(userId);
  
  return updateUserStats(userId, {
    sdksGenerated: stats.sdksGenerated + 1,
    web3SdksGenerated: isWeb3 ? stats.web3SdksGenerated + 1 : stats.web3SdksGenerated,
    creditsUsed: stats.creditsUsed + 1,
    lastGeneratedAt: new Date().toISOString(),
  });
}

export async function incrementSpecProcessed(userId: string): Promise<UserStats> {
  const stats = await getUserStats(userId);
  
  return updateUserStats(userId, {
    apiSpecsProcessed: stats.apiSpecsProcessed + 1,
  });
}

export async function updateLanguagesUsed(userId: string, languages: string[]): Promise<UserStats> {
  const stats = await getUserStats(userId);
  
  return updateUserStats(userId, {
    totalLanguages: Math.max(stats.totalLanguages, languages.length),
  });
}

export async function getAllStats(): Promise<UserStats[]> {
  await initializeCache();
  return Array.from(statsCache.values());
}

export async function clearCache() {
  statsCache.clear();
  cacheLoaded = false;
}
