#!/bin/bash

while true; do
    python App.py
    echo "Waiting for 30 minutes until next restart..."
    sleep 1800
done
