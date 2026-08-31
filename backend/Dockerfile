FROM php:8.4-cli

# Install PHP extension installer (fast, robust, pre-compiled binaries, no OOM)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions using installer
RUN install-php-extensions pdo_mysql mbstring zip exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy backend source code
COPY . /var/www

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 8000

CMD ["sh", "-c", "php artisan storage:link --force && php artisan serve --host=0.0.0.0 --port=8000"]
