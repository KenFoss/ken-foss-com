#!/bin/bash

cp -r ../build/* /var/www/kenfoss
cp -r ../build/* /var/www/<IP>

sudo nginx -t
sudo systemctl restart nginx
