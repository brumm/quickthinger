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
      <Loader size={this.props.listItemHeight - 20} />
    </Flex>
  )

  noRowsRenderer = () => (
    <Flex
      className={css.listItemEmpty}
      justifyContent='center' alignItems='center'
    >
      {this.props.didSearch ? 'No Result' : 'Nada'}
    </Flex>
  )

  componentWillReceiveProps({activePaneName}) {
    if (this.props.activePaneName !== activePaneName) {
      this.List.forceUpdateGrid()
    }
  }

  rowRenderer = ({ key, index, style}) => {
    const item = this.props.items[index]
    return (
      <Flex
        key={key}
        style={style}
        alignItems='center'
        onClick={() => this.props.onIndexChange(index)}
        className={index === this.props.selectedIndex
          ? css.listItemSelected
          : index % 2
            ? css.listItem
            : css.listItemOdd}
      >
        <Icon path={item.icon} size={32} style={{ marginRight: 10 }} />

        <div>
          <div className={css.name}>
            {item.name}
          </div>

          <Flex>
            {item.details ? ([
              <div key='path' className={css.path}>{item.details}</div>,
            ]) : item.path ? ([
              <div key='path' className={css.path}>{item.path.replace(item.name, '')}</div>,
              <div key='name' style={{ flexShrink: 0 }} className={css.path}>{item.name}</div>,
            ]) : null}
          </Flex>
        </div>

        <div className={css.descendableIndicator} style={{
          visibility: item.providesChildren ? 'visible' : 'hidden'
        }}>
          {'ᐳ'}
        </div>
      </Flex>
    )
  }

  render() {
    const {
      items,
      listItemHeight,
      loading,
      selectedIndex,
      onDidListHeightChange,
      listHeight
    } = this.props

    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            ref={component => this.List = component}
            className={css.list}
            width={width}
            height={listHeight}
            rowCount={items.length}
            rowHeight={listItemHeight}
            noRowsRenderer={loading ? this.loadingRenderer : this.noRowsRenderer}
            rowRenderer={this.rowRenderer}
            scrollToIndex={selectedIndex}
            scrollToAlignment='center'
            overscanRowCount={0}
            tabIndex={null}
          />
        )}
      </AutoSizer>
    )
  }
}
