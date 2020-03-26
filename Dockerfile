FROM python:3.8-alpine

RUN apk add --no-cache postgresql-libs gettext zlib libjpeg libxml2-dev libxslt-dev
ENV PYTHONUNBUFFERED 1
EXPOSE 8080

RUN mkdir /opt/recipes
WORKDIR /opt/recipes
RUN chmod +x boot.sh setup.sh
RUN ln -s /opt/recipes/setup.sh /usr/local/bin/createsuperuser

RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev zlib-dev jpeg-dev  && \
    python -m venv venv && \
    venv/bin/pip install -r requirements.txt --no-cache-dir &&\
    apk --purge del .build-deps

ENTRYPOINT ["/opt/recipes/boot.sh"]