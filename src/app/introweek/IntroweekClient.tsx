'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Lock, Check, Users, Coffee, Zap, Sparkles, Send, ChevronDown } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'
import HboIctVormtaal from '@/components/HboIctVormtaal'

// ── Program data (two intro weeks) ───────────────────────────────────────────
// Structural fields only (number, color, brand title, locked state). All
// translatable copy (slug, desc, tags, scr) lives in the introweekClient
// namespace, keyed by week + num. See src/messages/{nl,en}/introweekClient.json.

type DayCard = {
  num: string
  color: string
  title: string
  weekKey: 'week1' | 'week2'
  locked?: boolean
  blocks?: string
}

const WEEK1: DayCard[] = [
  { num: '01', color: 'var(--gold)', title: 'Power On', weekKey: 'week1' },
  { num: '02', color: 'var(--blue)', title: 'Campus Hunt', weekKey: 'week1' },
  { num: '03', color: 'var(--green)', title: 'First Borrel', weekKey: 'week1' },
  { num: '04', color: 'var(--purple)', title: 'Connect', weekKey: 'week1' },
  { num: '05', color: 'var(--cyan)', title: '???', weekKey: 'week1', locked: true, blocks: '████ ███ ██████ ████' },
]

const WEEK2: DayCard[] = [
  { num: '01', color: 'var(--blue)', title: 'Build Mode', weekKey: 'week2' },
  { num: '02', color: 'var(--purple)', title: 'Player 2', weekKey: 'week2' },
  { num: '03', color: 'var(--green)', title: 'Stad In', weekKey: 'week2' },
  { num: '04', color: 'var(--red)', title: 'Launch', weekKey: 'week2' },
  { num: '05', color: 'var(--cyan)', title: '???', weekKey: 'week2', locked: true, blocks: '██ ████ ███████ ████' },
]

const KIT = [
  { idx: '01', color: 'var(--gold)', Icon: Users },
  { idx: '02', color: 'var(--green)', Icon: Coffee },
  { idx: '03', color: 'var(--blue)', Icon: Zap },
  { idx: '04', color: 'var(--purple)', Icon: Sparkles },
]

// ── Day card ──────────────────────────────────────────────────────────────────

type DayT = ReturnType<typeof useTranslations>

