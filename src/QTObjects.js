import defaultAction from 'defaultAction.png'

class QTObject {
    
}

class QTActionMoveTo {
  displayName = 'Move To...'
  icon = defaultAction
  uti = ['com.quickthinger.action-object']
  acceptsTypes = ['public.item', 'public.folder']
  providesTypes = ['public.folder']

  suggestedObjectsFor = directObject => (
    getDirectoryContent(directObject.parent)
  )
}
