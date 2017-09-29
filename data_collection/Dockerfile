FROM debian:stable

RUN apt-get -y update && apt-get -y install curl

ADD request.sh /root/request.sh
RUN chmod +x /root/request.sh
RUN mkdir /mnt/out

CMD /root/request.sh /mnt/out/
