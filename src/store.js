import { observe, observable } from 'mobx'

import { QTObject, QTObjectSource } from 'QTObjects'

import {
  directObjectResolver,
  actionObjectResolver,
  indirectObjectResolver
} from 'resolvers'

class Store {
  @observable directObjects = new QTObjectSource('/Users/brumm/Desktop/', directObjectResolver)
  @observable actionObjects = new QTObjectSource(undefined, actionObjectResolver)
  @observable indirectObjects = new QTObjectSource(undefined, indirectObjectResolver)

  constructor() {
    observe(this.directObjects, 'selected', selected => {
      this.actionObjects.input = selected
      this.actionObjects.index = 0
    })
    observe(this.actionObjects, 'selected', selected => {
      this.indirectObjects.input = selected
      this.indirectObjects.index = 0
    })
  }
}

export default new Store()
