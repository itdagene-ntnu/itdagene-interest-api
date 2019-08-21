FROM node:11-alpine

MAINTAINER Peder Smith <smith.peder@gmail.com>

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

RUN yarn

COPY . /app

ARG EMAIL
ARG YEAR
ARG SHEET_ID
ARG RECAPTCHA_SECRET
ARG SENTRY_DSN

ENV EMAIL=$EMAIL
ENV YEAR=$YEAR
ENV SHEET_ID=$SHEET_ID
ENV RECAPTCHA_SECRET=$RECAPTCHA_SECRET
ENV SENTRY_DSN=$SENTRY_DSN
ENV NODE_ENV=production

EXPOSE 8000

CMD ["yarn", "start"]
