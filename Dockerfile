FROM mhart/alpine-node
MAINTAINER Ricardo Roman <rrmn92@gmail.com>

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN yarn --no-progress

COPY . /usr/src/app

CMD npm start
