
import React from 'react'
import { routerContext as routerContextType } from 'react-router/PropTypes'
import { filter } from 'fuzzaldrin-plus'
import Flex from 'flex-component'
import { shell } from 'electron'

import Icon from 'components/Icon'
import QTList from 'components/QTList/QTList'
import highlightMatch from 'highlightMatch'

import css from './App.scss'

const wrap = (value, bounds) => (value % bounds + bounds) % bounds

class App extends React.Component {

  static contextTypes = {
    router: routerContextType
  }

  state = {
    index: 0,
    search: []
  }

  componentWillReceiveProps({ previousPath, items }) {
    let previousIndex = this.filteredItems(items).findIndex(({ path }) => previousPath === path)
    if (previousIndex !== -1) {
      this.setState({ index: previousIndex })
    }
  }

  handleKeyDown = ::this.handleKeyDown
  handleKeyDown(event) {
    const { key, which } = event
    switch (key) {

      case 'Backspace':
        this.setState({
          search: []
        })
        break

      case 'ArrowLeft':
        if (this.props.path !== '/') {
          this.setState({ index: 0, search: [] }, () => (
            this.context.router.transitionTo({
              pathname: `/${this.props.path.split('/').filter(Boolean).slice(0, -1).join('/')}`,
              state: { previousPath: decodeURI(this.props.path.slice(0, -1)) }
            })
          ))
        }
        break

      case ' ':
      case 'ArrowRight':
        if (this.filteredItems()[this.state.index].type === 'directory') {
          this.context.router.transitionTo({
            pathname: `${this.props.path}${this.filteredItems()[this.state.index].name}`,
          })
          this.setState({ index: 0, search: [] })
        }
        break

      case 'ArrowDown':
        event.preventDefault()
        this.setState({ index: wrap(this.state.index + 1, this.filteredItems().length) })
        break

      case 'ArrowUp':
        event.preventDefault()
        this.setState({ index: wrap(this.state.index - 1, this.filteredItems().length) })
        break

      case 'Enter':
        event.preventDefault()
        shell.openItem(
          this.filteredItems()[this.state.index].path
        )
        break

      default:
        if (which >= 48 && which <= 57 ||
            which >= 65 && which <= 90) {
          this.setState({
            index: 0,
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
    items = items.filter(({ name }) => !name.startsWith('.'))
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
        this.filteredItems()[this.state.index].name,
        this.state.search.join('')
      )
    }

    return (
      <Flex className={css.container} direction='column'>
        <Flex shrink={0} justifyContent='center' className={css.sentence}>

          <Flex grow={1} basis='0' className={css.sentenceFragment} alignItems='center' justifyContent='center' direction='column'>

            {this.filteredItems()[this.state.index] && (
              <Icon path={this.filteredItems()[this.state.index].path} size={128} />
            )}

            <div className={css.sentenceObjectLabel} dangerouslySetInnerHTML={{ __html: name }} />
          </Flex>

          <Flex grow={1} basis='0' className={css.sentenceFragment} alignItems='center' justifyContent='center' direction='column'>
            <div style={{ width: 128, height: 128 }}>
              <img width={128} height={128} src={require('defaultAction.png')} />
            </div>
            <div className={css.sentenceObjectLabel}>
              Open
            </div>
          </Flex>

        </Flex>

        <Flex grow={1}>
          <QTList
            loading={this.props.loading}
            didSearch={this.state.search.length > 0}
            items={this.filteredItems()}
            selectedIndex={this.state.index}
            onIndexChange={index => this.setState({ index })}
          />
        </Flex>
      </Flex>
    )
  }
}

export default App
