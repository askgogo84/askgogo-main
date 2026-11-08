import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

// 8 Nov 2026 (owner-approved brand): one Gogo everywhere. Every page shares the same versioned OG image, every icon
// file is the approved character at its real size, and no page points at the old bearded avatar or retired OG files.
const root = new URL('..', import.meta.url).pathname
const read = p => fs.readFileSync(path.join(root, p), 'utf8')
const html = read('index.html')
const vercel = JSON.parse(read('vercel.json'))
const OG = 'https://askgogo.in/askgogo-gogo-og-20261108.png'

assert.match(html, /og:title" content="AskGogo — Less prompting\. More living\."/)
assert.ok(html.includes(`og:image" content="${OG}"`), 'home page OG image')
assert.ok(html.includes(`twitter:image" content="${OG}"`), 'home page twitter image')
assert.doesNotMatch(html, /og:image" content="https:\/\/app\.askgogo\.in\/askgogo-og\.png/)
// The "Begin again" → #top link that needed URL normalising (Oct) is gone in v20; if it comes back, so must the fix.
if (/href="#top"[^>]*>[^<]*begin again/i.test(html)) assert.match(html, /history\.replaceState\(null,'','\/'\)/, 'legacy #top share URL must normalize to root')

const dashboardRedirect = (vercel.redirects || []).find((r) => r.source === '/dashboard')
assert.ok(dashboardRedirect, 'public /dashboard must redirect to root')
assert.equal(dashboardRedirect.destination, '/')
const premiumRewrite = (vercel.rewrites || []).find((r) => r.source === '/askgogo-whatsapp-premium-20260911c.png')
assert.ok(premiumRewrite, 'old premium OG path still resolves for already-shared links')
assert.equal(premiumRewrite.destination, '/askgogo-gogo-og-20261108.png')

// Every live page: OG/twitter images are the new one; nothing points at retired images.
const walk = d => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap(e => e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : [])
const pages = walk('.')
let withOg = 0
for (const p of pages) {
  const s = read(p)
  for (const m of s.matchAll(/(?:og:image|twitter:image)" content="([^"]+)"/g)) { withOg++; assert.equal(m[1], OG, `${p}: ${m[1]}`) }
  assert.doesNotMatch(s, /og-image(?:-v2)?\.png|askgogo-gogo-character-og-20260911|askgogo-logo\.png/, `${p} references a retired brand image`)
  assert.doesNotMatch(s, /favicon-gogo[^"]*\?v=2|gogo-touch-icon\.png\?v=2/, `${p} still asks for the v2 favicon`)
}
assert.ok(withOg >= 60, `OG tags found: ${withOg}`)

// Icon files: real PNG sizes and an ICO with 16/32/48 frames.
const png = p => { const b = fs.readFileSync(path.join(root, p)); assert.equal(b.toString('hex', 0, 8), '89504e470d0a1a0a', p); return [b.readUInt32BE(16), b.readUInt32BE(20)] }
const sizes = { 'favicon-16x16.png': [16, 16], 'favicon-32x32.png': [32, 32], 'favicon-48x48.png': [48, 48], 'apple-touch-icon.png': [180, 180], 'assets/site/favicon-gogo-32.png': [32, 32], 'assets/site/gogo-touch-icon.png': [180, 180], 'assets/site/gogo-mark-512.png': [512, 512], 'askgogo-gogo-og-20261108.png': [1200, 630] }
for (const [p, wh] of Object.entries(sizes)) assert.deepEqual(png(p), wh, p)
const ico = fs.readFileSync(path.join(root, 'favicon.ico'))
assert.deepEqual(Array.from({ length: ico.readUInt16LE(4) }, (_, i) => ico[6 + i * 16] || 256).sort((a, b) => a - b), [16, 32, 48])
const svg = read('assets/site/favicon-gogo.svg')
for (const c of ['#2C1A13', '#EF7A27', '#F6F1E8']) assert.ok(svg.includes(c), `favicon svg uses ${c}`)
assert.doesNotMatch(svg, /<script|javascript:/i)

console.log(`✅ AskGogo share preview + brand assets passed (${pages.length} pages, ${withOg} image tags)`)
