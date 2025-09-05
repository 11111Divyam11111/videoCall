# 1. Use the official Node.js image
FROM node:18-alpine AS deps

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package.json package-lock.json* ./ 
RUN npm install

# 4. Copy the rest of the application code
COPY . .

# 5. Build the Next.js app
RUN npm run build

# 6. Remove dev dependencies for production image
RUN npm prune --production

# 7. Use a minimal Node.js image for running
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built app and node_modules from previous stage
COPY --from=deps /app /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
