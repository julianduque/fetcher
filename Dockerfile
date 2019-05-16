FROM node:10

# Add Tini
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# Setup a non-privileged user
RUN groupadd -g 16752 fetcher && useradd -u 16752 -g fetcher fetcher \
&& mkdir -p /usr/src/app \
&& mkdir -p /home/fetcher \
&& chown -R fetcher:root /usr/src/app \
&& chown -R fetcher:root /home/fetcher \
&& chmod -R 0770 /usr/src/app;

# Setup our project
WORKDIR /usr/src/app

# Add base package.json
COPY package.json .

# Add local npm modules
ADD fetcher-config/ /usr/src/app/fetcher-config
ADD fetcher-queue/  /usr/src/app/fetcher-queue
ADD fetcher-db/     /usr/src/app/fetcher-db
ADD fetcher-api/    /usr/src/app/fetcher-api

# Fix permissions for local npm modules
RUN chown -R fetcher:root /usr/src/app/fetcher-*

# Install project
USER fetcher
RUN npm install --production

COPY . .

# Run project
ENV NODE_ENV production

ENTRYPOINT ["/tini", "--"]
CMD ["node", "server"]
