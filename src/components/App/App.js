
import React from 'react'
import { routerContext as routerContextType } from 'react-router/PropTypes'
import { filter } from 'fuzzaldrin-plus'
import Flex from 'flex-component'
import { shell } from 'electron'
import Pinky from 'react-pinky-promise'

import Icon from 'components/Icon'
import QTList from 'components/QTList/QTList'
import highlightMatch from 'highlightMatch'

import css from './App.scss'

const wrap = (value, bounds) => (value % bounds + bounds) % bounds

const Pane = ({ children, active }) => (
  <Flex
    grow={1}
    shrink={0}
    basis='0'
    className={active ? css.sentenceFragmentActive : css.sentenceFragment}
    alignItems='center'
    justifyContent='center'
    direction='column'
  >
    {children}
  </Flex>
)

const getActions = path => Promise.resolve([
  {name: 'Open', path: ''},
  {name: 'Open With...', path: ''},
])

class App extends React.Component {

  static contextTypes = {
    router: routerContextType
  }

  state = {
    activePaneIndex: 0,
    activeListIndex0: 0,
    activeListIndex1: 0,
    search: []
  }

  componentWillReceiveProps({ previousPath, items }) {
    let previousIndex = this.filteredItems(items).findIndex(({ path }) => previousPath === path)
    if (previousIndex !== -1) {
      this.setState({ [`activeListIndex${this.state.activePaneIndex}`]: previousIndex })
    }
  }

  handleKeyDown = ::this.handleKeyDown
  handleKeyDown(event) {
    const { key, which, shiftKey } = event
    switch (key) {

      case 'Backspace':
        if (this.state.search.length) {
          this.setState({
            search: []
          })
        } else {
          this.setState({
            [`activeListIndex${this.state.activePaneIndex}`]: 0
          })
        }
        break

      case 'ArrowLeft':
        if (this.props.path !== '/') {
          this.setState({ [`activeListIndex${this.state.activePaneIndex}`]: 0, search: [] }, () => (
            this.context.router.transitionTo({
              pathname: `/${this.props.path.split('/').filter(Boolean).slice(0, -1).join('/')}`,
              state: { previousPath: decodeURI(this.props.path.slice(0, -1)) }
            })
          ))
        }
        break

      case ' ':
      case 'ArrowRight':
        if (this.filteredItems()[this.state[`activeListIndex${this.state.activePaneIndex}`]].type === 'directory') {
          this.context.router.transitionTo({
            pathname: `${this.props.path}${this.filteredItems()[this.state[`activeListIndex${this.state.activePaneIndex}`]].name}`,
          })
          this.setState({ [`activeListIndex${this.state.activePaneIndex}`]: 0, search: [] })
        }
        break

      case 'ArrowDown':
        event.preventDefault()
        this.setState({ [`activeListIndex${this.state.activePaneIndex}`]: wrap(this.state[`activeListIndex${this.state.activePaneIndex}`] + 1, this.filteredItems().length) })
        break

      case 'ArrowUp':
        event.preventDefault()
        this.setState({ [`activeListIndex${this.state.activePaneIndex}`]: wrap(this.state[`activeListIndex${this.state.activePaneIndex}`] - 1, this.filteredItems().length) })
        break

      case 'Enter':
        event.preventDefault()
        shell.openItem(
          this.filteredItems()[this.state[`activeListIndex${this.state.activePaneIndex}`]].path
        )
        break

      case 'Tab':
        let direction = shiftKey ? -1 : 1
        event.preventDefault()
        this.setState({
          activePaneIndex: wrap(this.state.activePaneIndex + direction, 2)
        })
        break

      default:
        if (which >= 48 && which <= 57 ||
            which >= 65 && which <= 90) {
          this.setState({
            [`activeListIndex${this.state.activePaneIndex}`]: 0,
            search: [...this.state.search, key.toLowerCase()]
          })
        } else {
          console.log('unhandled key:', key)
        }
        break
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  filteredItems(items = this.props.items) {
    items = items
      .filter(({ name }) => !name.startsWith('.'))
      .sort(({ name: nameA }, { name: nameB }) => (
        nameA.toLowerCase() < nameB.toLowerCase() ? -1 : 1
      ))

    return this.state.search.length
       ? filter(items, this.state.search.join(''), { key: 'name' })
       : items
  }

  render() {
    let name = ''
    if (this.filteredItems().length) {
      name = highlightMatch(
        this.filteredItems()[this.state.activeListIndex0].name,
        this.state.search.join('')
      )
    }

    console.log(this.state);
    return (
      <Flex className={css.container} direction='column'>
        <Flex shrink={0} justifyContent='center' className={css.sentence}>

          {this.filteredItems()[this.state.activeListIndex0] ? (
            <Pane active={this.state.activePaneIndex === 0}>
              <Icon path={this.filteredItems()[this.state.activeListIndex0].path} size={128} />
              <div className={css.sentenceObjectLabel} dangerouslySetInnerHTML={{ __html: name }} />
            </Pane>
          ) : (
            <Pane active={this.state.activePaneIndex === 0}>
              <img src={require('search.png')} />
              <div className={css.sentenceObjectLabel}>
                No Result
              </div>
            </Pane>
          )}

          <Pane active={this.state.activePaneIndex === 1}>
            <div style={{ width: 128, height: 128 }}>
              <img width={128} height={128} src={require('defaultAction.png')} />
            </div>
            <div className={css.sentenceObjectLabel}>
              Open
            </div>
          </Pane>

        </Flex>

        <Flex grow={1}>
          {this.state.activePaneIndex === 0 &&
            <QTList
              loading={this.props.loading}
              didSearch={this.state.search.length > 0}
              items={this.filteredItems()}
              selectedIndex={this.state[`activeListIndex${this.state.activePaneIndex}`]}
              onIndexChange={index => this.setState({ index })}
            />
          }

          {this.state.activePaneIndex === 1 &&
            <Pinky promise={getActions(this.filteredItems()[this.state[`activeListIndex${this.state.activePaneIndex}`]].path)}>
              {({ pending, resolved, rejected }) => (
                <QTList
                  loading={pending}
                  didSearch={this.state.search.length > 0}
                  items={resolved}
                  selectedIndex={this.state[`activeListIndex${this.state.activePaneIndex}`]}
                  onIndexChange={index => this.setState({ index })}
                />
              )}
            </Pinky>
          }
        </Flex>
      </Flex>
    )
  }
}

export default App
