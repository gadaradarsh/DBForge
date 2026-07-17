#!/bin/bash
# storage.sh - S3 Upload, Download, and Retention Logic

storage_upload() {
    local file_path=$1
    local file_name=$(basename "$file_path")
    
    log_info "[Storage] Uploading $file_name to s3://${S3_BUCKET_NAME}/backups/..."
    
    # Upload to S3 using AWS CLI wrapped in our retry logic to handle transient network drops
    # 's3 cp': Copies a local file to an S3 URI.
    # '--no-progress': Suppresses the progress bar to avoid massive log spam in CI/CD pipelines.
    if with_retry 3 aws s3 cp "$file_path" "s3://${S3_BUCKET_NAME}/backups/${file_name}" --no-progress; then
        log_info "[Storage] AWS S3 upload successful."
    else
        log_error "[Storage] AWS S3 upload failed!"
        return 1
    fi
}

storage_download() {
    local s3_uri=$1
    local dest_path=$2
    
    log_info "[Storage] Downloading $s3_uri to $dest_path..."
    
    if aws s3 cp "$s3_uri" "$dest_path" --no-progress; then
        log_info "[Storage] AWS S3 download successful."
    else
        log_error "[Storage] AWS S3 download failed!"
        return 1
    fi
}

storage_enforce_retention() {
    if [ -z "$BACKUP_RETENTION_DAYS" ] || [ "$BACKUP_RETENTION_DAYS" -eq 0 ]; then
        log_info "[Storage] No retention policy defined (or set to 0). Skipping cleanup."
        return 0
    fi
    
    log_info "[Storage] Enforcing $BACKUP_RETENTION_DAYS day retention policy via S3 Lifecycle Rules..."
    
    # Create a JSON payload for the lifecycle rule
    local lifecycle_config="/tmp/lifecycle.json"
    cat <<EOF > "$lifecycle_config"
{
    "Rules": [
        {
            "ID": "BackupForgeRetentionRule",
            "Filter": {
                "Prefix": "backups/"
            },
            "Status": "Enabled",
            "Expiration": {
                "Days": $BACKUP_RETENTION_DAYS
            }
        }
    ]
}
EOF

    # 's3api put-bucket-lifecycle-configuration': Automates deletion on the AWS server side.
    if aws s3api put-bucket-lifecycle-configuration --bucket "$S3_BUCKET_NAME" --lifecycle-configuration file://"$lifecycle_config"; then
        log_info "[Storage] S3 Lifecycle policy applied successfully."
    else
        log_error "[Storage] Failed to apply S3 Lifecycle policy."
        return 1
    fi
}
