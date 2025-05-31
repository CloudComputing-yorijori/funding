FROM node:22
ENV NODE_ENV="production"

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .

EXPOSE 3001

CMD npx wait-port mysql-funding:3306 && \
    npm start
