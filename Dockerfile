FROM python:3.10-alpine3.18 as base

# Builder Stage where anything can be installed ignoring possible image size increases
# as we only copy selected files to the final image from here.
FROM base as builder

#Install build dependencies.
RUN apk add --no-cache postgresql-libs postgresql-client gettext zlib libjpeg libwebp libxml2-dev libxslt-dev openldap git

#Print all logs without buffering it.
ENV PYTHONUNBUFFERED 1


#Create app dir and install requirements.
RUN mkdir /opt/recipes
WORKDIR /opt/recipes

COPY requirements.txt ./

RUN \
    if [ `apk --print-arch` = "armv7" ]; then \
    printf "[global]\nextra-index-url=https://www.piwheels.org/simple\n" > /etc/pip.conf ; \
    fi
RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev zlib-dev jpeg-dev libwebp-dev openssl-dev libffi-dev cargo openldap-dev python3-dev

RUN echo -n "INPUT ( libldap.so )" > /usr/lib/libldap_r.so && \
    python -m venv venv && \
    /opt/recipes/venv/bin/python -m pip install --upgrade pip && \
    venv/bin/pip install --no-cache-dir wheel==0.37.1 && \
    venv/bin/pip install --no-cache-dir setuptools_rust==1.1.2 && \
    venv/bin/pip install --no-cache-dir -r requirements.txt

# Optimize VENV Size
# Delete unneded boto3 files as we only use the s3 functionality: (around 80MB, see https://github.com/boto/botocore/issues/1543)
RUN cd venv/lib/python3.10/site-packages/botocore/data/ && ls  | grep -vw "s3" | xargs rm -r
# Packages should be split into dev and production to not have the need to uninstall them again here:
RUN venv/bin/pip uninstall -y faker pytest
# Removing package files which are not needed for running them
RUN find . | grep -E "(/wheel$|/setuptools$|/pip$|/__pycache__$|\.pyc$|\.pyo$|\.distinfo$|\.egg-info$)" | xargs rm -rf


COPY . ./

# collect information from git repositories
RUN /opt/recipes/venv/bin/python version.py
# Final image, everything in here will increase the size of image
FROM base

#Print all logs without buffering it.
ENV PYTHONUNBUFFERED 1

#This port will be used by gunicorn.
EXPOSE 8080

RUN apk add --no-cache postgresql-libs postgresql-client gettext zlib libjpeg libwebp libxml2-dev libxslt-dev openldap

RUN mkdir /opt/recipes
WORKDIR /opt/recipes

RUN adduser -D --uid 1000 tandoor
RUN chown -R 1000:1000 /opt/recipes

COPY --chown=1000 ./boot.sh ./boot.sh
RUN chmod +x boot.sh

COPY --chown=1000 --from=builder /opt/recipes/venv/ /opt/recipes/venv/
# Add Updated file with version information
COPY --chown=1000 --from=builder /opt/recipes/manage.py /opt/recipes/manage.py

# Explicity copy project files. (to ignore .git files used in the previous build step)
COPY --chown=1000 ./recipes/ ./recipes/
COPY --chown=1000 ./cookbook/ ./cookbook/

USER tandoor


# Execute
ENTRYPOINT ["/opt/recipes/boot.sh"]
