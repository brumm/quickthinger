import $ from 'nodobjc'

$.framework('Foundation')
$.framework('AppKit')

export default function getIconForFile(path, callback, { width = 128, height = 128 } = {}) {
  const pool     = $.NSAutoreleasePool('alloc')('init')

  const rect = $.NSMakeRect(0, 0, width, height)
  const dict = $.NSDictionary('dictionaryWithObject', $(1), 'forKey', $.NSString('stringWithUTF8String', ''))
  path = $.NSString('stringWithUTF8String', path)

  const icon = $.NSWorkspace('sharedWorkspace')('iconForFile', path)
  const bestIcon = icon('bestRepresentationForRect', rect, 'context', null, 'hints', null)
  const bestImage = $.NSImage('alloc')('init')
  bestImage('addRepresentation', bestIcon)
  const bitmap = $.NSBitmapImageRep('imageRepsWithData', bestImage('TIFFRepresentation'))('objectAtIndex', 0)
  const png = bitmap('representationUsingType', $.NSPNGFileType, 'properties', dict)

  const base64 = png('base64Encoding')

  callback(null, base64.toString())

  pool('drain')
}
