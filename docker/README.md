# Brief Docker documentation
============================

To build the docker image
-------------------------

The `docker` command must be executed from the eco/docker directory.

```shell
docker build -f Dockerfile -t eco .
```

Run a shell
----------

```shell
docker run -t -i --entrypoint=/bin/bash eco
```

Use `docker exec -it <container> /bin/bash` to connect a second shell into the container.

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
docker image save -o docker-image-eco.tgz eco
```

Importing the Docker image

```shell
docker load < docker-image-eco.tgz
```


Cleaning
--------


It might be needed to first remove an existing Hop image with:

```shell
$ docker images
```

to get the eco docker <image-id>, and then:

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

Misc
====

```
docker image inspect --format="-" eco 
```

To check is an image exists. Returns 0 is it does. Returns non-zero
otherwise.

To create a never ending named container:

```
docker run  --name MYNAME eco -c "tail -f /dev/null"
```

To run a command inside that named container:

```
docker exec MYNAME /bin/ls
```

To terminate that container:

```
docker rm -f MYNAME
```
