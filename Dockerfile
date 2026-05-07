# Use the official Node.js LTS image (Alpine for a smaller footprint)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (Render overrides this with the PORT env var)
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]
