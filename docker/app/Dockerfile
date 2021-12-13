# build environment
FROM node:12
RUN mkdir /code
WORKDIR /code
ADD package*.json /code/
ADD . /code
RUN npm i
EXPOSE 3002
#RUN npm i --only=production
#CMD ["npm", "start"]
#CMD ["node", "index.js"]

