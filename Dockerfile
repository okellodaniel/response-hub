# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies using npm (bun.lockb is compatible)
RUN npm install

# Copy source files
COPY . .

# Build arguments for environment variables
ARG VITE_ADVERSE_NEWS_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# Set environment variables for build
ENV VITE_ADVERSE_NEWS_API_URL=$VITE_ADVERSE_NEWS_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 83

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
