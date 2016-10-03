import irpc from 'electron-irpc'
const irpcRenderer = irpc.renderer()

export const getDirectoryContent = (path) => (
  new Promise((resolve, reject) => (
    irpcRenderer.call('getDirectoryContent', path, (err, items) => (
      err ? reject(err) : resolve(items)
    ))
  ))
)

export const getIconForFile = (path) => (
  new Promise((resolve, reject) => (
    irpcRenderer.call('getIconForFile', path, (err, icon) => (
      err ? reject(err) : resolve(icon)
    ))
  ))
)
