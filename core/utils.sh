#!/bin/bash
# utils.sh - Reliability wrappers for production resiliency

# Retries a command up to N times with a static delay.
# Usage: with_retry <max_attempts> <command...>
# Example: with_retry 3 aws s3 cp ...
with_retry() {
    local max_attempts=$1
    shift
    local attempt=1
    local delay=5

    while [ $attempt -le $max_attempts ]; do
        log_info "[Retry-Wrapper] Attempt $attempt/$max_attempts: $@"
        if "$@"; then
            return 0
        fi
        log_warn "[Retry-Wrapper] Command failed. Retrying in ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
    done

    log_error "[Retry-Wrapper] Command completely failed after $max_attempts attempts."
    return 1
}

# Enforces a strict timeout on an external command to prevent indefinitely hung processes.
# Usage: with_timeout <duration> <command...>
# Example: with_timeout 1h pg_dump ...
with_timeout() {
    local duration=$1
    shift
    log_info "[Timeout-Wrapper] Executing with a strict timeout of $duration: $@"
    
    # The 'timeout' command automatically sends SIGTERM if the duration is exceeded.
    if timeout "$duration" "$@"; then
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            log_error "[Timeout-Wrapper] Command timed out after $duration!"
        else
            log_error "[Timeout-Wrapper] Command failed with exit code $exit_code."
        fi
        return 1
    fi
}