function Day({ d, t }: { d: DayCard; t: DayT }) {
  const base = `${d.weekKey}.${d.num}`
  const slug = t(`${base}.slug`)
  if (d.locked) {
    return (
      <article className="day tilt soon locked-card reveal" style={{ '--c': d.color } as CSSProperties} tabIndex={0} role="button" aria-expanded={false}>
        <div className="tilt-inner">
          <span className="day-corner tl" /><span className="day-corner br" />
          <div className="day-top"><span className="day-num">{d.num}</span><span className="day-soon"><span className="sd" />{t('day.secret')}</span></div>
          <div className="day-body locked-body">
            <h3 className="day-title">??? <span className="lockico"><Lock size={16} /></span></h3>
            <p className="day-slug mono">// <span className="c">{slug}</span></p>
            <div className="scrambled mono" data-scr={t(`${base}.scr`)}>{d.blocks}</div>
          </div>
          <div className="day-foot"><span className="more c-muted">{t('day.locked')}</span><span className="compiling">{t('day.decrypting')}</span></div>
        </div>
      </article>
    )
  }
  const tags = t.raw(`${base}.tags`) as string[]
  return (
    <article className="day tilt soon reveal" style={{ '--c': d.color } as CSSProperties} tabIndex={0} role="button" aria-expanded={false}>
      <div className="tilt-inner">
        <span className="day-corner tl" /><span className="day-corner br" />
        <div className="day-top"><span className="day-num">{d.num}</span><span className="day-soon"><span className="sd" />{t('day.soon')}</span></div>
        <div className="day-body">
          <h3 className="day-title">{d.title}</h3>
          <p className="day-slug mono">// <span className="c">{slug}</span></p>
          <div className="day-meta locked">
            <span><Lock size={13} />{t('day.dateMeta')}</span>
            <span><Lock size={13} />{t('day.timeMeta')}</span>
          </div>
        </div>
        <div className="day-extra">
          <p>{t(`${base}.desc`)}</p>
          <div className="day-tags">{tags.map((tag) => <span key={tag} className="tg">{tag}</span>)}</div>
        </div>
        <div className="day-foot"><span className="more">{t('day.vibe')} <span className="chev"><ChevronDown size={12} /></span></span><span className="compiling">{t('day.compiling')}</span></div>
      </div>
    </article>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function IntroweekClient() {
  const t = useTranslations('introweekClient')
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bootLogRef = useRef<HTMLDivElement>(null)
  const bootStartRef = useRef<HTMLButtonElement>(null)
  const bootRef = useRef<HTMLDivElement>(null)
  const [week, setWeek] = useState<'w1' | 'w2'>('w1')

  // ── BOOT SEQUENCE ──────────────────────────────────────────────────────────
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ov = bootRef.current
    const log = bootLogRef.current
    if (!ov || !log) return
    const skip = sessionStorage.getItem('sit_intro_booted')
    const lines: [string, string][] = [
      ['booting', t('boot.lines.booting')],
      ['mount', t('boot.lines.mount')],
      ['load', t('boot.lines.load')],
      ['net', t('boot.lines.net')],
      ['auth', t('boot.lines.auth')],
      ['ready', t('boot.lines.ready')],
    ]
    let removed = false
    const timers: ReturnType<typeof setTimeout>[] = []
    function finish() {
      ov!.classList.add('done')
      sessionStorage.setItem('sit_intro_booted', '1')
      document.body.style.overflow = ''
      timers.push(setTimeout(() => { if (!removed) { ov!.style.display = 'none' } }, 900))
    }
    if (skip || reduce) {
      ov.classList.add('done')
      document.body.style.overflow = ''
      ov.style.display = 'none'
      return
    }
    document.body.style.overflow = 'hidden'
    let i = 0
    function next() {
      if (i >= lines.length) {
        const btn = bootStartRef.current
        if (btn) {
          btn.classList.add('show')
          btn.addEventListener('click', () => { document.body.style.overflow = ''; finish() }, { once: true })
        }
        timers.push(setTimeout(() => { document.body.style.overflow = ''; finish() }, 2600))
        return
      }
      const [tag, txt] = lines[i++]
      const row = document.createElement('div')
      row.className = 'boot-row'
      row.innerHTML = '<span class="bt">[' + tag + ']</span> <span class="bx"></span><span class="ok">OK</span>'
      log!.appendChild(row)
      const bx = row.querySelector('.bx') as HTMLElement
      let c = 0
      function type() {
        bx.textContent = txt.slice(0, c)
        if (c++ < txt.length) timers.push(setTimeout(type, 11))
        else { (row.querySelector('.ok') as HTMLElement).classList.add('on'); timers.push(setTimeout(next, 230)) }
      }
      type()
    }
    next()
    return () => { removed = true; timers.forEach(clearTimeout); document.body.style.overflow = '' }
  }, [t])

  // ── SCRAMBLE hero word ───────────────────────────────────────────────────────
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = rootRef.current?.querySelector('#scrambleWeek') as HTMLElement | null
    if (!el) return
    const final = el.dataset.text || el.textContent || 'WEEK'
    let raf = 0
    let to: ReturnType<typeof setTimeout>
    function scramble() {
      if (reduce) { el!.textContent = final; return }
      const chars = '!<>-_\\/[]{}=+*^?#01'
      const start = performance.now()
      const dur = 1100
      function tick(now: number) {
        const p = Math.min(1, (now - start) / dur)
        let out = ''
        for (let i = 0; i < final.length; i++) {
          if (final[i] === ' ') { out += ' '; continue }
          const reveal = p * final.length
          out += i < reveal ? final[i] : chars[(Math.random() * chars.length) | 0]
        }
        el!.textContent = out
        if (p < 1) raf = requestAnimationFrame(tick)
        else el!.textContent = final
      }
      raf = requestAnimationFrame(tick)
    }
    to = setTimeout(scramble, reduce ? 0 : 650)
    return () => { clearTimeout(to); cancelAnimationFrame(raf) }
  }, [])

  // ── LIVE COUNTDOWN ───────────────────────────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const target = new Date(SITE_CONFIG.introweek.startIso).getTime()
    const cells = {
      d: root.querySelector('[data-cd="d"]') as HTMLElement,
      h: root.querySelector('[data-cd="h"]') as HTMLElement,
      m: root.querySelector('[data-cd="m"]') as HTMLElement,
      s: root.querySelector('[data-cd="s"]') as HTMLElement,
    }
    const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0')
    function tick() {
      const diff = target - Date.now()
      if (diff <= 0) {
        if (cells.d) cells.d.textContent = '00'
        const live = root!.querySelector('#cdLive') as HTMLElement
        if (live) live.textContent = t('hero.countdownLive')
        return
      }
      const s = Math.floor(diff / 1000)
      if (cells.d) cells.d.textContent = String(Math.floor(s / 86400))
      if (cells.h) cells.h.textContent = pad(Math.floor((s % 86400) / 3600))
      if (cells.m) cells.m.textContent = pad(Math.floor((s % 3600) / 60))
      if (cells.s) cells.s.textContent = pad(s % 60)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [t])

  // ── 3D TILT + day expand + decrypt-on-hover ──────────────────────────────────
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = matchMedia('(pointer: coarse)').matches
    const cleanups: (() => void)[] = []

    if (!reduce && !coarse) {
      root.querySelectorAll<HTMLElement>('.tilt').forEach((card) => {
        const inner = (card.querySelector('.tilt-inner') as HTMLElement) || card
        let raf = 0
        const move = (e: MouseEvent) => {
          const r = card.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          cancelAnimationFrame(raf)
          raf = requestAnimationFrame(() => {
            inner.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(22px)`
            card.style.setProperty('--mx', px * 100 + 50 + '%')
            card.style.setProperty('--my', py * 100 + 50 + '%')
          })
        }
        const leave = () => { cancelAnimationFrame(raf); inner.style.transform = '' }
        card.addEventListener('mousemove', move)
        card.addEventListener('mouseleave', leave)
        cleanups.push(() => { card.removeEventListener('mousemove', move); card.removeEventListener('mouseleave', leave); cancelAnimationFrame(raf) })
      })
    }

    root.querySelectorAll<HTMLElement>('.day').forEach((dEl) => {
      const click = () => dEl.classList.toggle('open')
      const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dEl.classList.toggle('open') } }
      dEl.addEventListener('click', click)
      dEl.addEventListener('keydown', key)
      cleanups.push(() => { dEl.removeEventListener('click', click); dEl.removeEventListener('keydown', key) })
    })

    root.querySelectorAll<HTMLElement>('.scrambled').forEach((el) => {
      const card = el.closest('.day')
      const real = el.dataset.scr || ''
      const blocks = el.textContent || ''
      const chars = '!<>-_\\/[]{}=+*01█▓▒'
      let timer: ReturnType<typeof setInterval>
      function decrypt() {
        if (reduce) { el.textContent = real; return }
        let f = 0
        clearInterval(timer)
        timer = setInterval(() => {
          f++
          let out = ''
          for (let i = 0; i < real.length; i++) {
            if (real[i] === ' ') { out += ' '; continue }
            out += i < f / 2 ? real[i] : chars[(Math.random() * chars.length) | 0]
          }
          el.textContent = out
          if (f / 2 >= real.length) { clearInterval(timer); el.textContent = real }
        }, 28)
      }
      function reset() { clearInterval(timer); el.textContent = blocks }
      if (card) {
        card.addEventListener('mouseenter', decrypt)
        card.addEventListener('mouseleave', reset)
        card.addEventListener('focus', decrypt)
        card.addEventListener('blur', reset)
        cleanups.push(() => {
          clearInterval(timer)
          card.removeEventListener('mouseenter', decrypt)
          card.removeEventListener('mouseleave', reset)
          card.removeEventListener('focus', decrypt)
          card.removeEventListener('blur', reset)
        })
      }
    })

    return () => cleanups.forEach((fn) => fn())
  }, [week])

  // ── HYPERSPACE CANVAS (3D circuit) ────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    const C = { gold: '#F29E18', blue: '#3B82F6', green: '#22C55E', red: '#EF4444', cyan: '#06B6D4', purple: '#8B5CF6' }
    const BAG = [C.gold, C.gold, C.gold, C.gold, C.blue, C.blue, C.blue, C.cyan, C.cyan, C.green, C.purple, C.red]
    const pick = (a: string[]) => a[(Math.random() * a.length) | 0]
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)

    let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, focal = 700
    const NEAR = 26, FAR = 1150
    type Trace = {
      pts: { x: number; y: number }[]
      poly: { seg: { a: { x: number; y: number }; b: { x: number; y: number }; d: number; acc: number }[]; len: number }
      z: number; speed: number; color: string; rgb: string; width: number
      pulse: number; pulseSpeed: number; hasPulse: boolean; vias: boolean
    }
    type Speck = { x: number; y: number; z: number; color: string; rgb: string; r: number }
    let traces: Trace[] = [], specks: Speck[] = [], raf = 0
    let camX = 0, camY = 0, tgtX = 0, tgtY = 0, roll = 0, tgtRoll = 0

    function rgbOf(hex: string) {
      let h = hex.replace('#', '')
      if (h.length === 3) h = h.split('').map((c) => c + c).join('')
      const n = parseInt(h, 16)
      return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255)
    }
    function measure(pts: { x: number; y: number }[]) {
      let len = 0
      const seg = []
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
        seg.push({ a: pts[i - 1], b: pts[i], d, acc: len }); len += d
      }
      return { seg, len }
    }
    function along(poly: Trace['poly'], t: number) {
      const d = t * poly.len
      for (const s of poly.seg) {
        if (d <= s.acc + s.d) {
          const k = s.d ? (d - s.acc) / s.d : 0
          return { x: s.a.x + (s.b.x - s.a.x) * k, y: s.a.y + (s.b.y - s.a.y) * k }
        }
      }
      const l = poly.seg[poly.seg.length - 1]
      return l ? { x: l.b.x, y: l.b.y } : { x: 0, y: 0 }
    }
    function makeTrace(z?: number): Trace {
      const zz = z == null ? rnd(NEAR, FAR) : z
      const sc = focal / zz
      const sx = rnd(-0.14, 1.14) * W
      const sy = rnd(-0.14, 1.14) * H
      let x = (sx - cx) / sc
      let y = (sy - cy) / sc
      const pts = [{ x, y }]
      const segs = 2 + ((Math.random() * 3) | 0)
      let horiz = Math.random() < 0.5
      const step = () => rnd(40, 190)
      for (let i = 0; i < segs; i++) {
        if (horiz) x += (Math.random() < 0.5 ? -1 : 1) * step()
        else y += (Math.random() < 0.5 ? -1 : 1) * step()
        pts.push({ x, y })
        horiz = !horiz
      }
      const color = pick(BAG)
      return {
        pts, poly: measure(pts), z: zz,
        speed: rnd(150, 360), color, rgb: rgbOf(color), width: rnd(1, 2.4),
        pulse: Math.random(), pulseSpeed: rnd(0.25, 0.7), hasPulse: Math.random() < 0.72, vias: Math.random() < 0.85,
      }
    }
    function makeSpeck(z?: number): Speck {
      const zz = z == null ? rnd(NEAR, FAR) : z
      const s = focal / zz
      const color = pick(BAG)
      return { x: (rnd(-0.14, 1.14) * W - cx) / s, y: (rnd(-0.14, 1.14) * H - cy) / s, z: zz, color, rgb: rgbOf(color), r: rnd(0.6, 1.8) }
    }
    function project(p: { x: number; y: number }, z: number) {
      const s = focal / z
      let dx = p.x - camX, dy = p.y - camY
      if (roll) {
        const cr = Math.cos(roll), sr = Math.sin(roll)
        const rx = dx * cr - dy * sr, ry = dx * sr + dy * cr
        dx = rx; dy = ry
      }
      return { x: cx + dx * s, y: cy + dy * s, s }
    }
    function build() {
      const count = Math.round((W * H) / 15000) + 40
      traces = []
      for (let i = 0; i < count; i++) traces.push(makeTrace())
      specks = []
      const sc = Math.round((W * H) / 12000) + 40
      for (let i = 0; i < sc; i++) specks.push(makeSpeck())
    }
    const buf = new Float32Array(64)
    function drawTrace(tr: Trace) {
      const z = tr.z
      const depth = 1 - (z - NEAR) / (FAR - NEAR)
      const sproj = focal / z
      const a = Math.min(1, depth * 1.6) * (z < NEAR * 2.4 ? (z - NEAR) / (NEAR * 1.4) : 1)
      if (a <= 0.01) return
      const rgb = tr.rgb
      const pts = tr.pts
      ctx!.beginPath()
      let pr = project(pts[0], z)
      ctx!.moveTo(pr.x, pr.y)
      buf[0] = pr.x; buf[1] = pr.y
      for (let i = 1; i < pts.length; i++) {
        pr = project(pts[i], z)
        ctx!.lineTo(pr.x, pr.y)
        buf[i * 2] = pr.x; buf[i * 2 + 1] = pr.y
      }
      ctx!.lineJoin = 'round'; ctx!.lineCap = 'round'
      ctx!.globalCompositeOperation = 'lighter'
      ctx!.strokeStyle = 'rgba(' + rgb + ',' + 0.14 * a + ')'
      ctx!.lineWidth = Math.max(1.4, tr.width * sproj * 3.4)
      ctx!.stroke()
      ctx!.strokeStyle = 'rgba(' + rgb + ',' + 0.8 * a + ')'
      ctx!.lineWidth = Math.max(0.6, tr.width * sproj)
      ctx!.stroke()
      ctx!.globalCompositeOperation = 'source-over'
      if (tr.vias && depth > 0.22) {
        const r = Math.max(0.8, 2.2 * sproj)
        for (let i = 0; i < pts.length; i++) {
          const vx = buf[i * 2], vy = buf[i * 2 + 1]
          ctx!.beginPath(); ctx!.arc(vx, vy, r, 0, 7)
          ctx!.fillStyle = 'rgba(9,9,11,' + 0.85 * a + ')'; ctx!.fill()
          ctx!.lineWidth = 1; ctx!.strokeStyle = 'rgba(' + rgb + ',' + 0.7 * a + ')'; ctx!.stroke()
        }
      }
      if (tr.hasPulse && depth > 0.12) {
        const pp = project(along(tr.poly, tr.pulse), z)
        const prad = Math.max(1.4, 3.2 * sproj)
        ctx!.globalCompositeOperation = 'lighter'
        ctx!.fillStyle = 'rgba(' + rgb + ',' + 0.5 * a + ')'
        ctx!.beginPath(); ctx!.arc(pp.x, pp.y, prad * 2.1, 0, 7); ctx!.fill()
        ctx!.fillStyle = 'rgba(' + rgb + ',' + 0.9 * a + ')'
        ctx!.beginPath(); ctx!.arc(pp.x, pp.y, prad, 0, 7); ctx!.fill()
        ctx!.fillStyle = 'rgba(255,255,255,' + 0.95 * a + ')'
        ctx!.beginPath(); ctx!.arc(pp.x, pp.y, prad * 0.5, 0, 7); ctx!.fill()
        ctx!.globalCompositeOperation = 'source-over'
      }
    }
    function drawSpeck(sp: Speck) {
      const z = sp.z
      const depth = 1 - (z - NEAR) / (FAR - NEAR)
      const a = Math.min(1, depth * 1.5)
      if (a <= 0.02) return
      const p = project(sp, z)
      const r = Math.max(0.4, sp.r * (focal / z))
      ctx!.beginPath(); ctx!.arc(p.x, p.y, r, 0, 7)
      ctx!.fillStyle = 'rgba(' + sp.rgb + ',' + 0.5 * a + ')'
      ctx!.fill()
    }
    let last = 0, frameN = 0
    function frame(time: number) {
      const dt = Math.min((time - (last || time)) / 1000, 0.05)
      last = time
      camX += (tgtX - camX) * 0.045
      camY += (tgtY - camY) * 0.045
      roll += (tgtRoll - roll) * 0.04
      ctx!.clearRect(0, 0, W, H)
      for (const s of specks) {
        s.z -= (s.r * 40 + 120) * dt
        if (s.z < NEAR) Object.assign(s, makeSpeck(FAR))
        drawSpeck(s)
      }
      if ((frameN = frameN + 1) % 8 === 0) traces.sort((a, b) => b.z - a.z)
      for (const tr of traces) {
        tr.z -= tr.speed * dt
        tr.pulse += tr.pulseSpeed * dt
        if (tr.pulse > 1) tr.pulse -= 1
        if (tr.z < NEAR) Object.assign(tr, makeTrace(FAR))
        drawTrace(tr)
      }
      raf = requestAnimationFrame(frame)
    }
    function paintStatic() {
      ctx!.clearRect(0, 0, W, H)
      for (const s of specks) drawSpeck(s)
      traces.sort((a, b) => b.z - a.z)
      for (const tr of traces) drawTrace(tr)
    }
    function resize() {
      const host = canvas!.parentElement || canvas!
      const r = host.getBoundingClientRect()
      W = Math.max(r.width || window.innerWidth, 1)
      H = Math.max(r.height || window.innerHeight, 1)
      DPR = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas!.width = W * DPR; canvas!.height = H * DPR
      canvas!.style.width = W + 'px'; canvas!.style.height = H + 'px'
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
      cx = W / 2; cy = H * 0.46
      focal = Math.max(W, H) * 0.62
      build()
      paintStatic()
    }
    function steer(clientX: number, clientY: number) {
      const nx = clientX / window.innerWidth - 0.5
      const ny = clientY / window.innerHeight - 0.5
      tgtX = nx * Math.max(W, H) * 0.5
      tgtY = ny * Math.max(W, H) * 0.32
      tgtRoll = -nx * 0.06
    }
    const onMove = (e: MouseEvent) => steer(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => { if (e.touches[0]) steer(e.touches[0].clientX, e.touches[0].clientY) }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    let rt: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce) paintStatic() }, 160) }
    window.addEventListener('resize', onResize)

    function start() {
      resize()
      if (reduce) { paintStatic(); return }
      cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return
      if (e.isIntersecting) { if (!raf) { last = 0; raf = requestAnimationFrame(frame) } }
      else { cancelAnimationFrame(raf); raf = 0 }
    }, { threshold: 0 })
    io.observe(canvas)
    start()

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(rt)
      io.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="iw" ref={rootRef}>
      <style>{CSS}</style>

      {/* BOOT OVERLAY */}
      <div id="boot" ref={bootRef} aria-hidden="true">
        <div className="boot-box">
          <div className="boot-head">
            <span className="tdots"><span style={{ background: 'var(--red)' }} /><span style={{ background: 'var(--gold)' }} /><span style={{ background: 'var(--green)' }} /></span>
            <span className="boot-logo"><span className="c-gold">{'{'}</span>SIT<span className="c-gold">{'}'}</span></span>
            <span>· {t('boot.head')}</span>
          </div>
          <div id="bootLog" ref={bootLogRef} />
          <button id="bootStart" ref={bootStartRef}>{t('boot.start')}</button>
        </div>
      </div>

      {/* HYPERSPACE LAYER */}
      <div className="hyper-layer" aria-hidden="true">
        <canvas id="hyperspace" ref={canvasRef} />
        <div className="hyper-core" />
        <div className="hyper-veil" />
      </div>

      {/* HERO */}
      <header className="ihero" id="top">
        <div className="wrap">
          <div className="ih-eyebrow"><span className="pdot" /> {t('hero.eyebrow')}</div>
          <div className="ih-cobrand reveal"><span className="ih-cobrand-dot" aria-hidden="true" /><span className="mono">{t('hero.cobrand')}</span></div>
          <p className="ih-kicker reveal in"><span className="c-muted">$</span> ~/hva/hbo-ict <span className="c-muted">&gt;</span> ./start --new-student</p>
          <h1 className="ih-title">
            <span className="brace">{'{'}</span>
            <span className="ih-stack">
              <span className="t-intro">INTRO</span>
              <span className="t-week"><span className="week" id="scrambleWeek" data-text="WEEK">WEEK</span><span className="ih-year">&apos;26</span></span>
            </span>
            <span className="brace">{'}'}</span>
          </h1>
          <p className="ih-sub">{t('hero.subPre')}<b>{t('hero.subBold')}</b>{t('hero.subPost')}</p>

          <div className="countdown" id="countdown">
            <div className="cd-label">{t('hero.countdownLabel')}<b id="cdLive">{t('hero.countdownTarget')}</b></div>
            <div className="cd-grid">
              <div className="cd-cell"><span className="cd-num" data-cd="d">00</span><span className="cd-unit">{t('hero.unitDays')}</span></div>
              <span className="cd-colon">:</span>
              <div className="cd-cell"><span className="cd-num" data-cd="h">00</span><span className="cd-unit">{t('hero.unitHours')}</span></div>
              <span className="cd-colon">:</span>
              <div className="cd-cell"><span className="cd-num" data-cd="m">00</span><span className="cd-unit">{t('hero.unitMinutes')}</span></div>
              <span className="cd-colon">:</span>
              <div className="cd-cell"><span className="cd-num" data-cd="s">00</span><span className="cd-unit">{t('hero.unitSeconds')}</span></div>
            </div>
          </div>

          <div className="ih-ctas">
            <a href="#program" className="btn btn-primary">
              <span className="bkt">[</span>{t('hero.ctaPlan')}<span className="bkt">]</span>
            </a>
            <a href="#join" className="btn btn-ghost">{t('hero.ctaJoin')} <span className="arrow">&gt;</span></a>
          </div>

          <div className="ih-meta">
            <span><b>{t('hero.metaFreeBold')}</b>{t('hero.metaFree')}</span><span className="dot">×</span>
            <span>{t('hero.metaNoExp')}</span><span className="dot">×</span>
            <span>{t('hero.metaEveryone')}</span>
          </div>

          <div className="ih-scroll"><span>{t('hero.scroll')}</span><span className="v" /><span className="arr"><ChevronDown size={14} /></span></div>
        </div>
      </header>

      {/* SHEET */}
      <div className="sheet">
        {/* PROGRAM */}
        <section className="sec" id="program">
          <div className="wrap">
            <div className="seclabel reveal">
              <div className="seclabel-top"><span className="seclabel-num">01</span><span className="seclabel-rule" /></div>
              <h2 className="seclabel-title">{t('program.label')}</h2>
            </div>
            <p className="sec-intro reveal">{t('program.introPre')}<b>{t('program.introBold1')}</b>{t('program.introMid')}<b>{t('program.introBold2')}</b>{t('program.introPost')}</p>

            <div className="weekseg reveal">
              <button className={week === 'w1' ? 'active' : ''} onClick={() => setWeek('w1')}><span className="ws-dot" />{t('program.week1Btn')}<b>01</b></button>
              <button className={week === 'w2' ? 'active' : ''} onClick={() => setWeek('w2')}><span className="ws-dot" />{t('program.week2Btn')}<b>02</b></button>
              <span className="ws-tag mono">{t('program.schemaTag')}</span>
            </div>

            <div className={`week-panel${week === 'w1' ? ' show' : ''}`} id="w1">
              <div className="days">{WEEK1.map((d) => <Day key={'w1' + d.num} d={d} t={t} />)}</div>
            </div>
            <div className={`week-panel${week === 'w2' ? ' show' : ''}`} id="w2">
              <div className="days">{WEEK2.map((d) => <Day key={'w2' + d.num} d={d} t={t} />)}</div>
            </div>

            <p className="prog-note reveal">{t('program.notePre')}<a href="#join">{t('program.noteLink')}</a>{t('program.notePost')}</p>
          </div>
        </section>

        {/* SURVIVAL KIT */}
        <section className="sec" id="kit">
          <div className="wrap">
            <div className="seclabel reveal">
              <div className="seclabel-top"><span className="seclabel-num">02</span><span className="seclabel-rule" /></div>
              <h2 className="seclabel-title">{t('kitSection.label')}</h2>
            </div>
            <p className="sec-intro reveal">{t('kitSection.introPre')}<b>{t('kitSection.introBold')}</b>{t('kitSection.introPost')}</p>
            <div className="kit-grid">
              {KIT.map((k) => {
                const Icon = k.Icon
                return (
                  <div key={k.idx} className="kit reveal" style={{ '--c': k.color } as CSSProperties}>
                    <span className="idx">{k.idx}</span>
                    <div className="kit-ic"><Icon size={20} /></div>
                    <h4>{t(`kit.${k.idx}.title`)}</h4>
                    <p>{t(`kit.${k.idx}.body`, { commissies: SITE_CONFIG.stats.commissies })}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FINALE / JOIN */}
        <section className="finale" id="join">
          <div className="ghost">JOIN</div>
          <div className="wrap">
            <div className="finale-grid">
              <div>
                <div className="seclabel reveal">
                  <div className="seclabel-top"><span className="seclabel-num">03</span><span className="seclabel-rule" /></div>
                  <h2 className="seclabel-title">{t('finale.label')}</h2>
                </div>
                <h2 className="reveal">{t('finale.headLine1')}<br />{t('finale.headLine2')}<br /><span className="c-gold">{t('finale.headGold')}</span>.</h2>
                <p className="finale-body reveal">{t('finale.bodyPre')}<b>{t('finale.bodyBold')}</b>{t('finale.bodyPost', { price: SITE_CONFIG.membership.price, events: SITE_CONFIG.stats.events, students: SITE_CONFIG.stats.students })}</p>
                <ul className="finale-list reveal">
                  <li><span className="ck"><Check size={15} /></span> {t('finale.list1')}</li>
                  <li><span className="ck"><Check size={15} /></span> {t('finale.list2')}</li>
                  <li><span className="ck"><Check size={15} /></span> {t('finale.list3')}</li>
                  <li><span className="ck"><Check size={15} /></span> {t('finale.list4')}</li>
                </ul>
              </div>

              {/* BOARDING PASS TICKET */}
              <div className="reveal">
                <div className="ticket">
                  <span className="tk-notch l" /><span className="tk-notch r" />
                  <div className="tk-top">
                    <span className="lg"><span className="c-gold">{'{'}</span>SIT<span className="c-gold">{'}'}</span> · {t('finale.ticketBoarding')}</span>
                    <span className="cls">{t('finale.ticketClass')}</span>
                  </div>
                  <div className="tk-body">
                    <div className="tk-route">
                      <div className="tk-pt"><div className="big">{t('finale.ticketYou')}</div><div className="sm">{t('finale.ticketYouSub')}</div></div>
                      <div className="tk-path"><span className="pl"><Send size={18} /></span></div>
                      <div className="tk-pt r"><div className="big">{t('finale.ticketSit')}</div><div className="sm">{t('finale.ticketSitSub')}</div></div>
                    </div>
                    <div className="tk-grid">
                      <div><div className="k">{t('finale.ticketGate')}</div><div className="v c-gold">31 AUG</div></div>
                      <div><div className="k">{t('finale.ticketSeat')}</div><div className="v">{t('finale.ticketSeatVal')}</div></div>
                      <div><div className="k">{t('finale.ticketPrice')}</div><div className="v c-green">{SITE_CONFIG.membership.price}{t('finale.ticketPriceUnit')}</div></div>
                    </div>
                    <div className="tk-barcode" />
                    <a href="/lid-worden" className="tk-cta">{t('finale.ticketCta')}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* CO-BRAND SIGN-OFF */}
            <div className="iw-signoff reveal">
              <div className="iw-signoff-vorm" aria-hidden="true"><HboIctVormtaal variant="bands" count={6} opacity={0.55} /></div>
              <div className="iw-signoff-row">
                <Image src="/hbo-ict-wit.png" alt="HBO-ICT Hogeschool van Amsterdam" width={188} height={32} className="iw-signoff-logo" priority={false} />
                <span className="iw-signoff-line mono"><span className="c-gold">{'//'}</span> {t('finale.signoff')}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// ── Scoped styles (ported from the design, prefixed under .iw) ────────────────

const CSS = `
.iw {
  --bg: #09090B;
  --surface: #111113;
  --surface-2: #18181B;
  --border: #1f1f23;
  --border-strong: #27272A;
  --text: #FAFAFA;
  --muted: #A1A1AA;
  --muted-2: #71717A;
  --faint: #52525B;
  --gold: #F29E18;
  --blue: #3B82F6;
  --green: #22C55E;
  --red: #EF4444;
  --purple: #8B5CF6;
  --cyan: #06B6D4;
  --font-display: var(--font-big-shoulders), 'Big Shoulders Display', sans-serif;
  --font-mono-iw: var(--font-mono), 'JetBrains Mono', monospace;
  position: relative;
  background: var(--bg);
  color: var(--text);
}
.iw .mono { font-family: var(--font-mono-iw); }
.iw .c-gold { color: var(--gold); }
.iw .c-muted { color: var(--muted-2); }
.iw a { color: inherit; text-decoration: none; }

/* ── BOOT OVERLAY ── */
.iw #boot {
  position: fixed; inset: 0; z-index: 9000;
  background: radial-gradient(120% 120% at 50% 30%, #0c0c10, #050507 70%);
  display: flex; align-items: center; justify-content: center;
  transition: opacity .7s ease, filter .7s ease;
}
.iw #boot.done { opacity: 0; filter: blur(6px); pointer-events: none; }
.iw #boot::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .5;
  background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px);
  animation: iwScan 7s linear infinite;
}
@keyframes iwScan { to { background-position: 0 600px; } }
.iw .boot-box { width: min(560px, 88vw); font-family: var(--font-mono-iw); position: relative; z-index: 1; }
.iw .boot-head { display: flex; align-items: center; gap: .7rem; margin-bottom: 1.3rem; color: var(--muted-2); font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; }
.iw .boot-head .tdots span { width: .6rem; height: .6rem; border-radius: 50%; display: inline-block; }
.iw .boot-logo { font-weight: 700; font-size: 1.05rem; letter-spacing: -.02em; color: var(--text); }
.iw .boot-logo .c-gold { color: var(--gold); }
.iw #bootLog { display: flex; flex-direction: column; gap: .5rem; min-height: 190px; font-size: .82rem; }
.iw .boot-row { color: var(--muted); display: flex; align-items: baseline; gap: .55rem; animation: iwFeedin .3s ease; }
.iw .boot-row .bt { color: var(--gold); }
.iw .boot-row .bx { color: var(--text); flex: 1; }
.iw .boot-row .ok { color: var(--faint); opacity: 0; font-size: .68rem; letter-spacing: .15em; }
.iw .boot-row .ok.on { opacity: 1; color: var(--green); }
@keyframes iwFeedin { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
.iw #bootStart {
  margin-top: 1.6rem; width: 100%; padding: 1rem; font-family: var(--font-mono-iw); font-weight: 700;
  letter-spacing: .25em; text-transform: uppercase; font-size: .82rem;
  background: var(--gold); color: var(--bg); opacity: 0; transform: translateY(10px); border: 0;
  transition: opacity .5s, transform .5s, box-shadow .3s; cursor: pointer;
}
.iw #bootStart.show { opacity: 1; transform: none; }
.iw #bootStart:hover { box-shadow: 0 0 40px -6px rgba(242,158,24,.6); }

/* ── HYPERSPACE LAYER ── */
.iw .hyper-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.iw #hyperspace { position: absolute; inset: 0; display: block; }
.iw .hyper-veil {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(78% 72% at 50% 46%, rgba(9,9,11,0) 62%, rgba(9,9,11,.28) 100%),
    linear-gradient(to bottom, rgba(9,9,11,.32), rgba(9,9,11,0) 22% 70%, rgba(9,9,11,.93));
}
.iw .hyper-core {
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  width: clamp(260px, 36vw, 560px); aspect-ratio: 1; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(242,158,24,.14) 0%, rgba(242,158,24,.05) 36%, rgba(9,9,11,0) 68%);
  animation: iwCorePulse 4.2s ease-in-out infinite;
}
@keyframes iwCorePulse { 0%,100% { opacity: .8; transform: translate(-50%,-50%) scale(.96); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.06); } }

/* ── HERO ── */
.iw .wrap { width: min(1180px, 92vw); margin: 0 auto; }
.iw .ihero { position: relative; min-height: 100vh; min-height: 100svh; display: flex; align-items: center; padding: 7rem 0 4rem; overflow: hidden; z-index: 2; }
.iw .ihero .wrap { position: relative; z-index: 2; text-align: center; }
.iw .ih-eyebrow {
  display: inline-flex; align-items: center; gap: .7rem; font-family: var(--font-mono-iw);
  font-size: .72rem; letter-spacing: .22em; text-transform: uppercase; color: var(--muted);
  border: 1px solid var(--border-strong); padding: .45rem 1rem; border-radius: 99px;
  background: rgba(17,17,19,.6); backdrop-filter: blur(6px); margin-bottom: 1.6rem;
}
.iw .ih-eyebrow .pdot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 0 rgba(34,197,94,.6); animation: iwPing 1.7s ease-out infinite; }
@keyframes iwPing { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.5);} 70%{box-shadow:0 0 0 9px rgba(34,197,94,0);} 100%{box-shadow:0 0 0 0 rgba(34,197,94,0);} }
.iw .ih-kicker { font-family: var(--font-mono-iw); font-size: clamp(.8rem,2.2vw,1.15rem); color: var(--gold); letter-spacing: .1em; margin-bottom: .4rem; }
.iw .ih-kicker .c-muted { color: var(--muted-2); }
.iw .ih-title { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; letter-spacing: -.02em; margin: .3rem 0 .2rem; display: flex; align-items: center; justify-content: center; gap: clamp(.5rem, 2.2vw, 2.2rem); }
.iw .ih-title .brace { font-family: var(--font-mono-iw); font-weight: 700; color: var(--gold); font-size: clamp(4.4rem, 15vw, 12rem); line-height: .72; text-shadow: 0 0 50px rgba(242,158,24,.35); }
.iw .ih-stack { display: flex; flex-direction: column; align-items: center; line-height: .86; }
.iw .ih-title .t-intro,
.iw .ih-title .week {
  font-size: clamp(2.4rem, 8.4vw, 6.8rem); line-height: .86; letter-spacing: -.02em;
  background: linear-gradient(180deg, #fff 0%, #fff 72%, color-mix(in srgb, var(--gold) 45%, #fff) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  text-shadow: 0 0 38px rgba(0,0,0,.55);
}
.iw .ih-title .t-week { display: flex; align-items: baseline; gap: .28em; }
.iw .ih-year { font-family: var(--font-mono-iw); font-weight: 700; font-size: clamp(1.4rem, 4.6vw, 3.4rem); color: transparent; -webkit-text-stroke: 2px var(--gold); letter-spacing: -.04em; background: none; text-shadow: none; }
@media (max-width: 560px) { .iw .ih-title { gap: .35rem; } .iw .ih-title .brace { font-size: clamp(3.4rem, 16vw, 5.5rem); } }
.iw .ih-sub { max-width: 30ch; margin: 1.4rem auto 0; font-size: clamp(1rem, 2.3vw, 1.35rem); line-height: 1.5; color: var(--muted); text-wrap: balance; }
.iw .ih-sub b { color: var(--text); font-weight: 600; }
.iw .ih-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem 1.1rem; margin-top: 1.3rem; font-family: var(--font-mono-iw); font-size: .76rem; color: var(--muted-2); letter-spacing: .04em; }
.iw .ih-meta span { display: inline-flex; align-items: center; gap: .4rem; }
.iw .ih-meta .dot { color: var(--faint); }
.iw .ih-meta b { color: var(--gold); font-weight: 700; }

