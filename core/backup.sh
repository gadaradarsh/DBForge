#!/bin/bash
# backup.sh - Main Backup Orchestrator

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/logger.sh"
source "$DIR/config.sh"
source "$DIR/utils.sh"

# Performance and telemetry tracking
START_TIME=$(date +%s)
BACKUP_SIZE="0"
UPLOAD_STATUS="skipped"

# ---------------------------------------------------------
# Global Error Handler
# ---------------------------------------------------------
handle_error() {
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log_error "An error occurred during the backup process on line $1"
    
    # ---------------------------------------------------------
    # PRODUCTION READINESS: Aggressive Cleanup on Failure
    # ---------------------------------------------------------
    if [ -n "$RAW_BACKUP_FILE" ] && [ -f "$RAW_BACKUP_FILE" ]; then
        log_warn "[Cleanup] Removing partial raw backup file..."
        rm -f "$RAW_BACKUP_FILE"
    fi
    if [ -n "$COMPRESSED_FILE" ] && [ -f "$COMPRESSED_FILE" ]; then
        log_warn "[Cleanup] Removing partial compressed backup file..."
        rm -f "$COMPRESSED_FILE"
    fi
    
    # Record structured failure
    log_audit "backup" "failed" "$DURATION" "$BACKUP_SIZE" "$UPLOAD_STATUS"
    exit 1
}
trap 'handle_error $LINENO' ERR

log_info "Starting BackupForge Engine..."

# 1. Load and Validate Configuration
validate_config

# 2. Detect and Load Plugin
PLUGIN_SCRIPT="$BASE_DIR/plugins/$DB_TYPE/plugin.sh"
if [ ! -f "$PLUGIN_SCRIPT" ]; then
    log_error "Plugin for DB_TYPE '$DB_TYPE' not found at $PLUGIN_SCRIPT"
    exit 1
fi

log_info "Loading database plugin: $DB_TYPE"
source "$PLUGIN_SCRIPT"

# 3. Enforce Plugin Interface & Execute
log_info "Validating plugin requirements..."
if ! declare -F plugin_validate > /dev/null || ! declare -F plugin_backup > /dev/null || ! declare -F plugin_restore > /dev/null; then
    log_error "Plugin '$DB_TYPE' does not implement the required interface."
    exit 1
fi

plugin_validate

log_info "Delegating backup execution to plugin..."
plugin_backup

# 4. Compress the Backup
if [ -z "$RAW_BACKUP_FILE" ] || [ ! -f "$RAW_BACKUP_FILE" ]; then
    log_error "Plugin failed to produce a valid RAW_BACKUP_FILE."
    exit 1
fi

COMPRESSED_FILE="${RAW_BACKUP_FILE}.gz"
log_info "Compressing backup file to $COMPRESSED_FILE..."
gzip -c "$RAW_BACKUP_FILE" > "$COMPRESSED_FILE"

# Clean up raw file to save space
rm -f "$RAW_BACKUP_FILE"

# Calculate telemetry metrics
BACKUP_SIZE=$(wc -c < "$COMPRESSED_FILE" | tr -d ' ')

# 5. Upload to Remote Storage
if [ "$UPLOAD_TO_S3" = "true" ]; then
    source "$DIR/storage.sh"
    log_info "S3 upload is enabled. Initiating secure transfer..."
    
    storage_upload "$COMPRESSED_FILE"
    UPLOAD_STATUS="uploaded"
    
    storage_enforce_retention
else
    log_info "S3 upload is disabled (UPLOAD_TO_S3!=true). Backup preserved locally: $COMPRESSED_FILE"
fi

# Conclude Telemetry
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log_success "Backup Engine finished successfully in ${DURATION}s."
log_audit "backup" "success" "$DURATION" "$BACKUP_SIZE" "$UPLOAD_STATUS"
