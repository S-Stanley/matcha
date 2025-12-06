#!/bin/bash

source .env

psql -d $DATABASE_URL -f ./database/init.sql
