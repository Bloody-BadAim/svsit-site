'use client'

import { useState } from 'react'
import CodeCompile from './CodeCompile'

export default function IntroOverlay() {
  const [done, setDone] = useState(false)

  // Once done, render nothing — fixed overlay never affects layout flow
  if (done) return null

  return <CodeCompile onComplete={() => setDone(true)} />
}
