FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source and build
COPY . .
ENV NODE_ENV=production
RUN npm run build

# --- Final image ---
FROM node:18-alpine

WORKDIR /app

# Use a lightweight static server
RUN npm install -g serve@14.2.3

# Copy build artifacts
COPY --from=builder /app/dist /app/dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]