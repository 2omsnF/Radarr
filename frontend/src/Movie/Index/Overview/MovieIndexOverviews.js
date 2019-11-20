import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Grid, WindowScroller } from 'react-virtualized';
import getIndexOfFirstCharacter from 'Utilities/Array/getIndexOfFirstCharacter';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import dimensions from 'Styles/Variables/dimensions';
import { sortDirections } from 'Helpers/Props';
import Measure from 'Components/Measure';
import MovieIndexItemConnector from 'Movie/Index/MovieIndexItemConnector';
import MovieIndexOverview from './MovieIndexOverview';
import styles from './MovieIndexOverviews.css';

// Poster container dimensions
const columnPadding = parseInt(dimensions.movieIndexColumnPadding);
const columnPaddingSmallScreen = parseInt(dimensions.movieIndexColumnPaddingSmallScreen);
const progressBarHeight = parseInt(dimensions.progressBarSmallHeight);
const detailedProgressBarHeight = parseInt(dimensions.progressBarMediumHeight);

function calculatePosterWidth(posterSize, isSmallScreen) {
  const maxiumPosterWidth = isSmallScreen ? 152 : 162;

  if (posterSize === 'large') {
    return maxiumPosterWidth;
  }

  if (posterSize === 'medium') {
    return Math.floor(maxiumPosterWidth * 0.75);
  }

  return Math.floor(maxiumPosterWidth * 0.5);
}

function calculateRowHeight(posterHeight, sortKey, isSmallScreen, overviewOptions) {
  const {
    detailedProgressBar
  } = overviewOptions;

  const heights = [
    posterHeight,
    detailedProgressBar ? detailedProgressBarHeight : progressBarHeight,
    isSmallScreen ? columnPaddingSmallScreen : columnPadding
  ];

  return heights.reduce((acc, height) => acc + height, 0);
}

function calculatePosterHeight(posterWidth) {
  return Math.ceil((250 / 170) * posterWidth);
}

class MovieIndexOverviews extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      width: 0,
      columnCount: 1,
      posterWidth: 162,
      posterHeight: 238,
      rowHeight: calculateRowHeight(238, null, props.isSmallScreen, {})
    };

    this._grid = null;
  }

  componentDidUpdate(prevProps) {
    const {
      items,
      filters,
      sortKey,
      sortDirection,
      overviewOptions,
      jumpToCharacter
    } = this.props;

    const itemsChanged = hasDifferentItemsOrOrder(prevProps.items, items);
    const overviewOptionsChanged = !_.isMatch(prevProps.overviewOptions, overviewOptions);

    if (
      prevProps.sortKey !== sortKey ||
      prevProps.overviewOptions !== overviewOptions ||
      itemsChanged
    ) {
      this.calculateGrid();
    }

    if (
      prevProps.filters !== filters ||
      prevProps.sortKey !== sortKey ||
      prevProps.sortDirection !== sortDirection ||
      itemsChanged ||
      overviewOptionsChanged
    ) {
      this._grid.recomputeGridSize();
    }

    if (jumpToCharacter != null && jumpToCharacter !== prevProps.jumpToCharacter) {
      const index = getIndexOfFirstCharacter(items, jumpToCharacter);

      if (this._grid && index != null) {

        this._grid.scrollToCell({
          rowIndex: index,
          columnIndex: 0
        });
      }
    }
  }

  //
  // Control

  setGridRef = (ref) => {
    this._grid = ref;
  }

  calculateGrid = (width = this.state.width, isSmallScreen) => {
    const {
      sortKey,
      overviewOptions
    } = this.props;

    const posterWidth = calculatePosterWidth(overviewOptions.size, isSmallScreen);
    const posterHeight = calculatePosterHeight(posterWidth);
    const rowHeight = calculateRowHeight(posterHeight, sortKey, isSmallScreen, overviewOptions);

    this.setState({
      width,
      posterWidth,
      posterHeight,
      rowHeight
    });
  }

  cellRenderer = ({ key, rowIndex, style }) => {
    const {
      items,
      sortKey,
      overviewOptions,
      showRelativeDates,
      shortDateFormat,
      longDateFormat,
      timeFormat,
      isSmallScreen,
      selectedState,
      isMovieEditorActive,
      onSelectedChange
    } = this.props;

    const {
      posterWidth,
      posterHeight,
      rowHeight
    } = this.state;

    const movie = items[rowIndex];

    if (!movie) {
      return null;
    }

    return (
      <div
        className={styles.container}
        key={key}
        style={style}
      >
        <MovieIndexItemConnector
          key={movie.id}
          component={MovieIndexOverview}
          sortKey={sortKey}
          posterWidth={posterWidth}
          posterHeight={posterHeight}
          rowHeight={rowHeight}
          overviewOptions={overviewOptions}
          showRelativeDates={showRelativeDates}
          shortDateFormat={shortDateFormat}
          longDateFormat={longDateFormat}
          timeFormat={timeFormat}
          isSmallScreen={isSmallScreen}
          movieId={movie.id}
          qualityProfileId={movie.qualityProfileId}
          isSelected={selectedState[movie.id]}
          onSelectedChange={onSelectedChange}
          isMovieEditorActive={isMovieEditorActive}
        />
      </div>
    );
  }

  //
  // Listeners

  onMeasure = ({ width }) => {
    this.calculateGrid(width, this.props.isSmallScreen);
  }

  //
  // Render

  render() {
    const {
      scroller,
      items,
      selectedState
    } = this.props;

    const {
      width,
      rowHeight
    } = this.state;

    return (
      <Measure
        whitelist={['width']}
        onMeasure={this.onMeasure}
      >
        <WindowScroller
          scrollElement={scroller}
        >
          {({ height, registerChild, onChildScroll, scrollTop }) => {
            return (
              <div ref={registerChild}>
                <Grid
                  ref={this.setGridRef}
                  className={styles.grid}
                  autoHeight={true}
                  height={height}
                  columnCount={1}
                  columnWidth={width}
                  rowCount={items.length}
                  rowHeight={rowHeight}
                  width={width}
                  onScroll={onChildScroll}
                  scrollTop={scrollTop}
                  overscanRowCount={2}
                  cellRenderer={this.cellRenderer}
                  selectedState={selectedState}
                  scrollToAlignment={'start'}
                  isScrollingOptout={true}
                />
              </div>
            );
          }
          }
        </WindowScroller>
      </Measure>
    );
  }
}

MovieIndexOverviews.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.oneOf(sortDirections.all),
  overviewOptions: PropTypes.object.isRequired,
  jumpToCharacter: PropTypes.string,
  scroller: PropTypes.instanceOf(Element).isRequired,
  showRelativeDates: PropTypes.bool.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  timeFormat: PropTypes.string.isRequired,
  selectedState: PropTypes.object.isRequired,
  onSelectedChange: PropTypes.func.isRequired,
  isMovieEditorActive: PropTypes.bool.isRequired
};

export default MovieIndexOverviews;
