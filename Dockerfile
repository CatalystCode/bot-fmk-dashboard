FROM node:8.2.1-alpine

# Create app directory
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/client
RUN mkdir -p /usr/src/app/server
WORKDIR /usr/src/app

# Install app dependencies
COPY yarn.lock /usr/src/app/
COPY package.json /usr/src/app/

COPY server/yarn.lock /usr/src/app/server
COPY server/package.json /usr/src/app/server

COPY client/yarn.lock /usr/src/app/client
COPY client/package.json /usr/src/app/client

RUN npm install yarn -g
RUN yarn

# Bundle app source
COPY . /usr/src/app

# Build client assets
WORKDIR /usr/src/app/client
RUN yarn build

WORKDIR /usr/src/app/
CMD [ "npm", "start" ]