/* COUNTDOWN */
.iw .countdown { margin: 2.4rem auto 0; display: inline-flex; flex-direction: column; align-items: center; gap: .7rem; }
.iw .cd-label { font-family: var(--font-mono-iw); font-size: .68rem; letter-spacing: .3em; text-transform: uppercase; color: var(--muted-2); }
.iw .cd-label b { color: var(--green); }
.iw .cd-grid { display: flex; align-items: stretch; gap: clamp(.4rem,1.4vw,1rem); }
.iw .cd-cell { position: relative; min-width: clamp(64px, 13vw, 116px); padding: .9rem .6rem .7rem; background: linear-gradient(160deg, rgba(24,24,27,.82), rgba(9,9,11,.9)); border: 1px solid var(--border-strong); border-radius: 12px; overflow: hidden; box-shadow: 0 24px 60px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.04); }
.iw .cd-cell::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: .6; }
.iw .cd-num { font-family: var(--font-mono-iw); font-weight: 700; font-variant-numeric: tabular-nums; font-size: clamp(1.9rem, 5.4vw, 3.6rem); line-height: 1; color: var(--text); text-shadow: 0 0 22px rgba(242,158,24,.25); display: block; }
.iw .cd-unit { font-family: var(--font-mono-iw); font-size: .6rem; letter-spacing: .22em; text-transform: uppercase; color: var(--muted-2); margin-top: .45rem; display: block; }
.iw .cd-colon { display: flex; align-items: center; font-family: var(--font-mono-iw); font-size: clamp(1.4rem,3.5vw,2.4rem); color: var(--gold); opacity: .55; }

