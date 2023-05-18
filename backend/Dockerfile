FROM node:latest

WORKDIR /backend

COPY ./*.json ./
RUN npm install

COPY ./.env ./
COPY ./src ./src

CMD ["npm", "run", "start"]
