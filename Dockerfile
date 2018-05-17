FROM node

RUN mkdir -p /appdir
WORKDIR /appdir

COPY package.json /appdir
RUN npm install

COPY . /appdir

EXPOSE 3000
CMD [ "npm", "start" ]