/* CTAs */
.iw .ih-ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-top: 2.2rem; }
.iw .btn { display: inline-flex; align-items: center; gap: .5rem; font-family: var(--font-mono-iw); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; font-size: .8rem; padding: 1rem 1.6rem; border-radius: 8px; transition: transform .2s, box-shadow .3s, border-color .3s; cursor: pointer; }
.iw .btn-primary { background: var(--gold); color: var(--bg); }
.iw .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 44px -10px rgba(242,158,24,.55); }
.iw .btn-primary .bkt { color: rgba(9,9,11,.5); }
.iw .btn-ghost { background: transparent; color: var(--text); border: 1px solid var(--border-strong); }
.iw .btn-ghost:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-2px); }
.iw .btn .arrow { color: var(--gold); }
.iw .btn-ghost:hover .arrow { color: var(--gold); }
.iw .ih-scroll { margin-top: 2.4rem; display: inline-flex; flex-direction: column; align-items: center; gap: .4rem; font-family: var(--font-mono-iw); font-size: .64rem; letter-spacing: .2em; text-transform: uppercase; color: var(--muted-2); }
.iw .ih-scroll .v { width: 1px; height: 1.7rem; background: linear-gradient(var(--gold), transparent); }
.iw .ih-scroll .arr { color: var(--gold); display: inline-flex; animation: iwBobv 1.5s ease-in-out infinite; }
@keyframes iwBobv { 0%,100%{transform:translateY(0);} 50%{transform:translateY(4px);} }

