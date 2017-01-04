import intersection from 'lodash/intersection'
import flattenDeep from 'lodash/flattenDeep'
import { remote } from 'electron'
const { app } = remote

import { getDirectoryContent } from 'irpc'
import defaultAction from 'defaultAction.png'

const DEFAULT_LOCATION = app.getPath('downloads')

const objectResolvers = {
  directObject: path => path ? getDirectoryContent(path) : Promise.all([
    getDirectoryContent(DEFAULT_LOCATION),
  ]).then((...sources) => flattenDeep(sources)),

  actionObject: (directObject = {}) => Promise.resolve([
    {
      icon: defaultAction, displayName: 'Open',
      acceptsTypes: ['public.item', 'public.folder'],
      uti: ['com.quickthinger.action-object'],
    }, {
      icon: defaultAction, displayName: 'Move To...',
      uti: ['com.quickthinger.action-object'],
      acceptsTypes: ['public.item', 'public.folder'],
      providesTypes: ['public.folder'],
      suggestedObjects: () => getDirectoryContent(directObject.components.slice(0, -2).join('/'))
    }, {
      icon: defaultAction, displayName: 'Copy To...',
      uti: ['com.quickthinger.action-object'],
      acceptsTypes: ['public.item', 'public.folder'],
      providesTypes: ['public.folder'],
      suggestedObjects: () => getDirectoryContent(directObject.components.slice(0, -2).join('/'))
    },
  ].filter(({ acceptsTypes }) => intersection(acceptsTypes, directObject.uti).length)),

  indirectObject: (actionObject = {}) => (
    actionObject.suggestedObjects ? (
      actionObject.suggestedObjects().then(items => (
        items.filter(({ uti }) => actionObject.providesTypes && intersection(actionObject.providesTypes, uti).length))
      )
    ) : (
      Promise.resolve([
        { displayName: 'File', uti: ['public.item']},
        { displayName: 'Folder', uti: ['public.folder']},
      ].filter(({ uti }) => actionObject.providesTypes && intersection(actionObject.providesTypes, uti).length))
    )
  ),
}

export default objectResolvers
