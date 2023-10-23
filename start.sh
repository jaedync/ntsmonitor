#!/bin/bash

while true; do
    timeout 1800 python App.py
    echo "Restarting script after 30 minutes..."
done
