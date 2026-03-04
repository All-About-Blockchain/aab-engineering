FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/api/src/docs/ ./packages/api/src/docs/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Start the API
CMD ["node", "packages/api/src/index.js"]
