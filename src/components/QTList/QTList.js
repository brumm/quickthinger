import React from 'react'
import { List, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import Flex from 'flex-component'

import Loader from 'components/Loader'
import Icon from 'components/Icon'

import css from './QTList.scss'

export default class QTList extends React.Component {

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

  rowRenderer = ({ key, index, style}) => {
    const item = this.props.items[index]
    return (
      <Flex
        alignItems='center'
        key={key}
        style={style}
        className={index === this.props.selectedIndex
          ? css.listItemSelected
          : index % 2 ? css.listItem : css.listItemOdd}
        onClick={() => this.props.onIndexChange(index)}
      >
        <Icon path={item.icon || item.path} size={32} style={{ marginRight: 10 }} />

        <div>
          <div className={css.name}>
            {item.displayName || item.name}
          </div>

          <Flex>
            {item.description ? ([
              <div key='path' className={css.path}>{item.description}</div>,
            ]) : item.path ? ([
              <div key='path' className={css.path}>{item.path.replace(item.name, '')}</div>,
              <div key='name' style={{ flexShrink: 0 }} className={css.path}>{item.name}</div>,
            ]) : null}
          </Flex>
        </div>

        {item.uti &&
          <div className={css.descendableIndicator} style={{visibility: item.uti.includes('public.folder') ? 'visible' : 'hidden'}}>
            {'ᐳ'}
          </div>
        }
      </Flex>
    )
  }

  render() {
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            className={css.list}
            width={width}
            height={this.props.height}
            rowCount={this.props.items.length}
            rowHeight={this.props.listItemHeight}
            noRowsRenderer={this.props.loading ? this.loadingRenderer : undefined}
            rowRenderer={this.rowRenderer}
            scrollToIndex={this.props.selectedIndex}
            scrollToAlignment='center'
            overscanRowCount={0}
            tabIndex={null}
          />
        )}
      </AutoSizer>
    )
  }
}
