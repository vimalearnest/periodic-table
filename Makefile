.PHONY: install build dev clean deploy help

# Default target
.DEFAULT_GOAL := help

# Configuration
NODE_BIN := node_modules/.bin
DIST_DIR := dist

help:
	@echo "Available targets:"
	@echo "  make install           - Install dependencies"
	@echo "  make dev               - Start development server"
	@echo "  make build             - Build production bundle"
	@echo "  make preview           - Preview production build locally"
	@echo "  make clean             - Remove build artifacts and dependencies"
	@echo "  make lint              - Run linter"
	@echo "  make format            - Format code"

install:
	@echo "Installing dependencies..."
	npm install

dev:
	@echo "Starting development server..."
	npm run dev

build:
	@echo "Building production bundle..."
	npm run build

preview: build
	@echo "Previewing production build..."
	npm run preview

clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(DIST_DIR)
	rm -rf node_modules

lint:
	@echo "Running linter..."
	npm run lint

format:
	@echo "Formatting code..."
	npm run format
