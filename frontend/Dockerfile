FROM node:14.5.0-slim

RUN mkdir /app/
WORKDIR /app/
ADD . /app/
RUN npm install
RUN npm run build:dll

CMD ["npm", "run", "start"]
