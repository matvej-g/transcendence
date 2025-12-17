#!/bin/sh

#-----------------------------------------------------------------------------------------------#
# generate self-signed certificate & key														#
# openssl																						#
#	- tool for creating and managing OpenSSL certificates										#
# req																							#
#	- subcommand for public key infrastructure stndard											#
# -x509																							#
#	- want to make a self-signed certificate instead of gernating a certificate sining reuest	#
# -nodes																						#
# -days 365																						#
#	- certificate valid for 365 days															#
# -newkey rsa:2048																				#
#	- generate a new certificate and key at the same time										#
#	- make an RSA key that is 2048 bits long													#
# -keyout																						#
#	- tells openssl where to place the generated key file										#
# -out																							#
#	tells openssl where to place the certificate												#
# -config openssl.cnf																			#
#	- tells openssl to use the given config file instead of prompting interactively				#
#-----------------------------------------------------------------------------------------------#
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/selfsigned.key -out /etc/nginx/ssl/selfsigned.crt -config /etc/nginx/ssl/openssl.conf

#-------------------------------------------------------#
# tells Docker to start nginx when container starts		#
# -g -> used to pass settings in the config file		#
# daemon off -> tells nginx to run in the foreground	#
# default												#
# -> nginx starts as a background (daemon) process		#
# -> returns control to shell/parent process			#
# -> if PID 1 exits, Docker assumes container is done	#
#-------------------------------------------------------#
exec nginx -g "daemon off;"