FROM debian:bookworm

RUN apt update && apt dist-upgrade -y && apt install -y \
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
    npm \
    node-typescript \
    && apt clean

WORKDIR /home/scotty

RUN useradd --no-log-init -d /home/scotty -s /bin/bash scotty

RUN chown -R scotty /home/scotty

USER scotty
ENV HOME /home/scotty
ENV PATH $PATH:/home/scotty/local/bin

run mkdir -p /home/scotty/local/bin
run echo 'prefix = /home/scotty/local' >> /home/scotty/.npmrc
    
RUN git clone https://github.com/manuel-serrano/scotty.git
RUN cd /home/scotty/scotty \
    && npm install \
    && sh build/build.sh \
    && npm install -g .
    
RUN git clone https://github.com/manuel-serrano/eco.git
RUN cd /home/scotty/eco \
    && npm install \
    && sh build/build.sh \
    && npm install -g .
RUN cd /home/scotty/eco/lists \
    && ./split.sh

STOPSIGNAL SIGINT

ENTRYPOINT ["/bin/bash"]
