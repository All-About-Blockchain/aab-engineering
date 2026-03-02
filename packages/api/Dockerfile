FROM node:20-alpine

WORKDIR /app

# Copy root package
COPY package.json ./

# Copy api package
COPY packages/api/package.json packages/api/
COPY packages/api/src packages/api/

# Install
WORKDIR /app/packages/api
RUN npm install

EXPOSE 3000

CMD ["node", "src/index.js"]
