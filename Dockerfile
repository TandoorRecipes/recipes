# old dockerfile updated
# ==========================================
# Stage 1 - Build Stage
# ==========================================
FROM python:3.13-alpine3.23 AS build

# Install build dependencies
# Added g++ and rust for newer python package compilation
RUN apk add --no-cache git yarn gcc musl-dev postgresql-dev zlib-dev \
    jpeg-dev libwebp-dev openssl-dev libffi-dev cargo openldap-dev \
    python3-dev xmlsec-dev xmlsec build-base g++ curl rust

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    DOCKER=true

# Create app directory
WORKDIR /opt/recipes

# 1. Handle Python Dependencies first for caching
COPY ./requirements.txt ./
RUN sed -i '/# Development/,$d' requirements.txt

# Create venv and install wheels
RUN python -m venv venv && \
    /opt/recipes/venv/bin/python -m pip install --upgrade pip && \
    /opt/recipes/venv/bin/pip install wheel==0.45.1 setuptools_rust==1.10.2 && \
    /opt/recipes/venv/bin/pip install -r requirements.txt --no-cache-dir

# 2. Handle Vue Frontend with optimized caching
WORKDIR /vue3
COPY ./vue3/package.json ./vue3/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./vue3/ .
RUN yarn build && \
    find . -type d -name "node_modules" | xargs rm -rf

# 3. Finalize app source
WORKDIR /opt/recipes
COPY . .
# Sync the built frontend into the Django static structure
RUN cp -r /cookbook/static/vue3 /opt/recipes/cookbook/static/vue3 2>/dev/null || true

# Generate version info and cleanup
RUN /opt/recipes/venv/bin/python version.py && \
    find . -type d -name ".git" | xargs rm -rf && \
    rm -rf .pytest_cache docs tests

# ==========================================
# Stage 2 - Runtime Stage
# ==========================================
FROM python:3.13-alpine3.23

# Install only runtime libraries (no compilers/node)
RUN apk add --no-cache \
    postgresql-libs \
    postgresql-client \
    gettext \
    zlib \
    libjpeg \
    libwebp \
    libxml2 \
    libxslt \
    openldap \
    git \
    libgcc \
    libstdc++ \
    tini \
    envsubst

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    DOCKER=true

WORKDIR /opt/recipes

# Copy only the necessary artifacts from the build stage
COPY --from=build /opt/recipes /opt/recipes

# Expose Gunicorn/Django port
EXPOSE 8080

# Use Tini as the init process for better signal handling
RUN chmod +x boot.sh
ENTRYPOINT ["/sbin/tini", "--", "/opt/recipes/boot.sh"]