FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/

# Install dependencies
RUN npm ci --workspaces=false

# Copy source
COPY . .

# Build TypeScript
WORKDIR /app/packages/api
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
