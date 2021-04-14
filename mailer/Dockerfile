FROM node:lts-alpine

ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3011

CMD [ "npm", "start" ]
