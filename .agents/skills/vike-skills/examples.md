# Vike + Vue Examples

Practical patterns and code examples for building Vike applications with Vue.

## Official Examples

The complete and up-to-date examples are available in:
- **Vike Examples**: https://github.com/vikejs/vike/tree/main/examples
- **vike-vue Examples**: https://github.com/vikejs/vike-vue/tree/main/examples

## Pattern 1: Basic Page with Data Fetching

The most common pattern - a page that fetches and displays data.

### File Structure

```
pages/
  movies/
    +Page.vue
    +data.ts
```

### Data Hook

```typescript
// /pages/movies/+data.ts
export type Data = Awaited<ReturnType<typeof data>>

export async function data() {
  const response = await fetch('https://api.example.com/movies')
  const movies = await response.json()
  return { movies }
}
```

### Page Component

```vue
<!-- /pages/movies/+Page.vue -->
<script setup lang="ts">
import { useData } from 'vike-vue/useData'
import type { Data } from './+data'

const { movies } = useData<Data>()
</script>

<template>
  <h1>Movies</h1>
  <ul>
    <li v-for="movie in movies" :key="movie.id">
      {{ movie.title }}
    </li>
  </ul>
</template>
```

## Pattern 2: Parameterized Routes

Pages with dynamic URL segments like `/movie/123`.

### File Structure

```
pages/
  movie/
    @id/
      +Page.vue
      +data.ts
```

### Data Hook with Route Params

```typescript
// /pages/movie/@id/+data.ts
import { render } from 'vike/abort'
import type { PageContextServer } from 'vike/types'

export type Data = Awaited<ReturnType<typeof data>>

export async function data(pageContext: PageContextServer) {
  const { id } = pageContext.routeParams

  const movie = await fetchMovie(id)

  if (!movie) {
    throw render(404, `Movie ${id} not found`)
  }

  return { movie }
}
```

### Page Component

```vue
<!-- /pages/movie/@id/+Page.vue -->
<script setup lang="ts">
import { useData } from 'vike-vue/useData'
import type { Data } from './+data'

const { movie } = useData<Data>()
</script>

<template>
  <article>
    <h1>{{ movie.title }}</h1>
    <p>{{ movie.description }}</p>
    <span>Released: {{ movie.year }}</span>
  </article>
</template>
```

## Pattern 3: Layouts

### Global Layout

```vue
<!-- /pages/+Layout.vue -->
<script setup>
import Navigation from '../components/Navigation.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="app">
    <Navigation />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
</style>
```

### Nested Layouts (Grouped Pages)

```
pages/
  +Layout.vue                    # Global layout
  (marketing)/
    +Layout.vue                  # Marketing layout (nested)
    about/+Page.vue
    pricing/+Page.vue
  (app)/
    +Layout.vue                  # App layout (nested)
    +guard.ts                    # Protect all app pages
    dashboard/+Page.vue
    settings/+Page.vue
```

```vue
<!-- /pages/(marketing)/+Layout.vue -->
<template>
  <div class="marketing">
    <MarketingHeader />
    <slot />
    <MarketingFooter />
  </div>
</template>
```

```vue
<!-- /pages/(app)/+Layout.vue -->
<script setup>
import Sidebar from '../../components/Sidebar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <div class="content">
      <slot />
    </div>
  </div>
</template>
```

## Pattern 4: Route Guards (Authentication)

### Basic Auth Guard

```typescript
// /pages/(app)/+guard.ts
import { redirect } from 'vike/abort'
import type { PageContext } from 'vike/types'

export function guard(pageContext: PageContext) {
  if (!pageContext.user) {
    throw redirect('/login')
  }
}
```

### Role-Based Guard

```typescript
// /pages/admin/+guard.ts
import { redirect, render } from 'vike/abort'
import type { PageContext } from 'vike/types'

export function guard(pageContext: PageContext) {
  const { user } = pageContext

  if (!user) {
    throw redirect('/login')
  }

  if (!user.isAdmin) {
    throw render(403, 'Admin access required')
  }
}
```

### Async Guard (API Check)

```typescript
// /pages/subscription/+guard.ts
import { redirect } from 'vike/abort'
import type { PageContext } from 'vike/types'

export async function guard(pageContext: PageContext) {
  const { user } = pageContext

  if (!user) {
    throw redirect('/login')
  }

  const subscription = await checkSubscription(user.id)

  if (!subscription.active) {
    throw redirect('/pricing')
  }
}
```

## Pattern 5: Head Tags & SEO

### Static Title and Description

```typescript
// /pages/about/+config.ts
export default {
  title: 'About Us - MyApp',
  description: 'Learn more about our company and mission.'
}
```

### Dynamic Title from Data

```typescript
// /pages/movie/@id/+title.ts
import type { PageContext } from 'vike/types'
import type { Data } from './+data'

export function title(pageContext: PageContext<Data>) {
  return `${pageContext.data.movie.title} - MyApp`
}
```

### Custom Head Component

```vue
<!-- /pages/+Head.vue -->
<template>
  <link rel="icon" href="/favicon.ico" />
  <meta name="theme-color" content="#4a90d9" />
</template>
```

### Page-Specific Head

```vue
<!-- /pages/movie/@id/+Head.vue -->
<script setup lang="ts">
import { useData } from 'vike-vue/useData'
import type { Data } from './+data'

const { movie } = useData<Data>()
</script>

<template>
  <meta property="og:title" :content="movie.title" />
  <meta property="og:image" :content="movie.poster" />
  <meta property="og:type" content="video.movie" />
</template>
```

