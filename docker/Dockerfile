FROM debian:bookworm

RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y \
    bash \
    dash \
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
    python3 \
    && apt-get clean

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

run mkdir -p /home/scotty/local/shell
run echo '#!/bin/bash' > /home/scotty/local/shell/cdbash
run echo '(cd $1; /bin/bash -c $2)' >> /home/scotty/local/shell/cdbash
run chmod a+rx /home/scotty/local/shell/cdbash

STOPSIGNAL SIGINT

ENTRYPOINT ["/bin/bash"]
