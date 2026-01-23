# Build Stage
FROM node:22-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Accept API Key as build argument
ARG GEMINI_API_KEY
# Vite only exposes vars starting with VITE_ to the client
ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY

# Build the app
RUN npm run build

# Serve Stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
