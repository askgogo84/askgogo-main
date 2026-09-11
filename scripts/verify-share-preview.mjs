import fs from 'node:fs'
import assert from 'node:assert/strict'

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

assert.match(html, /og:title" content="Meet Gogo — Your personal AI agent"/)
assert.match(html, /og:image" content="https:\/\/askgogo\.in\/askgogo-whatsapp-premium-20260911c\.png"/)
assert.doesNotMatch(html, /og:image" content="https:\/\/app\.askgogo\.in\/askgogo-og\.png/)
assert.match(html, /history\.replaceState\(null,'','\/'\)/, 'legacy dashboard/#top share URL must normalize to root')

const dashboardRedirect = (vercel.redirects || []).find((r) => r.source === '/dashboard')
assert.ok(dashboardRedirect, 'public /dashboard must redirect to root')
assert.equal(dashboardRedirect.destination, '/')

const premiumRewrite = (vercel.rewrites || []).find((r) => r.source === '/askgogo-whatsapp-premium-20260911c.png')
assert.ok(premiumRewrite, 'cache-busted premium OG path must exist')
assert.equal(premiumRewrite.destination, '/og-image-v2.png')

console.log('✅ AskGogo WhatsApp share-preview regression passed')
