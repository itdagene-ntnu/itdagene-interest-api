FROM node:11

WORKDIR app/

COPY . ./

CMD "node server.js"
