
import React from 'react'
import { filter } from 'fuzzaldrin-plus'
import Flex from 'flex-component'
import Pinky from 'react-pinky-promise'
import fill from 'lodash/fill'
import KeyHandler from 'react-key-handler'
import { remote } from 'electron'

import { getDirectoryContent } from 'irpc'
import objectResolvers from 'objectResolvers'
import Pane from 'components/Pane/Pane'
import QTList from 'components/QTList/QTList'

import css from './App.scss'

const { directObject, actionObject, indirectObject } = objectResolvers
const electronWindow = remote.getCurrentWindow()
const wrap = (value, bounds) => (value % bounds + bounds) % bounds

class App extends React.Component {

  previousPaneObjects = [
    { paneObject: { uti: [], displayName: '', icon: '' }, paneResults: [] },
    { paneObject: { uti: [], displayName: '', icon: '' }, paneResults: [] },
  ]

  state = {
    browsingAt: null,
    activePaneIndex: 0,
    activeObjectIndexPerPane: [
      0, 0, 0
    ],
    searchTermsPerPane: [
      '', '', '',
    ]
  }

  quickLook(path) {
    electronWindow.previewFile(path)
  }
  browseTo(path) {
    getDirectoryContent(path).then(items => {
      if (items.length) {
        const { activePaneIndex } = this.state.activePaneIndex
        let activeObjectIndexPerPane = this.state.activeObjectIndexPerPane.slice(0)
        fill(activeObjectIndexPerPane, 0, activePaneIndex + 1)

        this.clearSearch()
        this.setState({
          browsingAt: path,
          activeObjectIndexPerPane
        })
      }
    })
  }

  changeActivePaneIndex(newIndex) {
    this.setState({
      activePaneIndex: newIndex
    })
  }

  changePaneResultIndex(newIndex, paneIndex = this.state.activePaneIndex) {
    let activeObjectIndexPerPane = this.state.activeObjectIndexPerPane.slice(0)
    fill(activeObjectIndexPerPane, 0, paneIndex + 1)
    activeObjectIndexPerPane[paneIndex] = newIndex
    this.setState({ activeObjectIndexPerPane })
  }

  clearSearch(paneIndex = this.state.activePaneIndex) {
    let searchTermsPerPane = this.state.searchTermsPerPane.slice(0)
    searchTermsPerPane[paneIndex] = ''
    this.setState({ searchTermsPerPane })
  }

