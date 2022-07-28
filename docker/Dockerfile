FROM debian:bookworm

RUN apt update && apt dist-upgrade && apt install -y \
    bash \
    make \
    wget \
    git \
    gcc g++ \
    autoconf \
    automake \
    curl \
    pkg-config \
    libtool \
    calc \
    nodejs \
    node-typescript \
    && apt clean

WORKDIR /home/scotty

RUN useradd --no-log-init -d /home/scotty -s /bin/bash scotty
RUN git clone https://github.com/joshuaharry/scotty.git
RUN git clone https://github.com/joshuaharry/eco.git
RUN chown -R scotty /home/scotty

USER scotty
ENV HOME /home/scotty

STOPSIGNAL SIGINT

ENTRYPOINT ["/bin/bash"]