/* ── SHEET ── */
.iw .sheet { position: relative; z-index: 1; background: var(--bg); }
.iw .sheet::before { content: ""; position: absolute; left: 0; right: 0; top: -120px; height: 120px; background: linear-gradient(to bottom, transparent, var(--bg)); pointer-events: none; }
.iw .sec { position: relative; padding: clamp(4rem, 9vw, 8rem) 0; }
.iw .seclabel { margin-bottom: clamp(2rem, 4vw, 3.4rem); }
.iw .seclabel-top { display: flex; align-items: center; gap: 1rem; margin-bottom: .8rem; }
.iw .seclabel-num { font-family: var(--font-mono-iw); font-size: .72rem; letter-spacing: .3em; color: var(--gold); }
.iw .seclabel-rule { width: 3rem; height: 1px; background: var(--gold); }
.iw .seclabel-title { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: clamp(1.6rem,3.4vw,2.4rem); letter-spacing: -.01em; }
.iw .sec-intro { max-width: 46ch; color: var(--muted); font-size: clamp(1rem,1.6vw,1.18rem); line-height: 1.6; margin-top: -1.4rem; margin-bottom: 2.6rem; }
.iw .sec-intro b { color: var(--text); }

/* ── PROGRAM CARDS ── */
.iw .days { display: grid; grid-template-columns: repeat(5, 1fr); gap: clamp(.8rem, 1.4vw, 1.3rem); perspective: 1400px; }
@media (max-width: 1100px) { .iw .days { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .iw .days { grid-template-columns: 1fr; } }
.iw .day { --c: var(--gold); position: relative; cursor: pointer; transform-style: preserve-3d; border-radius: 16px; outline: none; }
.iw .tilt-inner { position: relative; height: 100%; border-radius: 16px; overflow: hidden; background: linear-gradient(165deg, rgba(24,24,27,.9), rgba(9,9,11,.96)); border: 1px solid var(--border-strong); transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .3s, border-color .3s; transform-style: preserve-3d; min-height: 340px; display: flex; flex-direction: column; box-shadow: 0 30px 60px -34px rgba(0,0,0,.9); }
.iw .day:hover .tilt-inner { border-color: color-mix(in srgb, var(--c) 50%, transparent); box-shadow: 0 40px 80px -30px rgba(0,0,0,.9), 0 0 50px -16px color-mix(in srgb,var(--c) 60%, transparent); }
.iw .day .tilt-inner::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .3s; background: radial-gradient(220px 220px at var(--mx,50%) var(--my,50%), color-mix(in srgb,var(--c) 22%, transparent), transparent 70%); }
.iw .day:hover .tilt-inner::after { opacity: 1; }
.iw .day-corner { position: absolute; width: 14px; height: 14px; border-color: color-mix(in srgb,var(--c) 60%, transparent); opacity: .8; }
.iw .day-corner.tl { top: 10px; left: 10px; border-top: 2px solid; border-left: 2px solid; }
.iw .day-corner.br { bottom: 10px; right: 10px; border-bottom: 2px solid; border-right: 2px solid; }
.iw .day-top { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.2rem 1.2rem 0; }
.iw .day-num { font-family: var(--font-display); font-weight: 800; font-size: 3.4rem; line-height: .8; color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb,var(--c) 70%, transparent); }
.iw .day:hover .day-num { color: color-mix(in srgb,var(--c) 16%, transparent); }
.iw .day-body { padding: 1rem 1.2rem 0; flex: 1; }
.iw .day-title { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: 1.5rem; line-height: .98; letter-spacing: -.01em; margin-bottom: .5rem; display: inline-flex; align-items: center; gap: .4rem; }
.iw .day-slug { font-family: var(--font-mono-iw); font-size: .72rem; color: var(--muted-2); margin-bottom: .9rem; }
.iw .day-slug .c { color: var(--c); }
.iw .day-meta { display: flex; flex-direction: column; gap: .35rem; font-family: var(--font-mono-iw); font-size: .74rem; color: var(--muted); }
.iw .day-meta span { display: flex; align-items: center; gap: .45rem; }
.iw .day-meta svg { width: 13px; height: 13px; flex: none; color: var(--c); }
.iw .day-extra { max-height: 0; overflow: hidden; transition: max-height .4s ease, opacity .3s; opacity: 0; padding: 0 1.2rem; }
.iw .day.open .day-extra { max-height: 260px; opacity: 1; padding-top: .9rem; }
.iw .day-extra p { font-size: .82rem; line-height: 1.55; color: var(--muted); }
.iw .day-tags { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .7rem; }
.iw .day-tags .tg { font-family: var(--font-mono-iw); font-size: .6rem; letter-spacing: .06em; text-transform: uppercase; color: var(--c); border: 1px solid color-mix(in srgb,var(--c) 35%,transparent); padding: .22rem .5rem; border-radius: 5px; }
.iw .day-foot { margin-top: auto; padding: 1rem 1.2rem; display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed var(--border-strong); font-family: var(--font-mono-iw); font-size: .68rem; color: var(--muted-2); }
.iw .day-foot .more { color: var(--c); display: inline-flex; align-items: center; gap: .35rem; transition: gap .2s; }
.iw .day:hover .day-foot .more { gap: .6rem; }
.iw .day .chev { display: inline-flex; transition: transform .3s; }
.iw .day.open .chev { transform: rotate(180deg); }
.iw .prog-note { margin-top: 1.8rem; font-family: var(--font-mono-iw); font-size: .8rem; color: var(--muted-2); text-align: center; }
.iw .prog-note a { color: var(--gold); border-bottom: 1px solid currentColor; }

