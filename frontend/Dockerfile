
# ==========================================
# STAGE 1: BUILD REACT APPLICATION
# ==========================================

FROM node:20-alpine AS build

WORKDIR /app

# Copy package configuration
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ .

# Build production files
RUN npm run build


# ==========================================
# STAGE 2: SERVE REACT APPLICATION
# ==========================================

FROM nginx:alpine

# Copy production build into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
