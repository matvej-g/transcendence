FROM nginx:alpine

RUN apk update --no-cache && \
    apk upgrade && \
    apk add --no-cache openssl curl

COPY ./conf/default.conf /etc/nginx/conf.d/default.conf
COPY ./conf/openssl.conf /etc/nginx/ssl/openssl.conf
COPY ./tools/setup_nginx.sh /setup_nginx.sh

# grant rights to execute script & use openssl.conf for automatic prompt answering during key gen
RUN chmod +x /setup_nginx.sh
RUN chmod +x /etc/nginx/ssl/openssl.conf

ENTRYPOINT ["/setup_nginx.sh"]
