# Use the official Node.js image as the base image
FROM node:slim

RUN apt-get update -y && apt-get install -y openssl libssl-dev
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json pnpm-lock.yaml ./

# Install the application dependencies
RUN pnpm install --frozen-lockfile


# Copy the rest of the application files
COPY . .

RUN pnpm prisma generate

# Build the NestJS application
RUN pnpm build

# Expose the application port
EXPOSE 5000

# Command to run the application
CMD ["node", "dist/main"]
