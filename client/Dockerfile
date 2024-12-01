# Build the app
FROM node:23-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application source code
COPY . .

# Copy environment example file
COPY .env.example .env

# Build the app
RUN npm run build --force

# Serve with Nginx
FROM nginx:alpine

# Copy built app to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]