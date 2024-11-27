# Step 1: Build the app
# Use the official Node.js image to build the app
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Vite project for production
RUN npm run build

# Step 2: Serve the app with a lightweight server (e.g., Nginx)
# Use a minimal Nginx image to serve the production build
FROM nginx:alpine

# Copy the build output from the build stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Nginx will serve the files by default on port 80
CMD ["nginx", "-g", "daemon off;"]
