# Brief Docker documentation
============================

To build the docker image
-------------------------

The `docker` command must be executed from the eco/docker directory.

```shell
docker build -f Dockerfile -t scotty .
```

Run a shell
----------

```shell
docker run -t -i --entrypoint=/bin/bash scotty
```

Exporting the Docker image

```shell
docker image save -o docker-image-scotty.tgz scotty
```

Importing the Docker image

```shell
docker load < docker-image-scotty.tgz
```


Cleaning
--------


It might be needed to first remove an existing Hop image with:

```shell
$ docker images
```

to get the scotty docker <image-id>, and then:

```shell
$ docker rmi <image-id>
```

It might be needed to kill running processes in that image first:

```shell
$ docker ps -a
$ docker rm <container-id>
```

or

```shell
docker container prune
```
