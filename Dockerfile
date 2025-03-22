FROM node:20.19-alpine AS node-deps
WORKDIR /src/recipes/vue3

COPY --link ./vue3/package.json yarn.lock ./

# TODO: use --frozen-lockfile
# RUN yarn install --frozen-lockfile
RUN yarn install

COPY --link ./vue3 ./
COPY --link ./vue ../vue

FROM node-deps AS node-builder

RUN <<EOF
  sed -i -e 's/..\/cookbook\/static\/vue3/.\/build/g' ./vite.config.ts
  yarn build
EOF

FROM python:3.13-alpine3.21 AS base
WORKDIR /opt/recipes

# Print all logs without buffering: https://stackoverflow.com/a/59812588
ENV PYTHONUNBUFFERED=1

# Install all dependencies.
RUN apk add --no-cache \
  gettext \
  git \
  libgcc \
  libjpeg \
  libstdc++ \
  libwebp \
  libxml2-dev \
  libxslt-dev \
  openldap \
  postgresql-client \
  postgresql-libs \
  zlib

FROM base AS deps

ENV DOCKER=true

COPY --link requirements.txt ./

RUN <<EOF
  if [ $(apk --print-arch) = "armv7" ]; then
    printf "[global]\nextra-index-url=https://www.piwheels.org/simple\n" >/etc/pip.conf
  fi

  # remove Development dependencies from requirements.txt
  sed -i '/# Development/,$d' requirements.txt

  apk add --no-cache --virtual .build-deps \
    build-base \
    cargo \
    curl \
    g++ \
    gcc \
    jpeg-dev \
    libffi-dev \
    libwebp-dev \
    musl-dev \
    openldap-dev \
    openssl-dev \
    postgresql-dev \
    python3-dev \
    xmlsec \
    xmlsec-dev \
    zlib-dev

  echo -n "INPUT ( libldap.so )" >/usr/lib/libldap_r.so

  python -m venv venv
  /opt/recipes/venv/bin/python -m pip install --upgrade pip
  venv/bin/pip debug -v
  venv/bin/pip install wheel==0.45.1
  venv/bin/pip install setuptools_rust==1.10.2

  if [ $(apk --print-arch) = "aarch64" ]; then
    curl https://sh.rustup.rs -sSf | sh -s -- -y
  fi

  venv/bin/pip install -r requirements.txt --no-cache-dir

  apk --purge del .build-deps
EOF

FROM deps AS builder
# Copy project and execute it.
COPY --link . ./
COPY --link --chmod=755 boot.sh ./

# commented for now https://github.com/TandoorRecipes/recipes/issues/3478
#HEALTHCHECK --interval=30s \
#            --timeout=5s \
#            --start-period=10s \
#            --retries=3 \
#            CMD [ "/usr/bin/wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:8080/openapi" ]

# collect information from git repositories
RUN <<EOF
  /opt/recipes/venv/bin/python version.py
  # delete git repositories to reduce image size
  find . -type d -name ".git" | xargs rm -rf
EOF

FROM base AS runner
COPY --link --from=builder /opt/recipes/ ./
COPY --link --from=node-builder /src/recipes/vue3/build ./cookbook/static/vue3/

# This port will be used by gunicorn.
EXPOSE 8080

ENTRYPOINT ["/opt/recipes/boot.sh"]
