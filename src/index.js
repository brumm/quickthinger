import 'css/global'

import React from 'react'
import { render } from 'react-dom'
import Pinky from 'react-pinky-promise'

import App from 'components/App/App'

render(
  <App />,
  document.querySelector('#app')
)