/* week toggle */
.iw .weekseg { display: flex; align-items: center; gap: .5rem; margin-bottom: 2.2rem; flex-wrap: wrap; }
.iw .weekseg button { display: inline-flex; align-items: center; gap: .55rem; font-family: var(--font-mono-iw); font-size: .82rem; color: var(--muted); padding: .6rem 1.1rem; border-radius: 9px; border: 1px solid var(--border-strong); background: var(--surface); transition: all .25s; cursor: pointer; }
.iw .weekseg button b { color: var(--text); font-weight: 700; }
.iw .weekseg button .ws-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--faint); transition: background .25s, box-shadow .25s; }
.iw .weekseg button:hover { color: var(--text); }
.iw .weekseg button.active { border-color: color-mix(in srgb, var(--gold) 55%, transparent); color: var(--text); background: color-mix(in srgb, var(--gold) 8%, var(--surface)); }
.iw .weekseg button.active .ws-dot { background: var(--gold); box-shadow: 0 0 10px var(--gold); }
.iw .weekseg .ws-tag { margin-left: auto; font-size: .72rem; color: var(--muted-2); opacity: .8; }
@media (max-width: 560px) { .iw .weekseg .ws-tag { width: 100%; margin-left: 0; } }
.iw .week-panel { display: none; }
.iw .week-panel.show { display: block; }

