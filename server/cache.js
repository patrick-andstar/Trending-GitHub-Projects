const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'cache_data.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const PERIODS = ['daily', 'weekly', 'monthly'];

// Period-aware cache structure
let cache = {
  entries: {
    daily: { data: null, timestamp: 0, source: 'initial' },
    weekly: { data: null, timestamp: 0, source: 'initial' },
    monthly: { data: null, timestamp: 0, source: 'initial' },
  },
};

// Load cache from disk on startup
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);

      // Handle migration from old format
      if (parsed.data !== undefined && !parsed.entries) {
        console.log('📦 Migrating old cache format → period-aware');
        cache.entries.weekly = {
          data: parsed.data,
          timestamp: parsed.timestamp || 0,
          source: parsed.source || 'migrated',
        };
      } else if (parsed.entries) {
        // Merge loaded entries with defaults
        for (const p of PERIODS) {
          if (parsed.entries[p]) {
            cache.entries[p] = { ...cache.entries[p], ...parsed.entries[p] };
          }
        }
      }

      const counts = PERIODS.map((p) => `${p}=${cache.entries[p].data?.length ?? 0}`).join(' ');
      console.log(`📦 Cache loaded: [${counts}]`);
    }
  } catch (err) {
    console.warn('⚠️ Failed to load cache from disk:', err.message);
  }
}

// Async write to disk (non-blocking)
async function saveCache() {
  try {
    await fsp.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn('⚠️ Failed to persist cache:', err.message);
  }
}

function getCache(period = 'weekly') {
  const entry = cache.entries[period];
  if (!entry || !entry.data) {
    // Fall back to any period with data
    for (const p of PERIODS) {
      if (cache.entries[p]?.data) {
        return cache.entries[p];
      }
    }
    // Return default weekly entry
    return cache.entries.weekly;
  }
  return entry;
}

function setCache(data, source = 'scraper', period = 'weekly') {
  if (cache.entries[period]) {
    cache.entries[period] = {
      data,
      timestamp: Date.now(),
      source,
    };
  }
  saveCache().catch((err) => console.warn('⚠️ Cache persist error:', err.message));
}

function isExpired(period = 'weekly') {
  const entry = cache.entries[period];
  return !entry || !entry.data || (Date.now() - entry.timestamp > CACHE_TTL);
}

function getAge(period = 'weekly') {
  const entry = cache.entries[period];
  return Date.now() - (entry?.timestamp ?? 0);
}

module.exports = { loadCache, getCache, setCache, isExpired, getAge };
