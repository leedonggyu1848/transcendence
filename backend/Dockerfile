FROM node:latest

WORKDIR /backend

COPY ./*.json ./
RUN npm install

COPY ./.env ./
COPY ./src ./src
COPY ./uploads ./uploads


CMD ["npm", "run", "start"]
