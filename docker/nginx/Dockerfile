FROM nginx:alpine

WORKDIR /var/www/test

COPY ./app/test /var/www/test

COPY ./docker/nginx/conf/default /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
