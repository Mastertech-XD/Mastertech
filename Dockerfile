FROM node:lts-buster

RUN apt-get update && apt-get install -y git

RUN git clone https://github.com/Mastertech-XD/Mastertech.git

WORKDIR /Mastertech

RUN yarn install --network-concurrency 1 && npm install -g pm2

EXPOSE 9090

CMD ["yarn", "start"]
