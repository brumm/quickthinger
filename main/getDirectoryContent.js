import $ from 'nodobjc'

$.framework('Foundation')

function getDirectoryContent(path, callback) {
  if (!path) {
    callback(new Error('Path is required'))
  }

  console.log('getting directory content for', path)

  const fileSystemResourceKeys = $.NSMutableArray('alloc')('init');
  fileSystemResourceKeys('addObject', $.kCFURLLocalizedNameKey)
  fileSystemResourceKeys('addObject', $.kCFURLTypeIdentifierKey)
  fileSystemResourceKeys('addObject', $.kCFURLIsPackageKey)
  fileSystemResourceKeys('addObject', $.kCFURLIsDirectoryKey)
  fileSystemResourceKeys('addObject', $.kCFURLIsRegularFileKey)
  fileSystemResourceKeys('addObject', $.kCFURLPathKey)

  const nativeFilesList = $.NSFileManager('defaultManager')(
    'contentsOfDirectoryAtURL', $.NSURL('fileURLWithPath', $(path)),
    'includingPropertiesForKeys', fileSystemResourceKeys,
    // 'options', ~$.NSDirectoryEnumerationSkipsHiddenFiles,
    'options', $.NSDirectoryEnumerationSkipsHiddenFiles,
    'error', null
  )

  let files = []
  for (let filesIndex = 0; filesIndex < nativeFilesList('count'); filesIndex++) {
    let url = nativeFilesList('objectAtIndex', filesIndex)
    let dict = url('resourceValuesForKeys', fileSystemResourceKeys, 'error', null)

    let isFile = !!+dict('valueForKey', $('NSURLIsRegularFileKey')).toString()
    let isDirectory = !!+dict('valueForKey', $('NSURLIsDirectoryKey')).toString()
    let isPackage = !!+dict('valueForKey', $('NSURLIsPackageKey')).toString()

    let components = []
    let nativeComponentsArray = url('pathComponents')
    for (var componentsIndex = 0; componentsIndex < nativeComponentsArray('count'); componentsIndex++) {
      components.push(
        nativeComponentsArray('objectAtIndex', componentsIndex).toString()
      )
    }

    let file = {
      path: dict('valueForKey', $('_NSURLPathKey')).toString(),
      components: components,
      name: url('lastPathComponent').toString(),
      displayName: dict('valueForKey', $('NSURLLocalizedNameKey')).toString(),
      uti: [dict('valueForKey', $('NSURLTypeIdentifierKey')).toString()],
      isPackage: isPackage,
    }

    if (isFile) { file.uti.unshift('public.item') }
    if (isDirectory && isPackage) { file.uti.unshift('public.folder') }

    files.push(file)
  }

  callback(null, files)
}

export default getDirectoryContent
