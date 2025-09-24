#!/bin/sh

# 절대경로를 설정
HERE=$(dirname $(realpath $0))
script_dir=$(dirname $0)
CONTAINER_NAME='ms365-hmsapi-t1'

docker run --rm -itd -p 8080:3000 --name ${CONTAINER_NAME} -v ${HERE}:/ms365 -e TZ=Asia/Seoul -w /ms365  node:20.16.0 npm run dev

#docker exec -it ms365-hmsapi node main.js prd t1
#docker exec -it ms365-hmsapi /bin/bash >> node main.js