## Pattern 6: Client-Only Components

For components that use browser APIs or don't support SSR.

### Basic Usage

```vue
<!-- /pages/dashboard/+Page.vue -->
<script setup>
import clientOnly from 'vike-vue/clientOnly'

// Load component only on client
const Chart = clientOnly(() => import('../../components/Chart.vue'))
const Map = clientOnly(() => import('../../components/Map.vue'))
</script>

<template>
  <h1>Dashboard</h1>

  <Chart :data="chartData">
    <template #fallback>
      <div class="skeleton">Loading chart...</div>
    </template>
  </Chart>

  <Map :location="location">
    <template #fallback>
      <div class="skeleton">Loading map...</div>
    </template>
  </Map>
</template>
```

### Non-Default Export

```typescript
// For libraries where component isn't default export
const SomeComponent = clientOnly(async () =>
  (await import('some-library')).SomeComponent
)
```

## Pattern 7: Error Handling

### In Data Hook

```typescript
// /pages/movie/@id/+data.ts
import { render, redirect } from 'vike/abort'

export async function data(pageContext) {
  const { id } = pageContext.routeParams

  try {
    const movie = await fetchMovie(id)

    if (!movie) {
      throw render(404, `Movie ${id} not found`)
    }

    return { movie }
  } catch (error) {
    if (error.status === 401) {
      throw redirect('/login')
    }
    throw render(500, 'Failed to load movie')
  }
}
```

### Error Page

```vue
<!-- /pages/_error/+Page.vue -->
<script setup lang="ts">
import { usePageContext } from 'vike-vue/usePageContext'

const pageContext = usePageContext()
const { abortStatusCode, abortReason } = pageContext
</script>

<template>
  <div class="error-page">
    <h1>{{ abortStatusCode }}</h1>
    <p>{{ abortReason || 'Something went wrong' }}</p>
    <a href="/">Go home</a>
  </div>
</template>
```

## Pattern 8: Configuration

### Global Config with vike-vue

```typescript
// /pages/+config.ts
import vikeVue from 'vike-vue/config'

export default {
  extends: [vikeVue],

  // Pass user to client
  passToClient: ['user'],

  // Default meta
  title: 'MyApp',
  description: 'A great application'
}
```

### Disable SSR for Specific Pages

```typescript
// /pages/admin/+config.ts
export default {
  ssr: false  // SPA mode for admin section
}
```

### Pre-render Static Pages

```typescript
// /pages/about/+config.ts
export default {
  prerender: true
}
```

## Pattern 9: TypeScript Setup

### Extend PageContext

```typescript
// /types/vike.d.ts
declare global {
  namespace Vike {
    interface PageContext {
      user?: {
        id: string
        name: string
        email: string
        isAdmin: boolean
      }
    }
  }
}

export {}
```

### Typed Data Hook

```typescript
// /pages/movies/+data.ts
import type { PageContextServer } from 'vike/types'

export type Data = Awaited<ReturnType<typeof data>>

export async function data(pageContext: PageContextServer) {
  // pageContext is fully typed
  const movies = await fetchMovies()
  return { movies }
}
```

### Typed Page Component

```vue
<script setup lang="ts">
import { useData } from 'vike-vue/useData'
import { usePageContext } from 'vike-vue/usePageContext'
import type { Data } from './+data'

// Typed data access
const data = useData<Data>()

// Typed pageContext access
const pageContext = usePageContext()
const user = pageContext.user // typed from global declaration
</script>
```

## Pattern 10: Navigation

### Link Component

```vue
<template>
  <!-- Regular links work with client-side routing -->
  <a href="/about">About</a>
  <a :href="`/movie/${movie.id}`">{{ movie.title }}</a>
</template>
```

### Programmatic Navigation

```vue
<script setup>
import { navigate } from 'vike/client/router'

async function handleSubmit() {
  await saveData()
  navigate('/success')
}

function goBack() {
  navigate(-1) // Browser back
}
</script>
```

### Navigate with Data

```typescript
import { navigate } from 'vike/client/router'

// Pass data during navigation
navigate('/checkout', {
  pageContext: {
    cartItems: items
  }
})
```

## Quick Reference: File Types

| File | Purpose | Example |
|------|---------|---------|
| `+Page.vue` | Page component | Display content |
| `+Layout.vue` | Layout wrapper | Navigation, footer |
| `+data.ts` | Data fetching | API calls, DB queries |
| `+guard.ts` | Route protection | Auth checks |
| `+config.ts` | Configuration | SSR, prerender settings |
| `+title.ts` | Dynamic title | SEO |
| `+Head.vue` | Custom head tags | Meta, favicons |

## Learning Path

1. **Start simple** - Create pages with `+Page.vue`
2. **Add data** - Use `+data.ts` and `useData()`
3. **Structure** - Add layouts with `+Layout.vue`
4. **Protect** - Add guards with `+guard.ts`
5. **Optimize** - Configure SSR/prerender per page
6. **Polish** - Add head tags for SEO

## Tips

- **Use TypeScript** - Export `Data` type from `+data.ts` for type-safe `useData<Data>()`
- **Keep data minimal** - Only return what the page needs
- **Layouts are cumulative** - They nest, don't override
- **Guards must throw** - Use `throw redirect()` or `throw render()`
- **Use clientOnly()** - For browser-only components like charts and maps
