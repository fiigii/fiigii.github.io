# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an Astro-based personal blog (fiigii.com) for Fei Peng, using the [astro-paper](https://github.com/satnaing/astro-paper) theme.

## Branch Structure

- `main` - Contains the Astro source files and triggers GitHub Actions deployment

## Common Commands

```bash
# Install dependencies
pnpm install

# Local development server
pnpm dev

# Build static files
pnpm build

# Preview built site
pnpm preview

# Type check
pnpm astro check

# Format code
pnpm format
```

## Content Structure

- `src/data/blog/` - Blog posts in Markdown format
- `src/pages/about.md` - About page
- `src/config.ts` - Site metadata (title, author, description)
- `src/constants.ts` - Social links configuration
- `public/blog-images/` - Post images (referenced via absolute paths like `/blog-images/...`)
- `public/favicon.png` - Site favicon
- `public/gpu_logo.png` - Site logo used on about page

## Writing Posts

Blog posts go in `src/data/blog/` as Markdown files with YAML frontmatter:

```yaml
---
author: Fei Peng
pubDatetime: 2024-01-01T00:00:00Z
title: "Post Title"
slug: "post-slug"
featured: false
draft: false
tags:
  - tag1
  - tag2
description: "Post description"
---
```

Post images go in `public/blog-images/<post-slug>/` and are referenced as `/blog-images/<post-slug>/image.png`.

## URL Structure

Posts are served at `/posts/<slug>/`. Legacy Hexo URLs (`/YYYY/MM/DD/<slug>/`) are 301 redirected to the new paths via `astro.config.ts`.

## Deployment

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`). Pushing to `main` triggers a build and deploy to GitHub Pages.

## Configuration

- `astro.config.ts` - Astro configuration (redirects, markdown settings)
- `src/config.ts` - Site metadata
- `src/constants.ts` - Social links
