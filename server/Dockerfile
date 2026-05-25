FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy source code and cache data
COPY index.js scraper.js cache.js fallback.js cache_data.json ./

# Expose port (CloudRun injects PORT env var)
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
