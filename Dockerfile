# Use official Node.js LTS image
FROM node:lts-buster

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json if it exists
COPY package*.json ./

# Install dependencies (omit dev dependencies for smaller image)
RUN npm install --omit=dev && npm install -g pm2

# Copy the rest of your project files
COPY . .

# Expose the port your bot runs on
EXPOSE 9090

# Start the bot
CMD ["npm", "start"]

