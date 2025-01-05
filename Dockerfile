FROM python:3.12-alpine3.19

#Install all dependencies.
RUN apk add --no-cache postgresql-libs postgresql-client gettext zlib libjpeg libwebp libxml2-dev libxslt-dev openldap git

#Print all logs without buffering it.
ENV PYTHONUNBUFFERED 1

ENV DOCKER true

#This port will be used by gunicorn.
EXPOSE 8080

#Create app dir and install requirements.
RUN mkdir /opt/recipes
WORKDIR /opt/recipes

COPY requirements.txt ./

RUN \
    if [ `apk --print-arch` = "armv7" ]; then \
    printf "[global]\nextra-index-url=https://www.piwheels.org/simple\n" > /etc/pip.conf ; \
    fi
# remove Development dependencies from requirements.txt
RUN sed -i '/# Development/,$d' requirements.txt
RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev zlib-dev jpeg-dev libwebp-dev openssl-dev libffi-dev cargo openldap-dev python3-dev && \
    echo -n "INPUT ( libldap.so )" > /usr/lib/libldap_r.so && \
    python -m venv venv && \
    /opt/recipes/venv/bin/python -m pip install --upgrade pip && \
    venv/bin/pip install wheel==0.42.0 && \
    venv/bin/pip install setuptools_rust==1.9.0 && \
    venv/bin/pip install -r requirements.txt --no-cache-dir &&\
    apk --purge del .build-deps

#Copy project and execute it.
COPY . ./

# commented for now https://github.com/TandoorRecipes/recipes/issues/3478
#HEALTHCHECK --interval=30s \
#            --timeout=5s \
#            --start-period=10s \
#            --retries=3 \
#            CMD [ "/usr/bin/wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:8080/openapi" ]

# collect information from git repositories
RUN /opt/recipes/venv/bin/python version.py
# delete git repositories to reduce image size
RUN find . -type d -name ".git" | xargs rm -rf

RUN chmod +x boot.sh
ENTRYPOINT ["/opt/recipes/boot.sh"]
