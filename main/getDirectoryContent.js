import readdir from 'readdir-plus'

function getDirectoryContent(path, callback) {

  const content = readdir(path, {
    return: 'details',
    recursive: false,
    stat: false,
    filter: { directory: true }
  }, callback)
}

export default getDirectoryContent
