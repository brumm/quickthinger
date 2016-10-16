import irpc from 'electron-irpc'
const irpcRenderer = irpc.renderer()

import Cache from 'cache'

const cache = new Cache(1000 * 60 * 5)

export const getDirectoryContent = path => (
  cache.has(path) ? Promise.resolve(cache.get(path)) : (
    new Promise((resolve, reject) => (
      irpcRenderer.call('getDirectoryContent', path, (err, items) => {
        cache.set(path, items)
        err ? reject(err) : resolve(items)
      })
    ))
  )
)

export const getIconForFile = path => (
  new Promise((resolve, reject) => (
    irpcRenderer.call('getIconForFile', path, (err, icon) => (
      err ? reject(err) : resolve(icon)
    ))
  ))
)

export const getRecentDocumentsForApplication = path => (
  new Promise((resolve, reject) => (
    irpcRenderer.call('getRecentDocumentsForApplication', path, (err, items) => (
      err ? reject(err) : resolve(items)
    ))
  ))
)
