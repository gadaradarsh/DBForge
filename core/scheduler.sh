#!/bin/bash
# scheduler.sh - Entry point for scheduled tasks (e.g., Cron)

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/logger.sh"

log_info "Scheduler triggered. Initializing backup sequence..."

# The scheduler acts as a wrapper. It can be called by cron or a CI/CD pipeline.
# It simply invokes the main backup orchestrator.
bash "$DIR/backup.sh"

log_info "Scheduler execution sequence complete."
