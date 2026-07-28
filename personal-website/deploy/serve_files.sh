#!/bin/bash

cp -r ../dist/* /var/www/kenfoss
cp -r ../dist/* /var/www/<IP>

sudo nginx -t
sudo systemctl restart nginx
