import React from 'react'
import { List, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import Flex from 'flex-component'
import { remote } from 'electron'
import Loader from 'components/Loader'
import Icon from 'components/Icon'

import css from './QTList.scss'

const electronWindow = remote.getCurrentWindow()

export default class QTList extends React.Component {

  static defaultProps = {
    listItemHeight: 50
  }

  loadingRenderer = () => (
    <Flex className={css.listItemEmpty} justifyContent='center' alignItems='center'>
      <Loader />
    </Flex>
  )

  noRowsRenderer = () => (
    <Flex className={css.listItemEmpty} style={{ height: this.props.listItemHeight }} justifyContent='center' alignItems='center'>
      {this.props.didSearch ? 'No Result' : 'This folder is empty'}
    </Flex>
  )

  rowRenderer = ({ key, index, style}) => (
    <Flex
      alignItems='center'
      key={key}
      style={style}
      className={index === this.props.selectedIndex
        ? css.listItemSelected
        : index % 2 ? css.listItem : css.listItemOdd}
      onClick={() => this.props.onIndexChange(index)}
    >
      <Icon path={this.props.items[index].path} size={32} style={{ marginRight: 10 }} />

      <div>
        <div className={css.name}>{this.props.items[index].name}</div>
        <Flex>
          <div className={css.path}>{this.props.items[index].path.replace(this.props.items[index].name, '')}</div>
          <div style={{ flexShrink: 0 }} className={css.path}>{this.props.items[index].name}</div>
        </Flex>
      </div>

      <div style={{visibility: this.props.items[index].type === 'directory' ? 'visible' : 'hidden', paddingLeft: 15, flexShrink: 0, color: index === this.props.selectedIndex ? 'rgba(0, 0, 0, 0.5)' : '#e7e7e7', marginLeft: 'auto'}}>
        {'ᐳ'}
      </div>
    </Flex>
  )

  render() {
    let listHeight = Math.min(this.props.items.length * this.props.listItemHeight, 4.5 * this.props.listItemHeight)
    if (!this.props.loading) {
      electronWindow.setSize(window.innerWidth, listHeight + 185)
    }
    return (
      <AutoSizer>
        {({ width, height }) => (
          <List
            className={css.list}
            width={width}
            height={listHeight}
            rowCount={this.props.items.length}
            rowHeight={this.props.listItemHeight}
            noRowsRenderer={this.props.loading ? this.loadingRenderer : undefined}
            rowRenderer={this.rowRenderer}
            scrollToIndex={this.props.selectedIndex}
            tabIndex={null}
          />
        )}
      </AutoSizer>
    )
  }
}
