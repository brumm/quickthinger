import $ from 'nodobjc'

$.framework('Foundation')

function getRecentDocumentsForApplication(pathToApp, callback) {

  let bundleIdentifier = $.NSBundle('bundleWithPath', $(pathToApp))('bundleIdentifier')
  let dict = $.NSKeyedUnarchiver('unarchiveObjectWithFile', $(`~/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/${bundleIdentifier}`))
  let items = dict('objectForKey', $('items'))
  let itemsCount = items('count')

  let recentFiles = []
  while (itemsCount--) {
  	recentFiles.push(
      items('objectAtIndex', itemsCount)
    )
  }

  recentFiles = recentFiles
    .sort((itemA, itemB) => (
      itemA('order') > itemB('order')
    ))
    .map(item => item('URL')('path').toString())

  callback(null, recentFiles)

}

export default getRecentDocumentsForApplication
