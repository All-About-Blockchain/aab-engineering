FROM node:20-alpine

WORKDIR /app/packages/api

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY src ./src

# Expose port
EXPOSE 3000

# Run
CMD ["node", "src/index.js"]
