# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Hexo-based personal blog (fiigii.com) for Fei Peng. The blog uses the Cactus theme with a white colorscheme.

## Branch Structure

- `source` - Contains the Hexo source files (this is the working branch)
- `main` - Deployment branch for GitHub Pages (generated files only)

## Common Commands

```bash
# Install dependencies
npm install

# Local development server
npm run server

# Build static files
npm run build

# Clean generated files
npm run clean

# Deploy to GitHub Pages (builds and pushes to main branch)
npm run deploy
```

**Note:** The default `hexo deploy` uses HTTPS which may fail. After running `npm run deploy`, if push fails, manually push from `.deploy_git`:
```bash
cd .deploy_git && git remote add origin git@github.com:fiigii/fiigii.github.io.git && git push -f origin HEAD:main
```

## Content Structure

- `source/_posts/` - Blog posts in Markdown format
- `source/about/` - About page
- `source/tags/` - Tags page
- `source/search/` - Search page
- `themes/cactus/` - Theme files

## Writing Posts

Posts use `post_asset_folder: true`, meaning each post can have an accompanying folder with the same name for images and assets. Reference assets using relative paths in markdown.

## Configuration

- `_config.yml` - Main Hexo configuration
- `themes/cactus/_config.yml` - Theme-specific configuration
