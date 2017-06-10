FROM node:alpine

WORKDIR /app

ADD package.json yarn.lock ./

RUN npm set registry https://npm.jackmac.party && yarn install

ADD . .

RUN npm run build

ARG APPPORT=7442
ENV APPPORT $APPPORT
EXPOSE $APPPORT

CMD npm start
