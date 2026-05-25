const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { scrapeTrending } = require('./scraper');
const { loadCache, getCache, setCache, isExpired, getAge } = require('./cache');
const { fallbackProjects } = require('./fallback');

const app = express();
const PORT = process.env.PORT || 3001;

const INVALID_LANGUAGES = new Set(['Unknown', 'Other', 'N/A', '']);
const ALL_PERIODS = ['daily', 'weekly', 'monthly'];

app.use(cors());
app.use(express.json());
loadCache();

// ── Stats Helper ────────────────────────────────────────────
function computeStats(projects, period = 'weekly') {
  const validProjects = projects.filter((p) => !INVALID_LANGUAGES.has(p.language));
  const totalStarsThisWeek = projects.reduce((sum, p) => sum + p.starsThisPeriod, 0);
  const avgStarsPerProject = Math.round(totalStarsThisWeek / projects.length);
  const langMap = {};
  validProjects.forEach((p) => { langMap[p.language] = (langMap[p.language] || 0) + 1; });
  const topEntry = Object.entries(langMap).sort((a, b) => b[1] - a[1])[0];

  return {
    totalProjects: projects.length,
    totalStarsThisWeek,
    avgStarsPerProject,
    topLanguage: topEntry ? topEntry[0] : 'N/A',
    topLanguageCount: topEntry ? topEntry[1] : 0,
    languageDistribution: langMap,
    lastUpdated: getCache(period).timestamp || Date.now(),
  };
}

// ── Concurrency Lock ───────────────────────────────────────
let isScraping = false;

async function scrapeWithLock(source = 'manual', period = 'weekly') {
  if (isScraping) {
    console.log('⏳ Scrape already in progress — skipping');
    return null;
  }
  isScraping = true;
  try {
    const data = await scrapeTrending(period);
    setCache(data, source, period);
    console.log(`✅ Scrape complete [${period}] — ${data.length} projects`);
    return data;
  } finally {
    isScraping = false;
  }
}

// ── Response builder ───────────────────────────────────────
function buildTrendingResponse(data, meta) {
  const period = meta.period || 'weekly';
  return {
    success: true,
    data,
    stats: computeStats(data, period),
    ...meta,
  };
}

// ── API Routes ──────────────────────────────────────────────

app.get('/api/trending', async (req, res) => {
  try {
    const { force, period } = req.query;
    const p = period || 'weekly';

    if (force === 'true' || isExpired(p)) {
      console.log(`🔄 [${p}] Cache expired or forced — scraping...`);
      try {
        await scrapeWithLock('scraper', p);
      } catch (err) {
        console.error(`❌ [${p}] Scraping failed:`, err.message);
        const cached = getCache(p);
        if (cached.data) {
          return res.json(buildTrendingResponse(cached.data, {
            period: p, cached: true, stale: true,
            timestamp: cached.timestamp, source: cached.source,
            age: getAge(p), error: 'Using stale cache — scraping failed',
          }));
        }
        return res.json(buildTrendingResponse(fallbackProjects, {
          period: p, cached: false, fallback: true,
          timestamp: Date.now(), source: 'fallback', age: 0,
          error: 'GitHub unreachable — sample data',
        }));
      }
    }

    const { data, timestamp, source } = getCache(p);
    if (!data || data.length === 0) {
      return res.json(buildTrendingResponse(fallbackProjects, {
        period: p, cached: false, fallback: true,
        timestamp: Date.now(), source: 'fallback', age: 0,
        error: 'No cached data — sample data',
      }));
    }

    res.json(buildTrendingResponse(data, {
      period: p, cached: true, timestamp, source, age: getAge(p),
    }));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/trending/stats', (req, res) => {
  const p = req.query.period || 'weekly';
  const { data } = getCache(p);
  const projects = (data && data.length > 0) ? data : fallbackProjects;
  res.json({ success: true, stats: computeStats(projects, p) });
});

app.get('/api/trending/languages', (req, res) => {
  const p = req.query.period || 'weekly';
  const { data } = getCache(p);
  const projects = (data && data.length > 0) ? data : fallbackProjects;
  const langMap = {};
  projects.forEach((proj) => {
    if (!INVALID_LANGUAGES.has(proj.language)) {
      langMap[proj.language] = (langMap[proj.language] || 0) + 1;
    }
  });
  const languages = Object.entries(langMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  res.json({ success: true, languages });
});

app.get('/api/health', (req, res) => {
  const p = req.query.period || 'weekly';
  const { data, timestamp } = getCache(p);
  res.json({
    status: 'ok',
    period: p,
    projectsCount: data ? data.length : 0,
    lastUpdated: timestamp || null,
    cacheAge: getAge(p),
  });
});

// ── Scheduled Scraping ─────────────────────────────────────
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Hourly scrape triggered');
  for (const p of ALL_PERIODS) {
    try {
      await scrapeWithLock('cron', p);
    } catch (err) {
      console.error(`❌ [${p}] Scheduled scrape failed:`, err.message);
    }
  }
});

// ── Initial Scrape ─────────────────────────────────────────
(async () => {
  for (const p of ALL_PERIODS) {
    if (isExpired(p)) {
      console.log(`🚀 [${p}] Initial scrape...`);
      try {
        await scrapeWithLock('startup', p);
      } catch (err) {
        console.error(`❌ [${p}] Initial scrape failed:`, err.message);
      }
    }
  }
})();

app.listen(PORT, () => {
  console.log(`\n🚀 GitHub Trending API :${PORT}`);
  console.log(`   GET /api/trending?period=daily|weekly|monthly`);
  console.log(`   GET /api/trending/stats`);
  console.log(`   GET /api/trending/languages`);
  console.log(`   GET /api/health\n`);
});
