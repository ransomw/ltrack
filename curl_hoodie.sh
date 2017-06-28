#! /bin/sh

if [ $# = 0 ]
then
    WWW_PORT=8080
else
    WWW_PORT=$1
fi

curl \
    http://localhost:$WWW_PORT/hoodie/client.js \
    -o app/hoodie_iface/hoodie.js
