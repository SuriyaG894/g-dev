// Renders public/og.jpg (the 1200×630 link-preview image) from the real title screen.
// Start the game first (npm run dev, or npm run build && npm run preview), then:
//   node scripts/make-og.mjs http://localhost:5173
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:5173'
const browser = await chromium.launch({ channel: process.env.BROWSER ?? 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(url)
// Let the title letters ink themselves in.
await page.waitForTimeout(3500)
await page.addStyleTag({
  content: `
    .menu, .title-foot, #notes { display: none !important; }
    .title-screen { justify-content: center; }
    .tagline::after { content: 'A puzzle adventure inside an unfinished storybook. Free in your browser.'; display: block; margin-top: 14px; font-size: 20px; opacity: .7; }
  `,
})
await page.waitForTimeout(600)
await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 82 })
await browser.close()
console.log('wrote public/og.jpg')
