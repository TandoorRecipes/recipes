FROM python:3.13-alpine3.22

#Install all dependencies.
RUN apk add --no-cache postgresql-libs postgresql-client gettext zlib libjpeg libwebp libxml2-dev libxslt-dev openldap git yarn libgcc libstdc++ nginx tini envsubst nodejs npm

#Print all logs without buffering it.
ENV PYTHONUNBUFFERED 1

#This port will be used by gunicorn.
EXPOSE 8000

#This port will be used by vue
EXPOSE 8080

#Install all python dependencies to the image
COPY requirements.txt /tmp/pip-tmp/

RUN \
    if [ `apk --print-arch` = "armv7" ]; then \
    printf "[global]\nextra-index-url=https://www.piwheels.org/simple\n" > /etc/pip.conf ; \
    fi
RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev zlib-dev jpeg-dev libwebp-dev openssl-dev libffi-dev cargo openldap-dev python3-dev xmlsec-dev xmlsec build-base g++ curl rust && \
    python -m pip install --upgrade pip && \
    pip debug -v && \
    pip install wheel==0.45.1 && \
    pip install setuptools_rust==1.10.2 && \
    pip install -r /tmp/pip-tmp/requirements.txt --no-cache-dir &&\
    apk --purge del .build-deps