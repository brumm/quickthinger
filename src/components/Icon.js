import React from 'react'
import memoize from 'lodash/memoize'

import { getIconForFile } from 'irpc'

const Icon = memoize(({ path, size, style }) => (
  <div style={{ width: size, height: size, flexShrink: 0, ...style }}>

    {path && path.startsWith('/') ? (
      <img width={size} height={size} style={{ width: size, height: size }} src={`icon://${path}`} />
    ) : (
      <img width={size} height={size} style={{ width: size, height: size }} src={path} />
    )}

  </div>
), ({ path, size }) => [path, size])

export default Icon
