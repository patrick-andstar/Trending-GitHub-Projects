/**
 * 数据查询脚本 — 读取爬虫缓存，展示数据存储状态与内容
 * 用法: node query-data.js
 */

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'cache_data.json');
const DISPLAY_LIMIT = 8; // 每周期展示前 N 条记录

// ── Database (JSON file) connection ────────────────────────

function connectToDB() {
  if (!fs.existsSync(CACHE_FILE)) {
    console.error('❌ 数据文件不存在:', CACHE_FILE);
    console.log('   💡 请先运行 node index.js 启动爬虫服务');
    process.exit(1);
  }
  const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
  return JSON.parse(raw);
}

// ── Format helpers ─────────────────────────────────────────

function formatTime(ts) {
  if (!ts) return '从未更新';
  return new Date(ts).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

function pad(str, len) {
  return String(str).padEnd(len, ' ');
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// ── Main Query ─────────────────────────────────────────────

const db = connectToDB();

// Detect format (legacy vs period-aware)
const isPeriodAware = !!db.entries;
let entries = {};

if (isPeriodAware) {
  entries = db.entries;
  console.log('📂 缓存格式: Period-aware (v2)\n');
} else {
  // Legacy format — wrap into weekly for compatibility
  entries = {
    weekly: { data: db.data || [], timestamp: db.timestamp || 0, source: db.source || 'legacy' },
  };
  console.log('📂 缓存格式: Legacy (v1) — 展示为 weekly\n');
}

const periods = Object.keys(entries);
let grandTotal = 0;

for (const period of periods) {
  const entry = entries[period];
  const data = entry.data || [];

  if (data.length === 0) continue;

  grandTotal += data.length;

  console.log('═'.repeat(72));
  console.log(`  📅 ${period.toUpperCase()}  ·  ${data.length} 条记录`);
  console.log(`  🕐 更新时间: ${formatTime(entry.timestamp)}`);
  console.log(`  📤 数据来源: ${entry.source || '未知'}`);
  console.log('─'.repeat(72));

  // Show top N records
  const limit = Math.min(data.length, DISPLAY_LIMIT);
  console.log(`  展示前 ${limit} 条:\n`);

  for (let i = 0; i < limit; i++) {
    const p = data[i];
    console.log(`  #${String(p.rank).padStart(2, ' ')}  ${p.owner}/${p.name}`);
    console.log(`      📖 ${(p.description || '无描述').slice(0, 80)}`);
    console.log(`      💻 ${p.language || 'Other'}  ⭐ ${formatNumber(p.totalStars)}  🔺 +${formatNumber(p.starsThisPeriod)}  🍴 ${formatNumber(p.forks)}`);
    console.log(`      🔗 ${p.url}`);
    if (p.contributors && p.contributors.length > 0) {
      console.log(`      👥 ${p.contributors.slice(0, 5).join(', ')}`);
    }
    console.log();
  }

  if (data.length > DISPLAY_LIMIT) {
    console.log(`  ... 还有 ${data.length - DISPLAY_LIMIT} 条记录未显示\n`);
  }
}

console.log('═'.repeat(72));
console.log(`  📊 总计: ${grandTotal} 条爬取记录  |  ${periods.length} 个时间周期`);
console.log('═'.repeat(72));

// ── Quick summary per-language ──────────────────────────────
console.log('\n🌐 语言分布汇总:\n');

const langMap = {};
for (const period of periods) {
  const data = entries[period].data || [];
  data.forEach((p) => {
    if (p.language && p.language !== 'Unknown' && p.language !== 'Other') {
      langMap[p.language] = (langMap[p.language] || 0) + 1;
    }
  });
}

Object.entries(langMap)
  .sort((a, b) => b[1] - a[1])
  .forEach(([lang, count]) => {
    console.log(`  ${pad(lang, 16)} ${count} 条`);
  });

console.log('\n✅ 查询完成\n');
