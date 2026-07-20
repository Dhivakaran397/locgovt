const http  = require('http');
const https = require('https');
const { URL } = require('url');
const GovtService = require('../models/GovtService');

/**
 * Pings a URL to check if it's active.
 * Handles redirects and sets a tight timeout to avoid hanging processes.
 * Returns true if status is 2xx or 3xx.
 */
const checkUrlStatus = (urlStr, timeoutMs = 6000) => {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(urlStr);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        timeout: timeoutMs,
      };

      const req = client.request(parsedUrl, options, (res) => {
        // Any 2xx or 3xx response is considered active
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(true);
        } else if (res.statusCode === 503 || res.statusCode >= 500) {
          // Explicit service unavailable / server errors
          resolve(false);
        } else {
          // Standard other statuses (e.g. 403, 401 might still be active portals)
          resolve(true);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.end();
    } catch {
      resolve(false);
    }
  });
};

/**
 * Checks all service portals in the database and updates status in real-time.
 */
const runHealthCheck = async () => {
  try {
    const services = await GovtService.find({});
    console.log(`⏱️   Running URL health checks for ${services.length} portals...`);

    let offlineCount = 0;
    for (const service of services) {
      const isUp = await checkUrlStatus(service.officialUrl);

      const oldIndicator = service.currentStatus?.indicator || 'UP';
      let newIndicator = oldIndicator;

      if (!isUp) {
        offlineCount++;
        // Auto mark as DOWN on failure
        newIndicator = 'DOWN';
      } else {
        // If back online, clear downvotes and mark UP
        newIndicator = 'UP';
        service.currentStatus.downVotesCount = 0;
      }

      if (oldIndicator !== newIndicator) {
        service.currentStatus.indicator = newIndicator;
        await service.save();
        console.log(`🔄  [Auto-Status] ${service.serviceName} changed: ${oldIndicator} → ${newIndicator}`);
      }
    }

    console.log(`🏁  Health check completed. Offline: ${offlineCount}/${services.length}`);
  } catch (error) {
    console.error('💥  Health check loop failed:', error.message);
  }
};

/**
 * Starts the automatic background loop
 */
const startHealthChecker = (intervalMs = 10 * 60 * 1000) => {
  // Run check immediately on start
  setTimeout(runHealthCheck, 3000);

  // Interval check
  setInterval(runHealthCheck, intervalMs);
};

module.exports = {
  startHealthChecker,
  runHealthCheck,
};
