FROM python:3.9-alpine3.12

#Install all dependencies.
RUN apk add --no-cache postgresql-libs gettext zlib libjpeg libwebp libxml2-dev libxslt-dev py-cryptography

#Print all logs without buffering it.
ENV PYTHONUNBUFFERED 1

#This port will be used by gunicorn.
EXPOSE 8080

#Create app dir and install requirements.
RUN mkdir /opt/recipes
WORKDIR /opt/recipes

COPY requirements.txt ./

RUN apk add --no-cache --virtual .build-deps yarn gcc musl-dev postgresql-dev zlib-dev jpeg-dev libwebp-dev libressl-dev libffi-dev cargo openssl-dev openldap-dev && \
    python -m pip install --upgrade pip && \
    pip install gunicorn wheel==0.36.2 && \
    pip install -r requirements.txt --no-cache-dir &&\
    apk --purge del .build-deps

#Copy project and execute it.
COPY . ./
RUN chmod +x boot.sh
#RUN cd vue && yarn cache clean --all && yarn install && yarn build
ENTRYPOINT ["/opt/recipes/boot.sh"]
