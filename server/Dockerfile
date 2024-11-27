# Use Node.js LTS version with Alpine Linux
FROM node:lts-alpine

# Set production environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# Install production dependencies and move node_modules up
RUN npm install --omit=dev && mv node_modules ../

# Copy application source code
COPY . .

# Copy environment example file
COPY .env.example .env

# Build the application
RUN npm run build

# Expose application port
EXPOSE 3000

# Change ownership to non-root user
RUN chown -R node /usr/src/app

# Switch to non-root user
USER node

# Start the application
CMD ["node", "./dist/index.js"]