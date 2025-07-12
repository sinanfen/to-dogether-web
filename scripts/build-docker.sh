#!/bin/bash

# Docker build and push script for To-Dogether PWA

set -e

# Configuration
IMAGE_NAME="to-dogether-web"
REGISTRY="your-registry"  # Change this to your registry
TAG=$(date +%Y%m%d-%H%M%S)

echo "🚀 Building To-Dogether PWA Docker image..."

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG .
docker tag $IMAGE_NAME:$TAG $IMAGE_NAME:latest

echo "✅ Build completed successfully!"
echo "📦 Image: $IMAGE_NAME:$TAG"
echo "📦 Image: $IMAGE_NAME:latest"

# Ask if user wants to push to registry
read -p "Do you want to push to registry? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to registry..."
    
    # Tag for registry
    docker tag $IMAGE_NAME:$TAG $REGISTRY/$IMAGE_NAME:$TAG
    docker tag $IMAGE_NAME:latest $REGISTRY/$IMAGE_NAME:latest
    
    # Push to registry
    docker push $REGISTRY/$IMAGE_NAME:$TAG
    docker push $REGISTRY/$IMAGE_NAME:latest
    
    echo "✅ Push completed successfully!"
    echo "🌐 Registry: $REGISTRY/$IMAGE_NAME:$TAG"
    echo "🌐 Registry: $REGISTRY/$IMAGE_NAME:latest"
else
    echo "📦 Images are ready for local use or manual push"
fi

echo "🎉 Build process completed!" 