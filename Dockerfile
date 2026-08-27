# ── Stage 1: Build React Frontend ──
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd ./frontend && npm install
COPY frontend/ ./frontend/
COPY backend/public ./backend/public
WORKDIR /app/frontend
RUN npm run build

# ── Stage 2: PHP / Laravel Backend ──
FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy backend source code
COPY backend/ /var/www

# Copy freshly compiled frontend assets from Stage 1 into /var/www/public
COPY --from=frontend-builder /app/backend/public /var/www/public

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 8000

CMD ["sh", "-c", "php artisan storage:link --force && php artisan serve --host=0.0.0.0 --port=8000"]
