// Renders the PNG app icons from public/favicon.svg, using a local Edge or Chrome.
// Run: node scripts/make-icons.mjs
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const svg = readFileSync('public/favicon.svg', 'utf8')
const icon = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
mkdirSync('public/icons', { recursive: true })

// [file, size, maskable]: a maskable icon bleeds to the edges, with the artwork in the safe middle.
const targets = [
  ['public/icons/icon-192.png', 192, false],
  ['public/icons/icon-512.png', 512, false],
  ['public/icons/maskable-512.png', 512, true],
  ['public/icons/apple-touch-icon.png', 180, true],
]

const browser = await chromium.launch({ channel: process.env.BROWSER ?? 'msedge', headless: true })
for (const [file, size, maskable] of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const pad = maskable ? Math.round(size * 0.14) : 0
  await page.setContent(
    `<body style="margin:0;background:${maskable ? '#f1e6cf' : 'transparent'}">
      <img src="${icon}" style="display:block;width:${size - pad * 2}px;height:${size - pad * 2}px;margin:${pad}px">
    </body>`,
  )
  await page.screenshot({ path: file, omitBackground: !maskable })
  await page.close()
  console.log('wrote', file)
}
await browser.close()
