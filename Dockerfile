FROM node:alpine

WORKDIR /app

RUN npm set registry http://centr.jackmac.party:4873
# RUN npm adduser --registry http://centr.jackmac.party:4873

ADD package.json yarn.lock ./
RUN yarn install

ADD . .

RUN npm run build

ARG APPPORT
ENV APPPORT $APPPORT
EXPOSE $APPPORT

CMD npm start
