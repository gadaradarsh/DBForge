#!/bin/bash
# restore.sh - Main Restore & Verification Orchestrator

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/logger.sh"
source "$DIR/config.sh"

# Performance tracking
START_TIME=$(date +%s)

# ---------------------------------------------------------
# Global Error Handler with Automated Rollback
# ---------------------------------------------------------
handle_error() {
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log_error "An error occurred during the restore process on line $1."
    
    if docker ps -q -f name=backupforge_temp_db | grep -q .; then
        log_warn "ROLLBACK: Destroying temporary verification container..."
        docker rm -f backupforge_temp_db >/dev/null
    fi
    
    if [ -n "$RAW_BACKUP_FILE" ] && [ -f "$RAW_BACKUP_FILE" ]; then
        log_warn "ROLLBACK: Removing temporary raw backup file..."
        rm -f "$RAW_BACKUP_FILE"
    fi
    
    # Record structured failure
    log_audit "restore" "failed" "$DURATION" "0" "N/A"
    log_error "Restore workflow aborted safely."
    exit 1
}
trap 'handle_error $LINENO' ERR

log_info "Starting BackupForge Restore & Verification Engine..."

if [ -z "$1" ]; then
    log_error "Usage: $0 <path_to_compressed_backup.gz>"
    exit 1
fi

COMPRESSED_FILE="$1"
if [ ! -f "$COMPRESSED_FILE" ]; then
    log_error "Backup file not found: $COMPRESSED_FILE"
    exit 1
fi

validate_config

PLUGIN_SCRIPT="$BASE_DIR/plugins/$DB_TYPE/plugin.sh"
source "$PLUGIN_SCRIPT"

log_info "Validating plugin requirements..."
if ! declare -F plugin_validate > /dev/null || ! declare -F plugin_restore > /dev/null || ! declare -F plugin_validate_restore > /dev/null; then
    log_error "Plugin '$DB_TYPE' does not implement the required interface."
    exit 1
fi

RAW_BACKUP_FILE="${COMPRESSED_FILE%.gz}"
log_info "Uncompressing $COMPRESSED_FILE to $RAW_BACKUP_FILE..."
gunzip -c "$COMPRESSED_FILE" > "$RAW_BACKUP_FILE"

# ---------------------------------------------------------
# PHASE 1: Verification in Temporary Container
# ---------------------------------------------------------
log_info "PHASE 1: Verifying restore in a temporary, isolated container..."

docker run -d --name backupforge_temp_db \
    -e POSTGRES_USER="$TARGET_DB_USER" \
    -e POSTGRES_PASSWORD="$TARGET_DB_PASSWORD" \
    -e POSTGRES_DB="$TARGET_DB_NAME" \
    postgres:15-alpine >/dev/null

log_info "Waiting for temporary database to initialize..."
sleep 5 

ORIGINAL_HOST="$TARGET_DB_HOST"
TEMP_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' backupforge_temp_db)
export TARGET_DB_HOST="$TEMP_IP"

log_info "Delegating restore execution to plugin (Target: Temporary DB at $TEMP_IP)..."
plugin_restore "$RAW_BACKUP_FILE"

log_info "Delegating validation to plugin..."
plugin_validate_restore

log_info "Validation successful. The backup file is healthy and verified."

log_info "Cleaning up temporary verification container..."
docker rm -f backupforge_temp_db >/dev/null

export TARGET_DB_HOST="$ORIGINAL_HOST"

# ---------------------------------------------------------
# PHASE 2: Actual Production Restore
# ---------------------------------------------------------
log_info "PHASE 2: Committing restore to the actual target database ($TARGET_DB_HOST)..."
plugin_restore "$RAW_BACKUP_FILE"

rm -f "$RAW_BACKUP_FILE"

# Conclude Telemetry
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log_success "Restore Engine finished successfully in ${DURATION}s."
log_audit "restore" "success" "$DURATION" "0" "N/A"
