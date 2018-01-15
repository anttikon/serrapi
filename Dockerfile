FROM node:8.9.4-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN yarn

COPY ./src /usr/src/app/src
RUN yarn build
RUN yarn --production

COPY AllSets.json /usr/src/app/

EXPOSE 3131

CMD ["yarn", "start"]
