# Use the official Node.js LTS Alpine image for a lightweight build
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN pnpx prisma db push
RUN pnpx prisma generate

# Build the TypeScript code
RUN pnpm build
RUN pnpm seed
RUN ls -l /app


# Expose the port the app runs on
EXPOSE 3303
