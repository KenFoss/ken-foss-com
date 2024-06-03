#!/bin/bash

git clone https://gitlab.com/projects_kfoss/personal-website.git
cd personal-website

git sparse-checkout set personal-website/build personal-website/deploy
git sparse-checkout reapply
