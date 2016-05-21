# Bifrost Engine
The Bifrost Engine is the central component of the Bifrost Toolkit.

## Setup for Development
### Requirements
* [NodeJS](https://nodejs.org/en/) > 4.2.*
* [Gulp](http://gulpjs.com/)

### Setup
After cloning the project, make sure you have installed gulp in your global npm (`npm install -g gulp`).

1. `npm install` to install all dependencies.
3. `gulp` to transpile the sources.
2. `npm start` to run the engine.

The engine will listen on `localhost:9090`

### Gulp
There are a number of various gulp tasks that are able to help you during development:

* `gulp clean`: Removes the /dist folder and all transpiled files
* `gulp babel`: Transpiles the code to backwards compatible ECMAScript2015-compliant JavaScript
* `gulp test`: Runs the mocha test suite.
* `gulp serve`: Starts the Bifrost Engine using [nodemon](https://github.com/remy/nodemon), automatically restarting the process upon code changes. Perfect for development!

### Run with Docker
You can always use our official Docker-Image to run the Engine.

```
docker run -p 8000:80 -d bifrostuzh/engine
```