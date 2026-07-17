#!/bin/bash
# logger.sh - Production-grade structured logging utility

# Define and create log directory
LOG_DIR="${BASE_DIR}/logs"
mkdir -p "$LOG_DIR"

# Define distinct log destinations
APP_LOG="${LOG_DIR}/app.log"
ERROR_LOG="${LOG_DIR}/error.log"
AUDIT_LOG="${LOG_DIR}/audit_success.json"

# ANSI Color Codes for human-readable console output
RESET='\033[0m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
BLUE='\033[1;34m'

# Core logging engine
_log_base() {
    local level=$1
    local color=$2
    local message=$3
    
    # Standardize timestamp (ISO 8601)
    local timestamp=$(date +'%Y-%m-%dT%H:%M:%S%z')
    local db=${DB_TYPE:-"unknown"}
    
    # 1. Console Output: Colored and formatted for terminal visibility
    echo -e "${color}${timestamp} [${level}] [DB:${db}] ${message}${RESET}"
    
    # 2. Application Log: Plain text appended to main file
    echo "${timestamp} [${level}] [DB:${db}] ${message}" >> "$APP_LOG"
    
    # 3. Error Log: Critical issues are routed here for separate monitoring tools
    if [ "$level" = "ERROR" ]; then
        echo "${timestamp} [${level}] [DB:${db}] ${message}" >> "$ERROR_LOG"
    fi
}

# Public semantic wrappers
log_info() { _log_base "INFO" "$BLUE" "$1"; }
log_success() { _log_base "SUCCESS" "$GREEN" "$1"; }
log_warn() { _log_base "WARN" "$YELLOW" "$1"; }
log_error() { _log_base "ERROR" "$RED" "$1" >&2; }

# Structured JSON Audit Log (for integration with Datadog, ELK, Splunk, etc.)
# Usage: log_audit "backup" "success" "45" "1048576" "uploaded"
log_audit() {
    local action=$1
    local status=$2
    local duration=$3
    local size=$4
    local remote_status=$5
    
    local timestamp=$(date +'%Y-%m-%dT%H:%M:%S%z')
    local db=${DB_TYPE:-"unknown"}
    
    # Build JSON payload
    local json_payload="{\"timestamp\":\"$timestamp\",\"db_type\":\"$db\",\"action\":\"$action\",\"status\":\"$status\",\"duration_seconds\":$duration,\"size_bytes\":$size,\"remote_status\":\"$remote_status\"}"
    
    # Append structured JSON to audit log
    echo "$json_payload" >> "$AUDIT_LOG"
}
