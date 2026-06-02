FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://npm.iranrepo.ir/ && \
    npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
