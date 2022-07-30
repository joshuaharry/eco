FROM debian:bookworm

RUN apt update && apt dist-upgrade -y && apt install -y \
    bash \
    procps \
    make \
    wget \
    git \
    emacs \
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
    yarnpkg \
    && apt clean

WORKDIR /home/scotty

RUN (cd /usr/bin; ln -s yarnpkg yarn)

RUN useradd --no-log-init -d /home/scotty -s /bin/bash scotty
RUN chown -R scotty /home/scotty

USER scotty
ENV HOME /home/scotty
ENV PATH $PATH:/home/scotty/local/bin

run mkdir -p /home/scotty/local/bin
run echo 'prefix = /home/scotty/local' >> /home/scotty/.npmrc
    
RUN git clone https://github.com/joshuaharry/scotty.git
RUN cd /home/scotty/scotty \
    && npm install \
    && sh build/build.sh \
    && npm install -g .
    
RUN git clone https://github.com/joshuaharry/eco.git
RUN cd /home/scotty/eco \
    && npm install \
    && sh build/build.sh \
    && npm install -g .
RUN cd /home/scotty/eco/lists \
    && ./split.sh

STOPSIGNAL SIGINT

ENTRYPOINT ["/bin/bash"]