  handleSearch = e => {
    const { which, key } = e
    const { activePaneIndex } = this.state
    if (
      which >= 48 && which <= 57 ||
      which >= 65 && which <= 90
    ) {
      // e.preventDefault()
      let searchTermsPerPane = this.state.searchTermsPerPane.slice(0)
      searchTermsPerPane[activePaneIndex] += key
      fill(searchTermsPerPane, '', activePaneIndex + 1)
      this.changePaneResultIndex(0)
      this.setState({ searchTermsPerPane })
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleSearch)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleSearch)
  }

  render() {
    let { activePaneIndex, activeObjectIndexPerPane, searchTermsPerPane, browsingAt } = this.state
    let activePaneResultIndex = activeObjectIndexPerPane[activePaneIndex]
    let activeSearchTerm = searchTermsPerPane[activePaneIndex]

    const resolvers = [
      browsingAt ? () => getDirectoryContent(browsingAt) : directObject,
      actionObject,
      indirectObject
    ]

    const paneObjectsPromise = resolvers.reduce((acc, resolver, paneIndex) => (
      acc.then(([previousPane, ...otherPanes]) => (
        resolver(previousPane && previousPane.paneResults[activeObjectIndexPerPane[paneIndex - 1]])
          .then(currentPaneResults => {
            const searchTerm = searchTermsPerPane[paneIndex]
            currentPaneResults = searchTerm
              ? filter(currentPaneResults, searchTerm, { key: 'displayName' })
              : currentPaneResults
            return [
              {
                paneResults: currentPaneResults,
                paneObject: currentPaneResults[activeObjectIndexPerPane[paneIndex]],
                searchTerm
              },
              previousPane,
              ...otherPanes
            ]
          })
      ))
    ), Promise.resolve([])).then(intermediary => intermediary.reverse().filter(Boolean))

    return (
      <Flex className={css.container} direction='column'>
        <Pinky promise={paneObjectsPromise}>
          {({ resolved: paneObjects = this.previousPaneObjects, rejected, pending: loading }) => {
            if (rejected) { throw rejected }

              paneObjects = paneObjects.filter(({ paneObject, searchTerm }) => paneObject || searchTerm)

              const activePaneObject = paneObjects[activePaneIndex].paneObject
              const activePaneResults = paneObjects[activePaneIndex].paneResults

              let listItemHeight = 50
              let listHeight = Math.min(activePaneResults.length * listItemHeight, 4.5 * listItemHeight)

              if (!loading) {
                this.previousPaneObjects = paneObjects
                electronWindow.setSize(paneObjects.length * 200, listHeight + 185)
              }

              return (
                <Flex grow={1} direction='column'>

                  {!loading && activePaneObject && activePaneObject.components && browsingAt !== '/' &&
                    <KeyHandler keyEventName='keydown' keyValue='ArrowLeft'
                      onKeyHandle={e => {
                        e.preventDefault()
                        this.browseTo(activePaneObject.components.slice(0, -2).join('/'))
                      }}
                    />
                  }

                  {!loading && activePaneObject &&
                    <KeyHandler keyEventName='keydown' keyValue='ArrowRight'
                      onKeyHandle={e => {
                        e.preventDefault()
                        activePaneObject.uti.includes('public.folder')
                          ? this.browseTo(activePaneObject.path)
                          : this.quickLook(activePaneObject.path)
                      }}
                    />
                  }

                  {!loading && activePaneObject &&
                    <KeyHandler keyEventName='keydown' keyValue=' '
                      onKeyHandle={e => {
                        e.preventDefault()
                        activePaneObject.uti.includes('public.folder')
                          ? this.browseTo(activePaneObject.path)
                          : this.quickLook(activePaneObject.path)
                      }}
                    />
                  }

                  {!loading && activePaneObject &&
                    <KeyHandler keyEventName='keydown' keyValue='ArrowDown'
                      onKeyHandle={e => {
                        e.preventDefault()
                        this.changePaneResultIndex(
                          wrap(activePaneResultIndex + 1, activePaneResults.length)
                        )
                      }
                    } />
                  }

                  {!loading && activePaneObject &&
                    <KeyHandler keyEventName='keydown' keyValue='ArrowUp'
                      onKeyHandle={e => {
                        e.preventDefault()
                        this.changePaneResultIndex(
                          wrap(activePaneResultIndex - 1, activePaneResults.length)
                        )
                      }
                    } />
                  }

                  {!loading && activePaneObject &&
                    <KeyHandler keyEventName='keydown' keyValue='Tab'
                      onKeyHandle={e => {
                        e.preventDefault()
                        this.changeActivePaneIndex(
                          wrap(activePaneIndex + (e.shiftKey ? -1 : 1), paneObjects.length)
                        )
                      }
                    } />
                  }

                  {activeSearchTerm &&
                    <KeyHandler keyEventName='keydown' keyValue='Backspace'
                      onKeyHandle={e => {
                        e.preventDefault()
                        this.clearSearch()
                      }} />
                  }

                  <Flex className={css.sentence}>
                    {paneObjects.length !== 1
                      ? paneObjects.map(({ paneObject = {}, searchTerm }, paneIndex) => (
                      <Pane
                        key={`pane-${paneIndex}`}
                        active={paneIndex === activePaneIndex}
                        label={paneObject.displayName || paneObject.name}
                        searchTerm={searchTerm}
                        icon={paneObject.icon || paneObject.path}
                        changeActivePaneIndex={() => this.changeActivePaneIndex(paneIndex)}
                      />
                  )) : [<Pane key='directObjectId' active label='Type to search' />, <Pane key='actionObjectId' />]}
                  </Flex>

                  <Flex grow={1}>
                    <QTList
                      loading={loading}
                      height={listHeight}
                      listItemHeight={listItemHeight}
                      items={activePaneResults}
                      selectedIndex={activePaneResultIndex}
                      onIndexChange={index => this.changePaneResultIndex(index)}
                    />
                  </Flex>
              </Flex>
              )

          }}
        </Pinky>
      </Flex>
    )
  }
}

export default App
