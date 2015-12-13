# FROM scratch

FROM 32bit/debian:jessie

# RUN apt-get update
# RUN apt-get install -y nodejs

ADD . /ltrack

# ADD node_modules/.bin/hoodie /

# CMD ["nvm", "use", "v0.10.32"]

ENTRYPOINT ["ltrack/hello.sh", "start", "-n", "-c", "6004,6005,6006"]

EXPOSE 6004
