# Use official Node image
FROM node:18

# Install Ghostscript
RUN apt-get update && apt-get install -y ghostscript

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of your source code
COPY . .

# Expose port (update if needed)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
