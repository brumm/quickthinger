
import React from 'react'
import Flex from 'flex-component'
import debounce from 'lodash/debounce'
import { remote } from 'electron'
import { observer } from 'mobx-react'

import { getDirectoryContent } from 'irpc'
import Pane from 'components/Pane/Pane'
import QTList from 'components/QTList/QTList'
import KeyHandler from 'components/KeyHandler/KeyHandler'
import { wrapAround } from 'utils'

import css from './App.scss'

const listItemHeight = 50
const electronWindow = remote.getCurrentWindow()
const setWindowSize = debounce((width, height) => electronWindow.setSize(width, height), 50)

@observer class App extends React.Component {
  state = {
    activePaneIndex: 0
  }

  changeActivePaneIndex(direction) {
    this.setState(({ activePaneIndex }) => ({
      activePaneIndex: wrapAround(activePaneIndex + direction, this.showThirdPane ? 3 : 2)
    }))
  }

  // ugh?
  getActivePaneName(index) {
    return ['directObjects', 'actionObjects', 'indirectObjects'][index]
  }

  get showThirdPane() { return this.props.store.indirectObjects.items.length > 0 }

  render() {
    const { store } = this.props
    const { activePaneIndex } = this.state
    const activePaneName = this.getActivePaneName(activePaneIndex)
    const activeSource = store[activePaneName]

    const listHeight = Math.max(
      Math.min(activeSource.items.length * listItemHeight, 3.5 * listItemHeight),
      listItemHeight
    )
    setWindowSize((this.showThirdPane ? 3 : 2) * 168, listHeight + 153)

    return (
      <Flex className={css.container} direction='column' grow={1}>

        <KeyHandler preventDefault keyValue='Tab'
          onKeyHandle={({ shiftKey }) => this.changeActivePaneIndex(shiftKey ? -1 : 1)} />

        <KeyHandler preventDefault keyValue={['ArrowUp', 'ArrowDown']}
          onKeyHandle={({ key }) => activeSource.changeIndex(key === 'ArrowUp' ? -1 : 1)} />

        <KeyHandler preventDefault keyValue='Enter'
          onKeyHandle={() => {
            store.actionObjects.selected.execute()
            electronWindow.hide()
          }} />

        {activePaneName !== 'actionObjects' && [
          <KeyHandler preventDefault key='ArrowLeft' keyValue='ArrowLeft' onKeyHandle={() => activeSource.browseToParent()} />,
          <KeyHandler preventDefault key='ArrowRight' keyValue='ArrowRight' onKeyHandle={() => activeSource.browseToChild()} />,
        ]}

        <Flex className={css.sentence}>
          <Pane
            active={activePaneIndex === 0}
            icon={store.directObjects.selected.icon}
            label={store.directObjects.selected.name}
            searchTerm={store.directObjects.searchTerm.join('')}
            changeActivePaneIndex={() => this.setState({ activePaneIndex: 0 })}
          />

          <Pane
            active={activePaneIndex === 1}
            icon={store.actionObjects.selected.icon}
            label={store.actionObjects.selected.name}
            searchTerm={store.actionObjects.searchTerm.join('')}
            changeActivePaneIndex={() => this.setState({ activePaneIndex: 1 })}
          />

          {this.showThirdPane && (
            <Pane
              active={activePaneIndex === 2}
              icon={store.indirectObjects.selected.icon}
              label={store.indirectObjects.selected.name}
              searchTerm={store.indirectObjects.searchTerm.join('')}
              changeActivePaneIndex={() => this.setState({ activePaneIndex: 2 })}
            />
          )}
        </Flex>

        <Flex grow={1}>
          <QTList
            activePaneName={activePaneName}
            didSearch={activeSource.searchTerm.length > 0}
            loading={activeSource.loading}
            listHeight={listHeight}
            listItemHeight={listItemHeight}
            items={activeSource.items}
            selectedIndex={activeSource.index}
            onIndexChange={index => activeSource.index = index}
          />
        </Flex>
      </Flex>
    )
  }
}

export default App
