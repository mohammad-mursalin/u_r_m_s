FROM node:20-alpine

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package.json package-lock.json* ./

# Clean install — ignore optional platform-specific binaries
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copy the rest of the source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]