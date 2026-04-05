'use client'

import { useState } from 'react'
import CodeCompile from './CodeCompile'

export default function IntroOverlay() {
  const [done, setDone] = useState(false)

  if (done) return null

  return <CodeCompile onComplete={() => setDone(true)} />
}
