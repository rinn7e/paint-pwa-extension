import React from 'react'
import { createRoot } from 'react-dom/client'

import './asset/index.css'
import { AppProgram } from './program'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<AppProgram />)
}
