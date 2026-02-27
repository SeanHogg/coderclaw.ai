FROM node:25-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    git \
    sudo \
  && rm -rf /var/lib/apt/lists/*

COPY scripts/docker/install-sh-smoke/run.sh /usr/local/bin/coderclaw-install-smoke
COPY landing/public/install.sh /opt/coderclaw-install.sh
RUN chmod +x /usr/local/bin/coderclaw-install-smoke \
  && chmod a+r /opt/coderclaw-install.sh

ENTRYPOINT ["/usr/local/bin/coderclaw-install-smoke"]
