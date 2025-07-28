FROM node

RUN mkdir -p /apps/test
WORKDIR /apps/test

COPY package.json /app/test/package.json
COPY . .

RUN npm install

EXPOSE 5001