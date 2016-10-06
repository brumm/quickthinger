export default class Cache {
  constructor(cacheDuration = 0) {
    this.cacheDuration = cacheDuration
    this.store = new Map()
  }

  has(key) {
    if (!this.store.has(key)) {
      console.info('cache empty', key);
      return false
    }

    let { timestamp, value } = this.store.get(key) || {}
    const now = Date.now()

    now - timestamp >= this.cacheDuration
     ? console.info('cache miss', key)
     : console.info('cache hit', key)

    return now - timestamp >= this.cacheDuration
      ? false
      : true
  }

  get(key) {
    let { value } = this.store.get(key)
    return value
  }

  set(key, value) {
    return this.store.set(key, {
      timestamp: Date.now(),
      value
    })
  }
}
