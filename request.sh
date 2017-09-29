#!/bin/bash

while :
do
    ts=`date +%s`
    curl -X GET -H "authorization: Basic cGl4ZWxzY2FtcEBjaXNjby5jb206cGl4ZWxzY2FtcDIwMTc=" https://53cdgr.cmxcisco.com/api/presence/v1/clients\?siteId\=1505913182364 > "$ts.json"
    sleep 10
done
