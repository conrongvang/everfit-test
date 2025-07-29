#!/bin/bash

# View logs by date using pm2-logrotate format
DATE=${1:-$(date +%Y-%m-%d)}
LOG_TYPE=${2:-combined}

echo "Viewing $LOG_TYPE logs for $DATE..."

# Find log files for the specific date
find "logs/$LOG_TYPE/" -name "*$DATE*" -type f | while read file; do
    echo "=== $file ==="
    cat "$file"
    echo ""
done

# Also show current log
echo "=== Current log (logs/$LOG_TYPE/$LOG_TYPE.log) ==="
tail -50 "logs/$LOG_TYPE/$LOG_TYPE.log" 