#!/bin/sh
set -e

# Copy nginx configuration if it doesn't exist
if [ ! -f /etc/nginx/conf.d/default.conf ]; then
    cp /nginx.conf /etc/nginx/conf.d/default.conf
fi

# Execute the CMD
exec "$@"