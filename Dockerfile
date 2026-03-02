FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/api/src ./packages/api/src

# Install
WORKDIR /app/packages/api
RUN npm install

# Expose
EXPOSE 3000

# Run
CMD ["node", "src/index.js"]
