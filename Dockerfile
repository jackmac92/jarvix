FROM node:alpine

WORKDIR /app

ADD package.json .
ADD yarn.lock .
RUN yarn install

ADD . .

ENV APPPORT=7442

RUN yarn global add babel-cli

EXPOSE 7442

CMD npm start
