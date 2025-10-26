FROM nginx:alpine

WORKDIR /var/www/public

COPY ./app/public /var/www/public

COPY ./docker/nginx/conf/default /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
