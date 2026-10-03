# Vike Reference

Official documentation links and quick reference for Vike framework with Vue.

## Official Documentation

The complete and up-to-date Vike documentation is available at:
**https://vike.dev**

## Quick Links by Topic

### Getting Started

- **New Project** - https://vike.dev/new
  - Scaffold a new Vike + Vue project
  - Interactive setup wizard

- **Add to Existing Vite App** - https://vike.dev/add
  - Add SSR/SSG to existing Vue + Vite app

### Core Concepts

- **Config Files** - https://vike.dev/config
  - `+config.js` structure
  - Config inheritance
  - Pointer imports

- **pageContext** - https://vike.dev/pageContext
  - Built-in properties
  - Custom properties
  - TypeScript types

- **Routing** - https://vike.dev/routing
  - Filesystem routing
  - Route parameters (`@id`)
  - Route functions
  - Route strings

### Vue Integration (vike-vue)

- **vike-vue Overview** - https://vike.dev/vike-vue
  - Installation
  - Configuration
  - Available hooks and settings

- **useData()** - https://vike.dev/useData
  - Access data in Vue components
  - TypeScript typing

- **usePageContext()** - https://vike.dev/usePageContext
  - Access pageContext in components

- **clientOnly()** - https://vike.dev/clientOnly
  - Client-only component rendering
  - Fallback slots

### Hooks

- **+data()** - https://vike.dev/data
  - Server-side data fetching
  - Return data to components
  - Error handling

- **+guard()** - https://vike.dev/guard
  - Route protection
  - Authentication checks
  - Authorization logic

- **+onBeforeRender()** - https://vike.dev/onBeforeRender
  - Advanced data orchestration
  - Multiple pageContext values

- **Lifecycle Hooks** - https://vike.dev/vike-vue
  - `onCreateApp()`
  - `onBeforeRenderHtml()`
  - `onAfterRenderHtml()`
  - `onBeforeRenderClient()`
  - `onAfterRenderClient()`

### Settings

- **+ssr** - https://vike.dev/ssr
  - Enable/disable SSR per page
  - SPA mode

- **+prerender** - https://vike.dev/prerender
  - Static site generation
  - Build-time rendering
  - Partial pre-rendering

- **+passToClient** - https://vike.dev/passToClient
  - Pass server data to client
  - Serialization

- **+Layout** - https://vike.dev/Layout
  - Layout components
  - Nested layouts
  - Layout groups

### Head Tags & SEO

- **Head Tags Overview** - https://vike.dev/head-tags
  - Managing document head
  - SEO best practices

- **+title** - https://vike.dev/title
  - Page titles
  - Dynamic titles

- **+description** - https://vike.dev/description
  - Meta descriptions

- **+image** - https://vike.dev/image
  - Open Graph images

- **+Head Component** - https://vike.dev/Head
  - Custom head elements
  - Favicons, scripts

### Navigation & Redirects

- **throw redirect()** - https://vike.dev/redirect
  - Server-side redirects
  - Status codes (301, 302)

- **throw render()** - https://vike.dev/render
  - Render error pages
  - Status codes (401, 403, 404, 500)

- **navigate()** - https://vike.dev/navigate
  - Client-side navigation
  - Programmatic routing

### Deployment

- **Static Hosts** - https://vike.dev/static-hosts
  - GitHub Pages
  - Netlify
  - Cloudflare Pages

- **Serverless** - https://vike.dev/serverless
  - Cloudflare Workers
  - Vercel
  - AWS Lambda

- **Full-Stack** - https://vike.dev/full-stack
  - AWS
  - Docker

### Advanced

- **API Reference** - https://vike.dev/api
  - Complete API documentation

- **Error Handling** - https://vike.dev/errors
  - Error pages
  - Error boundaries

- **Internationalization (i18n)** - https://vike.dev/i18n
  - Multi-language setup

- **Environment Variables** - https://vike.dev/env
  - Server vs client env vars

## Common Documentation Lookups

| Need to... | Check Documentation |
|------------|-------------------|
| Create a page | https://vike.dev/Page |
| Fetch data | https://vike.dev/data |
| Add layouts | https://vike.dev/Layout |
| Protect routes | https://vike.dev/guard |
| Set page title | https://vike.dev/title |
| Redirect users | https://vike.dev/redirect |
| Show error page | https://vike.dev/render |
| Use client-only component | https://vike.dev/clientOnly |
| Pre-render pages | https://vike.dev/prerender |
| Pass data to client | https://vike.dev/passToClient |

## TypeScript Types

```typescript
// Import types from vike
import type { PageContext } from 'vike/types'
import type { PageContextServer } from 'vike/types'
import type { PageContextClient } from 'vike/types'

// Extend pageContext types
declare global {
  namespace Vike {
    interface PageContext {
      user?: User
    }
  }
}
```

## Why Use Official Docs

- **Always up-to-date** with latest framework changes
- **Complete information** - all parameters and options
- **Maintained by Vike team** - authoritative source
- **Version-specific** - matches your Vike version

## Additional Resources

- **GitHub Repository**: https://github.com/vikejs/vike
- **vike-vue Repository**: https://github.com/vikejs/vike-vue
- **Examples**: https://github.com/vikejs/vike/tree/main/examples
- **Discord**: Check https://vike.dev for community links
