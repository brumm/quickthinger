import React from 'react'
import { List, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import Flex from 'flex-component'

import Loader from 'components/Loader'

import css from './QTList.scss'

const LIST_ITEM_HEIGHT = 50

export default class QTList extends React.Component {

  loadingRenderer = () => (
    <Flex alignItems='center' justifyContent='center' className={css.loadingContainer}>
      <Loader />
    </Flex>
  )

  noRowsRenderer = () => (
    <Flex className={css.listItemEmpty} style={{ height: LIST_ITEM_HEIGHT }} justifyContent='center' alignItems='center'>
      This folder is empty
    </Flex>
  )

  rowRenderer = ({ key, index, style}) => (
    <Flex
      alignItems='center'
      key={key}
      style={{
        ...style,
        backgroundColor: index % 2 ? '#fafafa' : null
      }}
      className={index === this.props.selectedIndex ? css.listItemSelected : css.listItem}
      onClick={() => this.props.onIndexChange(index)}
    >
      <div>
        <div style={{ fontSize: 14 }}>{this.props.items[index].name}</div>
        <div style={{
          fontSize: 10,
          color: index === this.props.selectedIndex ? 'rgba(0, 0, 0, 0.5)' : '#454545',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>{this.props.items[index].path}</div>
      </div>

      {this.props.items[index].type === 'directory' &&
        <div style={{color: index === this.props.selectedIndex ? 'rgba(0, 0, 0, 0.5)' : '#e7e7e7', marginLeft: 'auto'}}>{'ᐳ'}</div>
      }
    </Flex>
  )

  render() {
    return (
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={this.props.items.length}
            rowHeight={LIST_ITEM_HEIGHT}
            noRowsRenderer={this.props.loading ? this.loadingRenderer : this.noRowsRenderer}
            rowRenderer={this.rowRenderer}
            scrollToIndex={this.props.selectedIndex}
            tabIndex={null}
          />
        )}
      </AutoSizer>
    )
  }
}
