FROM python:3.10-alpine3.18

#Install all dependencies.
RUN apk add --no-cache postgresql-libs postgresql-client gettext zlib libjpeg libwebp libxml2-dev libxslt-dev openldap git yarn

# Fix libxml error from xmlsec https://github.com/xmlsec/python-xmlsec/issues/257#issuecomment-1738620862
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v3.15/community/" | tee -a /etc/apk/repositories
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v3.15/main" | tee -a /etc/apk/repositories
RUN apk add --no-cache libxml2-dev=2.9.14-r2  xmlsec-dev=1.2.33-r0

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
RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev zlib-dev jpeg-dev libwebp-dev openssl-dev libffi-dev cargo openldap-dev python3-dev && \
    echo -n "INPUT ( libldap.so )" > /usr/lib/libldap_r.so && \
    pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt && \
    rm -rf /tmp/pip-tmp && \
    apk --purge del .build-deps