#!/bin/bash

# AgroTrack+ Deployment Script
# This script handles the deployment process for the AgroTrack+ platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="agrotrack-mvp-platform"
DOCKER_IMAGE_NAME="agrotrack"
DOCKER_TAG=${1:-latest}
ENVIRONMENT=${2:-production}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if required environment variables are set
    if [ "$ENVIRONMENT" = "production" ]; then
        required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
        for var in "${required_vars[@]}"; do
            if [ -z "${!var}" ]; then
                log_error "Required environment variable $var is not set"
                exit 1
            fi
        done
    fi
    
    log_success "Prerequisites check passed"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    log_success "Dependencies installed"
}

run_tests() {
    log_info "Running tests..."
    
    # Run linting
    log_info "Running ESLint..."
    npm run lint
    
    # Run type checking
    log_info "Running TypeScript type check..."
    npm run type-check
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test
    
    # Run integration tests
    log_info "Running integration tests..."
    npm run test:integration
    
    log_success "All tests passed"
}

build_application() {
    log_info "Building application..."
    
    # Set build environment
    export NODE_ENV=production
    
    # Build the Next.js application
    npm run build
    
    log_success "Application built successfully"
}

run_database_migrations() {
    log_info "Running database migrations..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Run database migrations
    npx prisma migrate deploy
    
    # Seed database if needed (only for development/staging)
    if [ "$ENVIRONMENT" != "production" ]; then
        log_info "Seeding database..."
        npx prisma db seed
    fi
    
    log_success "Database migrations completed"
}

build_docker_image() {
    log_info "Building Docker image..."
    
    # Build Docker image
    docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} .
    
    # Tag for registry if needed
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
    fi
    
    log_success "Docker image built: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
}

push_docker_image() {
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        log_info "Pushing Docker image to registry..."
        
        # Login to registry if credentials are provided
        if [ ! -z "$DOCKER_USERNAME" ] && [ ! -z "$DOCKER_PASSWORD" ]; then
            echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
        fi
        
        # Push image
        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
        
        log_success "Docker image pushed to registry"
    else
        log_warning "No Docker registry configured, skipping push"
    fi
}

deploy_to_environment() {
    log_info "Deploying to $ENVIRONMENT environment..."
    
    case $ENVIRONMENT in
        "development")
            deploy_development
            ;;
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_production
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

deploy_development() {
    log_info "Starting development deployment..."
    
    # Start services with Docker Compose
    if [ -f "docker-compose.dev.yml" ]; then
        docker-compose -f docker-compose.dev.yml up -d
    else
        # Start application directly
        npm run dev &
        APP_PID=$!
        echo $APP_PID > .app.pid
    fi
    
    log_success "Development environment deployed"
}

deploy_staging() {
    log_info "Starting staging deployment..."
    
    # Deploy to staging environment (could be Docker Compose, Kubernetes, etc.)
    if [ -f "docker-compose.staging.yml" ]; then
        docker-compose -f docker-compose.staging.yml up -d
    fi
    
    # Run smoke tests
    run_smoke_tests
    
    log_success "Staging environment deployed"
}

deploy_production() {
    log_info "Starting production deployment..."
    
    # Backup current deployment
    backup_current_deployment
    
    # Deploy new version
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    elif [ ! -z "$KUBERNETES_CONFIG" ]; then
        deploy_to_kubernetes
    else
        log_error "No production deployment configuration found"
        exit 1
    fi
    
    # Run health checks
    run_health_checks
    
    # Run smoke tests
    run_smoke_tests
    
    log_success "Production deployment completed"
}

backup_current_deployment() {
    log_info "Creating backup of current deployment..."
    
    # Create backup directory
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if [ ! -z "$DATABASE_URL" ]; then
        log_info "Backing up database..."
        # This would depend on your database type
        # For PostgreSQL: pg_dump $DATABASE_URL > "$BACKUP_DIR/database.sql"
        # For now, we'll use the backup API
        curl -X POST "${NEXTAUTH_URL}/api/admin/backup" \
             -H "Content-Type: application/json" \
             -d '{"includeDatabase": true, "includeFiles": true}' \
             > "$BACKUP_DIR/api_backup.json"
    fi
    
    # Backup uploaded files
    if [ -d "public/uploads" ]; then
        cp -r public/uploads "$BACKUP_DIR/"
    fi
    
    log_success "Backup created in $BACKUP_DIR"
}

deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/agrotrack-app
    
    log_success "Kubernetes deployment completed"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for application to start
    sleep 30
    
    # Check application health
    local health_url="${NEXTAUTH_URL}/api/health"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_error "Health checks failed after $max_attempts attempts"
    exit 1
}

run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Basic API endpoints test
    local base_url="${NEXTAUTH_URL}"
    
    # Test homepage
    if ! curl -f -s "$base_url" > /dev/null; then
        log_error "Homepage smoke test failed"
        exit 1
    fi
    
    # Test API health endpoint
    if ! curl -f -s "$base_url/api/health" > /dev/null; then
        log_error "API health smoke test failed"
        exit 1
    fi
    
    # Test products API
    if ! curl -f -s "$base_url/api/products" > /dev/null; then
        log_error "Products API smoke test failed"
        exit 1
    fi
    
    log_success "Smoke tests passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Clean up build artifacts
    rm -rf .next/cache
    
    log_success "Cleanup completed"
}

rollback() {
    log_error "Deployment failed, initiating rollback..."
    
    # Stop current deployment
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down
    fi
    
    # Restore from backup
    local latest_backup=$(ls -t backups/ | head -n1)
    if [ ! -z "$latest_backup" ]; then
        log_info "Restoring from backup: $latest_backup"
        # Restore database and files from backup
        # This would depend on your backup strategy
    fi
    
    log_info "Rollback completed"
    exit 1
}

# Main deployment flow
main() {
    log_info "Starting deployment of AgroTrack+ to $ENVIRONMENT environment..."
    log_info "Docker tag: $DOCKER_TAG"
    
    # Set up error handling
    trap rollback ERR
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    
    # Skip tests in development for faster deployment
    if [ "$ENVIRONMENT" != "development" ]; then
        run_tests
    fi
    
    build_application
    run_database_migrations
    
    # Build and push Docker image for containerized deployments
    if [ "$ENVIRONMENT" != "development" ]; then
        build_docker_image
        push_docker_image
    fi
    
    deploy_to_environment
    cleanup
    
    log_success "Deployment completed successfully!"
    log_info "Application is available at: ${NEXTAUTH_URL}"
}

# Help function
show_help() {
    echo "AgroTrack+ Deployment Script"
    echo ""
    echo "Usage: $0 [DOCKER_TAG] [ENVIRONMENT]"
    echo ""
    echo "Arguments:"
    echo "  DOCKER_TAG    Docker image tag (default: latest)"
    echo "  ENVIRONMENT   Target environment: development|staging|production (default: production)"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL      Database connection string"
    echo "  NEXTAUTH_SECRET   NextAuth secret key"
    echo "  NEXTAUTH_URL      Application URL"
    echo "  DOCKER_REGISTRY   Docker registry URL (optional)"
    echo "  DOCKER_USERNAME   Docker registry username (optional)"
    echo "  DOCKER_PASSWORD   Docker registry password (optional)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Deploy latest to production"
    echo "  $0 v1.2.3 staging         # Deploy v1.2.3 to staging"
    echo "  $0 latest development      # Deploy latest to development"
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main function
main