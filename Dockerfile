FROM node:alpine

WORKDIR /app

ADD package.json .
ADD yarn.lock .
RUN yarn install

ADD . .

RUN yarn global add babel-cli

ARG APPPORT=7442
ENV APPPORT $APPPORT
EXPOSE $APPPORT
CMD npm start
