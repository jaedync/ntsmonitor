#!/bin/bash

echo "Begin Gunicorn restart loop (workaround because Jaedyn has no time to troubleshoot the verkada api)..."

while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting Gunicorn..."
    gunicorn -b 0.0.0.0:5000 app:app &
    GUNICORN_PID=$!
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Gunicorn started with PID $GUNICORN_PID. Running for 30 minutes..."
    sleep 1800
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Time's up! Gracefully stopping Gunicorn (PID $GUNICORN_PID)..."
    kill -TERM $GUNICORN_PID
    wait $GUNICORN_PID

    echo "$(date '+%Y-%m-%d %H:%M:%S') - Gunicorn stopped. Checking for orphaned worker processes..."

    # Check and kill any remaining worker processes
    for pid in $(ps -o pid= --ppid $GUNICORN_PID); do
        echo "Found orphaned worker process $pid. Terminating..."
        kill -TERM $pid
    done

    echo "$(date '+%Y-%m-%d %H:%M:%S') - Gunicorn closed completely."
done
