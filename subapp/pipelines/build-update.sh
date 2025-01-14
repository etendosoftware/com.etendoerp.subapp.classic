#!/bin/bash

template='{"key": "%s", "state": "%s", "name": "%s", "url": "%s", "description": "%s"}'

DATA=$(printf "$template" "$BUILD_ID" "$2" "$JOB_NAME" "$BUILD_URL" "$3")

URI='https://api.bitbucket.org/2.0/repositories'
OWNER='koodu_software'
REPO_SLUG=$1
REVISION=$GIT_COMMIT
URL="$URI/$OWNER/$REPO_SLUG/commit/$REVISION/statuses/build/"

USER=$4
PASSWORD=$5
ACCESS_TOKEN=$6


echo $URL
echo $DATA
curl --request POST \
    --url $URL \
    --header 'Authorization: Bearer $ACCESS_TOKEN' \
    --header 'Content-Type: application/json' \
    --data "$DATA"