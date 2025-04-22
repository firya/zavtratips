#!/bin/bash

# This script fixes permissions for the zavtratips application
# Run this script as root or with sudo privileges

APP_DIR="/opt/apps/zavtratips"
SSH_USER=$(whoami)

echo "Setting up permissions for zavtratips in ${APP_DIR}"

# Create directory if it doesn't exist
mkdir -p ${APP_DIR}
cd ${APP_DIR}

# Fix ownership of .env file if it exists
if [ -f .env ]; then
    echo "Setting ownership of .env to ${SSH_USER}"
    chown ${SSH_USER}:${SSH_USER} .env
    chmod 600 .env
else
    echo "Creating empty .env file owned by ${SSH_USER}"
    touch .env
    chown ${SSH_USER}:${SSH_USER} .env
    chmod 600 .env
fi

# Ensure the directory itself is also accessible
chown ${SSH_USER}:${SSH_USER} ${APP_DIR}

echo "Permissions set successfully"
echo "You may need to run 'sudo usermod -aG docker ${SSH_USER}' if using Docker in rootless mode" 