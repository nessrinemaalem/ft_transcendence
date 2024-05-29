FROM node:18

RUN mkdir -p /app

COPY package*.json /app/

WORKDIR /app

RUN npm install

COPY . /app/

EXPOSE 8000

CMD ["npm", "run", "start:dev"]
