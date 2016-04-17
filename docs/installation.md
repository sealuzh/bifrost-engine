# Integrating the Bifrost Toolkit
This guide will help you to setup the Bifrost Toolkit in your own application to leverage its data-driven release capabilities.

## 1. Deploying the Engine
There are currently two choices to deploy the Bifrost Engine.

### Docker
If you are using [Docker](http://www.docker.com), you may deploy the Bifrost Engine as follows. First, either build the docker image locally or simply use the prebuilt image using:

```
docker run -e NODE_ENV=production -e PROMETHEUS=[URL] -d --name bifrost-engine -t dschoeni/bifrost-engine
```

Replace the Prometheus-URL with the correct full URL (for example `http://prometheus:9090`) or the Engine will be unable to properly access get Prometheus API.

Make sure that you either `--link` (deprecated) existing containers you would like to use during a release process (such as instances of Bifrost Proxy or [Prometheus](http://prometheus.io)) or deploy them into the same [Docker-Network](https://docs.docker.com/engine/userguide/networking/) using `--net` (preferably).

### Node.js
You can choose on how to deploy Bifrost Engine by yourself. The Engine can be deployed manually, using:

```npm start```

Make sure that your `NODE_ENV` environment variable is set to production, as this greatly influences the performance.

## 2. Proxying Services
In order to use the routing capabilities during releases, each service has to be proxied by an instance of Bifrost Proxy. To run a proxy for a service, simply use:

```
docker run -e NODE_ENV=production -e PORT=[PORT] -e HOST=[HOSTNAME] -d -t dschoeni/bifrost-proxy
```

Please make sure to replace `PORT` and `HOSTNAME` with the apporiate values of the service you would like to deploy the proxy for.

Make sure that you either `--link` (deprecated) the proxied service container or deploy them into the same [Docker-Network](https://docs.docker.com/engine/userguide/networking/) using `--net` (preferably).

## 3. Release!
If all your containers are properly running, there is only one thing left: Install the Bifrost CLI to easily schedule releases.



