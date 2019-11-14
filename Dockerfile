
FROM alpine

# Project Files and Settings

RUN mkdir /Recipes
WORKDIR /Recipes

ADD . /Recipes/

RUN apk update
RUN apk upgrade
RUN apk --no-cache add \
    python3 \
    python3-dev \
    postgresql-client \
    postgresql-dev \
    build-base \
    gettext \
    libxslt1-dev \
    libxml2-dev

RUN pip3 install --upgrade pip

RUN pip3 install -r requirements.txt

RUN apk del -r python3-dev

ENV PYTHONUNBUFFERED 1

# Server
EXPOSE 8080
