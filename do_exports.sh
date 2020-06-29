#!/bin/zsh
export DATABASE_URL=$(heroku config:get DATABASE_URL)
export SECRET=$(heroku config:get SECRET)
