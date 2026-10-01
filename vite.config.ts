import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * The site's public address, for link previews and the sitemap. Vercel provides it to every build
 * (VERCEL_PROJECT_PRODUCTION_URL); SITE_URL overrides it, e.g. for a custom domain.
 */
const host = process.env.SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? ''
const site = host ? (host.startsWith('http') ? host : `https://${host}`).replace(/\/$/, '') : ''

/** Link-preview tags need absolute URLs; without a known address they fall back to relative ones. */
function sharing(): Plugin {
  return {
    name: 'the-last-page:sharing',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE%', site)
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ''}` })
      if (site) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc></url></urlset>\n`,
        })
      }
    },
  }
}

/**
 * A service worker that keeps the whole book on the device after the first visit, so it can be
 * played offline and installed as an app. Its cache is named after the build, so every deploy
 * replaces the last one instead of piling up beside it.
 */
function offline(): Plugin {
  return {
    name: 'the-last-page:offline',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter((f) => /\.(js|css|woff2|png|svg|webmanifest)$/.test(f) && !f.endsWith('.map'))
      // Files copied from public/ aren't part of the bundle, so the ones the page needs are listed here.
      const shell = ['/', '/favicon.svg', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', ...files.map((f) => `/${f}`)]
      const version = createHash('sha256').update(shell.join('\n')).digest('hex').slice(0, 12)
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `// Generated at build time by vite.config.ts.
const CACHE = 'the-last-page-${version}'
const SHELL = ${JSON.stringify(shell)}

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('the-last-page-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/_vercel/')) return
  if (req.mode === 'navigate') {
    // The page itself: the newest from the network, or the book on the shelf when offline.
    e.respondWith(fetch(req).catch(() => caches.match('/', { ignoreVary: true })))
    return
  }
  // Everything else is fingerprinted and never changes: the cache first.
  e.respondWith(
    // ignoreVary: the shell was cached without an Origin header, but module scripts ask with one.
    caches.match(req, { ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
`,
      })
    },
  }
}

export default defineConfig({
  plugins: [sharing(), offline()],
  define: {
    __VERSION__: JSON.stringify((JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version.replace(/\.0$/, '')),
    // Analytics only run on builds made by Vercel, so the same build can go to other portals.
    __ON_VERCEL__: JSON.stringify(process.env.VERCEL === '1'),
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
