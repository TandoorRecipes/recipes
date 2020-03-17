FROM python:3.8-slim-buster

RUN mkdir /Recipes
WORKDIR /Recipes

ADD . /Recipes/

RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y \
    python3 \
    python3-pip \
    postgresql-client \
    gettext

RUN pip3 install --upgrade pip

RUN pip3 install -r requirements.txt

RUN apt-get autoremove -y

ENV PYTHONUNBUFFERED 1

EXPOSE 8080