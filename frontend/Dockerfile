FROM node:latest

WORKDIR /frontend

COPY ./*.json ./
RUN npm install

COPY ./src ./src
COPY ./public ./public
COPY *.html ./
COPY *.mjs ./
COPY *.ts ./

CMD ["npm", "run", "dev"]
