/**
 * Screenshot the navigation at a given viewport width, optionally with a
 * mega-menu open, and report any horizontal overflow.
 *
 * Drives the system Chrome over the DevTools Protocol — there is no headless
 * browser dependency in this project and adding one for a layout check would
 * not be worth it.
 *
 *   node scripts/shot-menu.mjs <url> <width> <height> <menuLabel|-> <out.png>
 */

import WebSocket from 'ws'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const [url, w, h, menuLabel, out] = process.argv.slice(2)
const width = Number(w)
const height = Number(h)
const PORT = 9222 + (Number(process.env.SHOT_OFFSET) || 0)

const chrome = spawn('google-chrome', [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--no-sandbox',
  '--disable-gpu',
  '--hide-scrollbars=false',
  `--window-size=${width},${height}`,
  'about:blank',
], { stdio: 'ignore' })

let id = 0
const pending = new Map()

function send(ws, method, params = {}, sessionId) {
  const msgId = ++id
  ws.send(JSON.stringify({ id: msgId, method, params, sessionId }))
  return new Promise((res, rej) => pending.set(msgId, { res, rej }))
}

async function main() {
  // Wait for the debugger to come up.
  let target
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      target = (await r.json()).webSocketDebuggerUrl
      break
    } catch { await sleep(200) }
  }
  if (!target) throw new Error('Chrome did not start')

  const ws = new WebSocket(target)
  await new Promise((res) => ws.on('open', res))
  ws.on('message', (raw) => {
    const m = JSON.parse(raw)
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id)
      pending.delete(m.id)
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)
    }
  })

  const { targetId } = await send(ws, 'Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send(ws, 'Target.attachToTarget', { targetId, flatten: true })
  const S = (method, params) => send(ws, method, params, sessionId)

  await S('Page.enable')
  await S('Runtime.enable')
  await S('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 768,
  })
  await S('Page.navigate', { url })
  await sleep(3500)

  if (menuLabel && menuLabel !== '-') {
    // "mobile:Buy" opens the hamburger first, waits for React to render the
    // panel, then expands that accordion section.
    const mobile = menuLabel.startsWith('mobile:')
    const label = mobile ? menuLabel.slice(7) : menuLabel

    if (mobile) {
      await S('Runtime.evaluate', {
        expression: `document.querySelector('button[aria-label="Open menu"]')?.click()`,
      })
      await sleep(500)
    }

    if (label) {
      const expr = `
        (() => {
          const nav = document.querySelector('nav');
          const btns = [...(nav || document).querySelectorAll('button')];
          const b = btns.find(x => x.textContent.trim().startsWith(${JSON.stringify(label)})
            && (${mobile} ? !x.hasAttribute('aria-haspopup') : x.getAttribute('aria-haspopup') === 'true'));
          if (!b) return 'trigger not found';
          b.click();
          return 'clicked';
        })()
      `
      const r = await S('Runtime.evaluate', { expression: expr, returnByValue: true })
      if (r.result.value !== 'clicked') console.log('  WARN:', r.result.value)
      await sleep(600)
    }
  }

  // Overflow check.
  const overflow = await S('Runtime.evaluate', {
    expression: `JSON.stringify({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      innerW: window.innerWidth,
      panel: (() => {
        const p = document.querySelector('[aria-expanded="true"]')?.parentElement?.querySelector('div[id]');
        if (!p) return null;
        const r = p.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
      })()
    })`,
    returnByValue: true,
  })
  console.log('  ' + overflow.result.value)

  const shot = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(out, Buffer.from(shot.data, 'base64'))

  ws.close()
  chrome.kill()
}

main().catch((e) => { console.error(e.message); chrome.kill(); process.exit(1) })
