const readdir = require("readdir-plus")

export default function getDirectoryContent(path, callback) {
  readdir(path, {
    return: 'details',
    recursive: false,
    stat: false,
    filter: { directory: true }
  }, callback)
}
