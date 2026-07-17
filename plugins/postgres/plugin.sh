#!/bin/bash
# plugins/postgres/plugin.sh - PostgreSQL Plugin

export PGPASSWORD="${TARGET_DB_PASSWORD}"

plugin_validate() {
    log_info "[Postgres Plugin] Validating PostgreSQL environment and connectivity..."
    
    if ! command -v pg_dump >/dev/null 2>&1; then
        log_error "[Postgres Plugin] pg_dump utility is not installed."
        return 1
    fi
    if ! command -v psql >/dev/null 2>&1; then
        log_error "[Postgres Plugin] psql utility is not installed."
        return 1
    fi
    
    local req_vars=("TARGET_DB_HOST" "TARGET_DB_USER" "TARGET_DB_PASSWORD" "TARGET_DB_NAME")
    for v in "${req_vars[@]}"; do
        if [ -z "${!v}" ]; then
            log_error "[Postgres Plugin] Missing required variable: $v"
            return 1
        fi
    done

    if ! psql -h "$TARGET_DB_HOST" -U "$TARGET_DB_USER" -d "$TARGET_DB_NAME" -c '\q' >/dev/null 2>&1; then
        log_error "[Postgres Plugin] Failed to connect to PostgreSQL database: $TARGET_DB_NAME at $TARGET_DB_HOST"
        return 1
    fi
    
    log_info "[Postgres Plugin] Validation successful. Database is reachable."
}

plugin_backup() {
    log_info "[Postgres Plugin] Starting PostgreSQL backup..."
    
    RAW_BACKUP_FILE="$BACKUP_DIR/${TARGET_DB_NAME}_backup_${TIMESTAMP}.sql"
    
    # Enforce a strict 2-hour timeout to prevent hung processes
    if with_timeout 2h pg_dump -h "$TARGET_DB_HOST" -U "$TARGET_DB_USER" -d "$TARGET_DB_NAME" -F p -f "$RAW_BACKUP_FILE"; then
        log_info "[Postgres Plugin] pg_dump completed successfully."
    else
        log_error "[Postgres Plugin] pg_dump encountered an error!"
        return 1 
    fi
}

plugin_restore() {
    local file_to_restore=$1
    log_info "[Postgres Plugin] Starting PostgreSQL restore using file: $file_to_restore"
    
    if [ ! -f "$file_to_restore" ]; then
        log_error "[Postgres Plugin] Restore file not found: $file_to_restore"
        return 1
    fi

    # ON_ERROR_STOP=1 ensures psql exits with a non-zero code if any SQL command fails.
    # Without this, psql might skip errors and return 0 (success), leading to silent data corruption.
    if psql -h "$TARGET_DB_HOST" -U "$TARGET_DB_USER" -d "$TARGET_DB_NAME" -v ON_ERROR_STOP=1 -f "$file_to_restore" >/dev/null; then
        log_info "[Postgres Plugin] Database restored successfully."
    else
        log_error "[Postgres Plugin] psql restore encountered an error!"
        return 1
    fi
}

plugin_validate_restore() {
    log_info "[Postgres Plugin] Validating restored data..."
    
    # We run a simple SELECT 1 to verify the database is alive and accepting queries.
    # In a more advanced setup, you could count tables or check specific application tables.
    if psql -h "$TARGET_DB_HOST" -U "$TARGET_DB_USER" -d "$TARGET_DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        log_info "[Postgres Plugin] Restore validation passed."
    else
        log_error "[Postgres Plugin] Restore validation failed! The database cannot be queried."
        return 1
    fi
}
