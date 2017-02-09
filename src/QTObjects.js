import { filter } from 'fuzzaldrin-plus'
import {
  observable,
  computed,
  isObservable,
  observe,
  action,
} from 'mobx'

import { wrapAround } from 'utils'
import defaultAction from 'defaultAction.png'
import emptyIcon from 'empty.png'

export class QTObjectSource {
  @observable index = 0
  @observable loading = true
  @observable _items = []
  @observable input = undefined
  @observable searchTerm = []

  constructor(input, resolver) {

    observe(this, 'input', input => {
      this.loading = true
      // this._items = []
      resolver(input).then(_items => {
        this._items = _items.map(item => new QTObject(item))
        this.loading = false
      })
    })

    observe(this, 'searchTerm', () => {
      this.index = 0
    })

    this.input = input
  }

  @computed get items() {
    return this.searchTerm.length
      ? filter(this._items, this.searchTerm.join(''), { key: 'name' })
      : this._items
  }

  @computed get selected() {
    if (this.items.length === 0) {
      return new QTObject()
    }
    return this.items[this.index] || new QTObject()
  }

  @action changeIndex(direction) {
    this.index = wrapAround(this.index + direction, this.items.length)
  }

  @action browseToParent() {
    this.index = 0
    this.input = this.selected.path
      ? `/${this.selected.getParent()}`
      : this.input.split('/').slice(0, -1).join('/')
  }
  @action browseToChild(direction) {
    if (this.selected.providesChildren) {
      this.input = this.selected.path
      this.index = 0
    }
  }
}

export class QTObject {
  constructor(object = {}) {
    this.object = object
  }
  get name() { return this.object.name }
  get details() {
    return this.object.details || this.object.path
  }
  get type() { return this.object.type }
  get icon() {
    return this.object.icon || this.object.path || emptyIcon
  }
  get path() { return this.object.path }

  get providesChildren() {
    return this.object.type.includes('public.folder')
  }

  execute() {
    this.object.execute()
  }

  getParent() {
    return this.object.components.slice(1, -2).join('/')
  }
  get children() { return this.object.children }

  // ugh
  get suggestedObjects() { return this.object.suggestedObjects }
  get providesTypes() { return this.object.providesTypes }
  get acceptsTypes() { return this.object.acceptsTypes }
  get components() { return this.object.components }
}

// class QTActionMoveTo {
//   displayName = 'Move To...'
//   icon = defaultAction
//   uti = ['com.quickthinger.action-object']
//   acceptsTypes = ['public.item', 'public.folder']
//   providesTypes = ['public.folder']
//
//   suggestedObjectsFor = directObject => (
//     getDirectoryContent(directObject.parent)
//   )
// }
