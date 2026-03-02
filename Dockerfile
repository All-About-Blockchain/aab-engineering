FROM node:20-alpine

WORKDIR /app

# Copy root package.json for name
COPY package.json ./

# Copy api package
WORKDIR /app/packages/api
COPY package*.json ./

# Install deps
RUN npm install

# Copy API source 
COPY src ./src

# Expose port
EXPOSE 3000

# Run with tsx
CMD ["npx", "tsx", "src/index.ts"]
