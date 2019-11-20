import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { WindowScroller, Grid } from 'react-virtualized';
import { sortDirections } from 'Helpers/Props';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import styles from './VirtualTable.css';

const ROW_HEIGHT = 38;

function overscanIndicesGetter(options) {
  const {
    cellCount,
    overscanCellsCount,
    startIndex,
    stopIndex
  } = options;

  // The default getter takes the scroll direction into account,
  // but that can cause issues. Ignore the scroll direction and
  // always over return more items.

  const overscanStartIndex = startIndex - overscanCellsCount;
  const overscanStopIndex = stopIndex + overscanCellsCount;

  return {
    overscanStartIndex: Math.max(0, overscanStartIndex),
    overscanStopIndex: Math.min(cellCount - 1, overscanStopIndex)
  };
}

class VirtualTable extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._grid = null;
  }

  componentDidUpdate(prevProps, prevState) {

    const {
      items,
      filters,
      sortKey,
      sortDirection,
      scrollIndex
    } = this.props;

    const itemsChanged = hasDifferentItemsOrOrder(prevProps.items, items);

    if (
      prevProps.filters !== filters ||
      prevProps.sortKey !== sortKey ||
      prevProps.sortDirection !== sortDirection ||
      itemsChanged
    ) {
      this._grid.recomputeGridSize();
    }

    if (scrollIndex != null && scrollIndex !== prevProps.scrollIndex) {
      this._grid.scrollToCell({
        rowIndex: scrollIndex,
        columnIndex: 0
      });
    }
  }

  //
  // Control

  setGridRef = (ref) => {
    this._grid = ref;
  }

  //
  // Render

  render() {
    const {
      className,
      items,
      scroller,
      header,
      headerHeight,
      rowRenderer,
      ...otherProps
    } = this.props;

    return (
      <WindowScroller
        scrollElement={scroller}
      >
        {({ width, height, registerChild, onChildScroll, scrollTop }) => {
          return (
            <>
              {header}
              <div ref={registerChild}>
                <Grid
                  ref={this.setGridRef}
                  autoContainerWidth={true}
                  width={width}
                  height={height}
                  headerHeight={height - headerHeight}
                  rowHeight={ROW_HEIGHT}
                  rowCount={items.length}
                  columnCount={1}
                  scrollTop={scrollTop}
                  onScroll={onChildScroll}
                  autoHeight={true}
                  autoWidth={true}
                  overscanRowCount={2}
                  cellRenderer={rowRenderer}
                  columnWidth={width}
                  overscanIndicesGetter={overscanIndicesGetter}
                  scrollToAlignment={'start'}
                  isScrollingOptout={true}
                  className={styles.tableBodyContainer}
                  style={{
                    boxSizing: undefined,
                    direction: undefined,
                    height: undefined,
                    position: undefined,
                    willChange: undefined,
                    overflow: undefined,
                    width: undefined
                  }}
                  containerStyle={{
                    position: undefined
                  }}
                  items={items} // unused but pass to ensure update on change
                  {...otherProps}
                />
              </div>
            </>
          );
        }
        }
      </WindowScroller>
    );
  }
}

VirtualTable.propTypes = {
  className: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.arrayOf(PropTypes.object),
  sortKey: PropTypes.string,
  sortDirection: PropTypes.oneOf(sortDirections.all),
  scrollIndex: PropTypes.number,
  scroller: PropTypes.instanceOf(Element).isRequired,
  header: PropTypes.node.isRequired,
  headerHeight: PropTypes.number.isRequired,
  rowRenderer: PropTypes.func.isRequired
};

VirtualTable.defaultProps = {
  className: styles.tableContainer,
  headerHeight: 38
};

export default VirtualTable;
