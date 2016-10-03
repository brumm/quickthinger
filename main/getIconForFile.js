import $ from 'nodobjc'

$.framework('Foundation')
$.framework('AppKit')

export default function getIconForFile(path, callback) {
  const pool   = $.NSAutoreleasePool('alloc')('init')
  path         = $.NSString('stringWithUTF8String', path)
  const icon   = $.NSWorkspace('sharedWorkspace')('iconForFile', path)

  const bitmap = $.NSBitmapImageRep('imageRepsWithData', icon('TIFFRepresentation'))('objectAtIndex', 0)
  const dict   = $.NSDictionary('dictionaryWithObject', $(1), 'forKey', $.NSString('stringWithUTF8String', ''))
  const png    = bitmap('representationUsingType', $.NSPNGFileType, 'properties', dict)
  const base64 = png('base64Encoding')

  callback(null, 'data:image/png;base64,' + base64.toString())
  pool('drain')
}
