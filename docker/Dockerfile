# Use a lightweight Alpine Linux base image to keep the image size minimal
FROM alpine:3.19

# ---------------------------------------------------------
# SECURITY BEST PRACTICE: Non-Root User
# ---------------------------------------------------------
# We create a dedicated non-root user and group.
# [!] NOTE: We are leaving the USER directive commented out intentionally. 
# This specific project mounts the host's Docker socket (/var/run/docker.sock) 
# for Restore Verification. A non-root user inside the container cannot talk to 
# the root-owned socket by default. 
# If you don't need Restore Verification, uncomment the USER directive below.
RUN addgroup -S backupforge && adduser -S backupforge -G backupforge

# ---------------------------------------------------------
# OPTIMIZATION: Dependency Installation & Cleanup
# ---------------------------------------------------------
# Install dependencies and optimize image size by clearing apk cache in the same layer
RUN apk add --no-cache bash postgresql15-client aws-cli docker-cli && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# USER backupforge

CMD ["tail", "-f", "/dev/null"]