/* binnenkort badge */
.iw .day-soon { display: inline-flex; align-items: center; gap: .4rem; font-family: var(--font-mono-iw); font-size: .58rem; letter-spacing: .18em; text-transform: uppercase; color: var(--c); border: 1px solid color-mix(in srgb,var(--c) 35%,transparent); padding: .3rem .5rem; border-radius: 6px; background: color-mix(in srgb,var(--c) 8%, transparent); }
.iw .day-soon .sd { width: 6px; height: 6px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 0 currentColor; animation: iwPing 1.8s ease-out infinite; }
.iw .day-meta.locked span { color: var(--muted-2); }
.iw .day-meta.locked svg { opacity: .8; }
.iw .compiling { background: linear-gradient(90deg, var(--muted-2) 0%, var(--c) 50%, var(--muted-2) 100%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: iwShimmer 2.4s linear infinite; font-style: italic; }
@keyframes iwShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.iw .locked-card .tilt-inner { background: linear-gradient(165deg, rgba(17,17,19,.95), rgba(9,9,11,.98)); }
.iw .locked-body { position: relative; }
.iw .locked-body .lockico { display: inline-flex; color: var(--c); }
.iw .scrambled { margin-top: 1rem; font-size: .82rem; letter-spacing: .1em; color: var(--faint); user-select: none; }
.iw .locked-card .day-num { -webkit-text-stroke-color: color-mix(in srgb,var(--c) 45%,transparent); }

/* ── SURVIVAL KIT ── */
.iw .kit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(.8rem,1.4vw,1.2rem); }
@media (max-width: 880px) { .iw .kit-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 460px) { .iw .kit-grid { grid-template-columns: 1fr; } }
.iw .kit { --c: var(--gold); position: relative; padding: 1.5rem 1.3rem; border-radius: 14px; background: var(--surface); border: 1px solid var(--border-strong); overflow: hidden; transition: transform .25s, border-color .25s, background .25s; }
.iw .kit:hover { transform: translateY(-4px); border-color: color-mix(in srgb,var(--c) 50%,transparent); background: var(--surface-2); }
.iw .kit-ic { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 9px; background: color-mix(in srgb,var(--c) 12%, transparent); color: var(--c); margin-bottom: 1rem; }
.iw .kit h4 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: 1.15rem; letter-spacing: -.01em; margin-bottom: .35rem; }
.iw .kit p { font-size: .85rem; line-height: 1.5; color: var(--muted); }
.iw .kit .idx { position: absolute; top: 1.1rem; right: 1.2rem; font-family: var(--font-mono-iw); font-size: .66rem; color: var(--faint); }

