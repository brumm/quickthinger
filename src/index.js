import 'css/global'

import React from 'react'
import { render } from 'react-dom'
import Router from 'react-router/HashRouter'
import Match from 'react-router/Match'
import Pinky from 'react-pinky-promise'

import App from 'components/App/App'

import { getDirectoryContent } from 'irpc'

const fixPathname = pathname => (
  pathname === '/' ? pathname : `${pathname}/`
)

if (history.state) {
  history.replaceState(history.state.key, {})
}

render(
  <Router>
    <Match pattern='(.*)' component={({ location: { pathname, state }}) => {
      pathname = fixPathname(pathname)
      return (
        <Pinky promise={getDirectoryContent(pathname)}>
          {({ pending, resolved, rejected }) => (
            <App
              loading={pending}
              path={pathname}
              previousPath={resolved ? state && state.previousPath : null}
              items={resolved ? resolved : []}
            />
          )}
        </Pinky>
      )
    }} />
  </Router>,
  document.querySelector('#app')
)
