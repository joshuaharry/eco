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


Run eco
-------

To generate the eco log files (takes about 5 to 10 hours depending on
the network speed):

```shell
(docker) cd /home/scotty/eco/lists && ./eco-all-lists.sh
```

The logs are stored in `/home/scotty/.eco/JavaScript`

To collect all statistics:

```shell
(docker) cd /home/scotty/eco/lists && ./eco-statistics.sh
```


Managing images
---------------

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
