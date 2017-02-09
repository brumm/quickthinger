import intersection from 'lodash/intersection'
import flattenDeep from 'lodash/flattenDeep'
import { remote } from 'electron'
const { app } = remote

import { getDirectoryContent } from 'irpc'
import defaultAction from 'defaultAction.png'

const DEFAULT_LOCATION = app.getPath('downloads')

export const directObjectResolver = path => path ? getDirectoryContent(path) : Promise.all([
  getDirectoryContent(DEFAULT_LOCATION),
]).then((...sources) => flattenDeep(sources))

export const actionObjectResolver = (directObject = {}) => Promise.resolve([
  {
    icon: defaultAction, name: 'Open',
    acceptsTypes: ['public.item', 'public.folder'],
    type: ['com.quickthinger.action-object'],
    execute: () => {
      const { shell } = require('electron')
      shell.openItem(directObject.path)
    }
  }, {
    icon: defaultAction, name: 'Move To...',
    type: ['com.quickthinger.action-object'],
    acceptsTypes: ['public.item', 'public.folder'],
    providesTypes: ['public.folder'],
    suggestedObjects: () => getDirectoryContent(directObject.components.slice(0, -2).join('/'))
  }, {
    icon: defaultAction, name: 'Copy To...',
    type: ['com.quickthinger.action-object'],
    acceptsTypes: ['public.item', 'public.folder'],
    providesTypes: ['public.folder'],
    suggestedObjects: () => getDirectoryContent(directObject.components.slice(0, -2).join('/'))
  },
].filter(({ acceptsTypes }) => intersection(acceptsTypes, directObject.type).length))

export const indirectObjectResolver = (actionObject = {}) => {
  return (
    actionObject.suggestedObjects ? (
      actionObject.suggestedObjects().then(items => (
        items.filter(({ type }) => actionObject.providesTypes && intersection(actionObject.providesTypes, type).length))
      )
    ) : (
      Promise.resolve([
        { name: 'File', type: ['public.item']},
        { name: 'Folder', type: ['public.folder']},
      ].filter(({ type }) => actionObject.providesTypes && intersection(actionObject.providesTypes, type).length))
    )
  )
}
