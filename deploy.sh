#!/bin/bash

set -e  # Exit immediately if a command fails
set -o pipefail

echo "🚀 Starting deployment..."

PROJECT_DIR="/srv/admin-panel-frontend"
BUILD_DIR="$PROJECT_DIR/dist"
DEPLOY_DIR="/var/www/html/clinictopics/dist"

cd $PROJECT_DIR

echo "📥 Pulling latest code from production..."
git pull origin production

echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building project..."
npm run build

echo "🔄 Syncing build to deployment directory..."
sudo rsync -av --delete "$BUILD_DIR/" "$DEPLOY_DIR/"

echo "✅ Deployment completed successfully!"
