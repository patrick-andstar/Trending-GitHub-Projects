/**
 * GitHub Trending Scraper — 使用 GitHub Search API (带 Token 认证)
 * 解决 CloudRun 上海节点无法访问 github.com 的问题
 */

const axios = require('axios');

// GitHub API Token 从环境变量读取
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const PERIOD_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

/**
 * Fetch trending repositories from GitHub Search API
 * @param {string} period - 'daily' | 'weekly' | 'monthly'
 * @returns {Promise<Array>} Array of trending project objects
 */
async function scrapeTrending(period = 'weekly') {
  console.log(`🔍 Fetching GitHub trending [${period}] via API...`);

  const days = PERIOD_DAYS[period] || 7;
  const date = new Date();
  date.setDate(date.getDate() - days);
  const dateStr = date.toISOString().split('T')[0];

  const headers = {
    'User-Agent': 'GitHub-Trending-App/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    console.log('   🔐 Using authenticated API request');
  } else {
    console.warn('   ⚠️ No GITHUB_TOKEN, using unauthenticated request (rate limited)');
  }

  try {
    const response = await axios.get(
      `https://api.github.com/search/repositories`,
      {
        params: {
          q: `created:>${dateStr}`,
          sort: 'stars',
          order: 'desc',
          per_page: 25,
        },
        headers,
        timeout: 30000,
      }
    );

    const items = response.data.items || [];
    console.log(`✅ API returned ${items.length} repositories`);

    const projects = items.map((repo, index) => ({
      rank: index + 1,
      owner: repo.owner?.login || '',
      name: repo.name || '',
      fullName: repo.full_name || `${repo.owner?.login}/${repo.name}`,
      url: repo.html_url || `https://github.com/${repo.full_name}`,
      description: repo.description || '',
      language: repo.language || 'Other',
      totalStars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      starsThisPeriod: Math.round((repo.stargazers_count || 0) * 0.1), // 估算本周增长
      contributors: [],
    }));

    return projects;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const msg = err.response.data?.message || 'Unknown API error';
      if (status === 403) {
        throw new Error(`API rate limit exceeded or token invalid: ${msg}`);
      }
      if (status === 401) {
        throw new Error(`GitHub token invalid: ${msg}`);
      }
      throw new Error(`GitHub API error ${status}: ${msg}`);
    }
    throw err;
  }
}

module.exports = { scrapeTrending };
