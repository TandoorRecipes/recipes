FROM python:3.9-alpine3.12

#Install all dependencies.
RUN apk add --no-cache postgresql-libs gettext zlib libjpeg libxml2-dev libxslt-dev py-cryptography

#Print all logs without buffering it.
ENV PYTHONUNBUFFERED 1

#This port will be used by gunicorn.
EXPOSE 8080

#Create app dir and install requirements.
RUN mkdir /opt/recipes
WORKDIR /opt/recipes

COPY requirements.txt ./

RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev zlib-dev jpeg-dev libressl-dev libffi-dev cargo && \
    python -m venv venv && \
    /opt/recipes/venv/bin/python -m pip install --upgrade pip && \
    venv/bin/pip install wheel==0.36.2 && \
    venv/bin/pip install -r requirements.txt --no-cache-dir &&\
    apk --purge del .build-deps

#Copy project and execute it.
COPY . ./
RUN chmod +x boot.sh
ENTRYPOINT ["/opt/recipes/boot.sh"]