/* ── FINALE / TICKET ── */
.iw .finale { position: relative; padding: clamp(4.5rem,10vw,9rem) 0; overflow: hidden; }
.iw .finale .ghost { position: absolute; left: 50%; top: 14%; transform: translateX(-50%); font-family: var(--font-display); font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,.022); font-size: clamp(9rem,26vw,26rem); line-height: .8; white-space: nowrap; pointer-events: none; user-select: none; }
.iw .finale-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 1.05fr .95fr; gap: clamp(2rem,5vw,4.5rem); align-items: center; }
@media (max-width: 940px) { .iw .finale-grid { grid-template-columns: 1fr; } }
.iw .finale h2 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: clamp(2.4rem,6vw,4.6rem); line-height: .92; letter-spacing: -.02em; margin-bottom: 1.2rem; }
.iw .finale h2 .c-gold { color: var(--gold); }
.iw .finale-body { color: var(--muted); font-size: clamp(1rem,1.7vw,1.2rem); line-height: 1.6; max-width: 40ch; margin-bottom: 1.6rem; }
.iw .finale-body b { color: var(--text); }
.iw .finale-list { display: flex; flex-direction: column; gap: .55rem; margin-bottom: 2rem; font-family: var(--font-mono-iw); font-size: .9rem; }
.iw .finale-list li { display: flex; align-items: center; gap: .7rem; color: var(--muted); }
.iw .finale-list .ck { color: var(--green); display: inline-flex; }
.iw .ticket { position: relative; border-radius: 18px; overflow: hidden; background: linear-gradient(155deg, rgba(242,158,24,.1), rgba(17,17,19,.97) 42%, rgba(9,9,11,.99)); border: 1px solid var(--border-strong); padding: 0; box-shadow: 0 40px 90px -30px rgba(0,0,0,.85); animation: iwFloaty 7s ease-in-out infinite; }
@keyframes iwFloaty { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-9px);} }
.iw .ticket::before { content:""; position:absolute; inset:0; border-radius:18px; padding:1px; pointer-events:none; background: linear-gradient(135deg, var(--gold), transparent 48%, var(--blue)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity:.55; }
.iw .tk-top { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px dashed var(--border-strong); font-family: var(--font-mono-iw); }
.iw .tk-top .lg { font-weight: 700; font-size: 1.15rem; }
.iw .tk-top .lg .c-gold { color: var(--gold); }
.iw .tk-top .cls { font-size: .64rem; letter-spacing: .25em; text-transform: uppercase; color: var(--muted-2); border: 1px solid var(--border-strong); padding: .3rem .55rem; border-radius: 5px; }
.iw .tk-body { padding: 1.4rem; }
.iw .tk-route { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.3rem; }
.iw .tk-pt { font-family: var(--font-mono-iw); }
.iw .tk-pt .big { font-family: var(--font-display); font-weight: 800; font-size: 2rem; line-height: 1; }
.iw .tk-pt .sm { font-size: .64rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-2); margin-top: .3rem; }
.iw .tk-pt.r { text-align: right; }
.iw .tk-path { flex: 1; position: relative; height: 2px; background: repeating-linear-gradient(90deg, var(--border-strong) 0 6px, transparent 6px 12px); }
.iw .tk-path .pl { position: absolute; top: 50%; left: 0; transform: translate(-2px,-50%); color: var(--gold); display: inline-flex; }
.iw .tk-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: .9rem; padding-top: 1.2rem; border-top: 1px dashed var(--border-strong); font-family: var(--font-mono-iw); }
.iw .tk-grid .k { font-size: .58rem; letter-spacing: .15em; text-transform: uppercase; color: var(--muted-2); margin-bottom: .3rem; }
.iw .tk-grid .v { font-size: .92rem; color: var(--text); font-weight: 600; }
.iw .tk-grid .v.c-gold { color: var(--gold); }
.iw .tk-grid .v.c-green { color: var(--green); }
.iw .tk-notch { position: absolute; width: 22px; height: 22px; border-radius: 50%; background: var(--bg); top: 50%; }
.iw .tk-notch.l { left: -11px; } .iw .tk-notch.r { right: -11px; }
.iw .tk-barcode { margin-top: 1.3rem; height: 40px; background-image: repeating-linear-gradient(90deg, var(--text) 0 2px, transparent 2px 3px, var(--text) 3px 4px, transparent 4px 7px); opacity: .85; border-radius: 3px; }
.iw .tk-cta { display: block; margin-top: 1.3rem; text-align: center; font-family: var(--font-mono-iw); font-weight: 700; letter-spacing: .18em; text-transform: uppercase; font-size: .82rem; padding: 1rem; background: var(--gold); color: var(--bg); border-radius: 8px; transition: box-shadow .3s, transform .2s; }
.iw .tk-cta:hover { box-shadow: 0 16px 44px -10px rgba(242,158,24,.55); transform: translateY(-2px); }

.iw .reveal { opacity: 1; transform: none; }

/* ── HBO-ICT CO-BRAND (hero: minimal tag) ── */
.iw .ih-cobrand { display: inline-flex; align-items: center; gap: .5rem; margin: .9rem auto 0; padding: .3rem .7rem; border: 1px solid var(--border-strong); border-radius: 7px; background: rgba(17,17,19,.45); }
.iw .ih-cobrand .mono { font-size: .64rem; letter-spacing: .12em; text-transform: lowercase; color: var(--muted); }
.iw .ih-cobrand-dot { width: 6px; height: 6px; flex: none; background: var(--hboict-cyan); box-shadow: 0 0 8px var(--hboict-cyan); }
@media (max-width: 480px) { .iw .ih-cobrand .mono { font-size: .58rem; letter-spacing: .08em; } }

/* ── HBO-ICT CO-BRAND (finale sign-off) ── */
.iw .iw-signoff { position: relative; z-index: 2; margin-top: clamp(3rem, 6vw, 5rem); padding-top: clamp(2rem, 4vw, 3rem); border-top: 1px solid var(--border); }
.iw .iw-signoff-vorm { position: absolute; top: -1px; left: 0; width: clamp(120px, 22vw, 200px); height: 4px; }
.iw .iw-signoff-vorm > div { width: 100%; height: 100%; }
.iw .iw-signoff-row { display: flex; align-items: center; gap: clamp(1rem, 3vw, 1.8rem); flex-wrap: wrap; }
.iw .iw-signoff-logo { height: 30px; width: auto; opacity: .96; }
.iw .iw-signoff-line { font-size: .74rem; letter-spacing: .1em; color: var(--muted-2); }
@media (max-width: 560px) { .iw .iw-signoff-logo { height: 26px; } .iw .iw-signoff-line { font-size: .66rem; } }

@media (prefers-reduced-motion: reduce) {
  .iw .hyper-core, .iw .ih-eyebrow .pdot, .iw .day-soon .sd, .iw .compiling, .iw .ticket, .iw .ih-scroll .arr, .iw #boot::before { animation: none !important; }
}
`
