FROM node:argon

RUN npm install --global gulp
RUN npm install --global bunyan

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Transpile sources
RUN gulp

EXPOSE 9090
CMD ["npm", "start"]