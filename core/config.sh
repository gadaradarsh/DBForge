#!/bin/bash
# config.sh - Configuration loader and validator

# Determine the root directory of the project dynamically
export BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load .env file if it exists (for local development)
if [ -f "$BASE_DIR/config/.env" ]; then
    set -a
    source "$BASE_DIR/config/.env"
    set +a
fi

# Apply Default Configurations
export BACKUP_DIR=${BACKUP_DIR:-"$BASE_DIR/backups"}
export DB_TYPE=${DB_TYPE:-"postgres"}
export TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
export UPLOAD_TO_S3=${UPLOAD_TO_S3:-"false"}
export BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-"7"}

validate_config() {
    log_info "Validating configuration..."
    
    # DB_TYPE is the only globally required variable for the engine to know which plugin to load
    local required_vars=("DB_TYPE")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Missing required environment variable: $var"
            exit 1
        fi
    done
    
    # Validate AWS configuration if S3 upload is enabled
    if [ "$UPLOAD_TO_S3" = "true" ]; then
        local aws_vars=("AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "AWS_DEFAULT_REGION" "S3_BUCKET_NAME")
        for var in "${aws_vars[@]}"; do
            if [ -z "${!var}" ]; then
                log_error "Missing required AWS variable: $var (required when UPLOAD_TO_S3=true)"
                exit 1
            fi
        done
    fi
    
    # Ensure our backup destination exists
    mkdir -p "$BACKUP_DIR"
    log_info "Configuration valid. Backup destination: $BACKUP_DIR"
}
