    FROM nearform/alpine3-s2i-nodejs:8

    USER root
    RUN apk update && apk upgrade && \
        apk add --no-cache git

    WORKDIR /opt/app-root/src
    ADD . /opt/app-root/src
    RUN chown -R 1001:1001 /opt/app-root/src
    USER 1001

    RUN npm install --depth 0

    EXPOSE 3002

    CMD npm start