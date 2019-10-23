import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createMovieClientSideCollectionItemsSelector from 'Store/Selectors/createMovieClientSideCollectionItemsSelector';
import dimensions from 'Styles/Variables/dimensions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import { fetchRootFolders } from 'Store/Actions/settingsActions';
import scrollPositions from 'Store/scrollPositions';
import { setMovieSort, setMovieFilter, setMovieView, setMovieTableOption, saveMovieEditor } from 'Store/Actions/movieIndexActions';
import { executeCommand } from 'Store/Actions/commandActions';
import * as commandNames from 'Commands/commandNames';
import withScrollPosition from 'Components/withScrollPosition';
import MovieIndex from './MovieIndex';

const POSTERS_PADDING = 15;
const POSTERS_PADDING_SMALL_SCREEN = 5;
const TABLE_PADDING = parseInt(dimensions.pageContentBodyPadding);
const TABLE_PADDING_SMALL_SCREEN = parseInt(dimensions.pageContentBodyPaddingSmallScreen);

// If the scrollTop is greater than zero it needs to be offset
// by the padding so when it is set initially so it is correct
// after React Virtualized takes the padding into account.

function getScrollTop(view, scrollTop, isSmallScreen) {
  if (scrollTop === 0) {
    return 0;
  }

  let padding = isSmallScreen ? TABLE_PADDING_SMALL_SCREEN : TABLE_PADDING;

  if (view === 'posters') {
    padding = isSmallScreen ? POSTERS_PADDING_SMALL_SCREEN : POSTERS_PADDING;
  }

  return scrollTop + padding;
}

function createMapStateToProps() {
  return createSelector(
    createMovieClientSideCollectionItemsSelector('movieIndex'),
    createCommandExecutingSelector(commandNames.REFRESH_MOVIE),
    createCommandExecutingSelector(commandNames.RSS_SYNC),
    createCommandExecutingSelector(commandNames.RENAME_MOVIE),
    createCommandExecutingSelector(commandNames.CUTOFF_UNMET_MOVIES_SEARCH),
    createCommandExecutingSelector(commandNames.MISSING_MOVIES_SEARCH),
    createDimensionsSelector(),
    (
      movies,
      isRefreshingMovie,
      isRssSyncExecuting,
      isOrganizingMovie,
      isCutoffMoviesSearch,
      isMissingMoviesSearch,
      dimensionsState
    ) => {
      return {
        ...movies,
        isRefreshingMovie,
        isRssSyncExecuting,
        isOrganizingMovie,
        isSearchingMovies: isCutoffMoviesSearch || isMissingMoviesSearch,
        isSmallScreen: dimensionsState.isSmallScreen
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    dispatchFetchRootFolders() {
      dispatch(fetchRootFolders());
    },

    onTableOptionChange(payload) {
      dispatch(setMovieTableOption(payload));
    },

    onSortSelect(sortKey) {
      dispatch(setMovieSort({ sortKey }));
    },

    onFilterSelect(selectedFilterKey) {
      dispatch(setMovieFilter({ selectedFilterKey }));
    },

    dispatchSetMovieView(view) {
      dispatch(setMovieView({ view }));
    },

    dispatchSaveMovieEditor(payload) {
      dispatch(saveMovieEditor(payload));
    },

    onRefreshMoviePress() {
      dispatch(executeCommand({
        name: commandNames.REFRESH_MOVIE
      }));
    },

    onRssSyncPress() {
      dispatch(executeCommand({
        name: commandNames.RSS_SYNC
      }));
    },

    onSearchPress(command) {
      dispatch(executeCommand({
        name: command
      }));
    }
  };
}

class MovieIndexConnector extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    const {
      view,
      scrollTop,
      isSmallScreen
    } = props;

    this.state = {
      scrollTop: getScrollTop(view, scrollTop, isSmallScreen)
    };
  }

  componentDidMount() {
    // TODO: Fetch root folders here for now, but should eventually fetch on editor toggle and check loaded before showing controls
    this.props.dispatchFetchRootFolders();
  }

  //
  // Listeners

  onViewSelect = (view) => {
    // Reset the scroll position before changing the view
    this.setState({ scrollTop: 0 }, () => {
      this.props.dispatchSetMovieView(view);
    });
  }

  onSaveSelected = (payload) => {
    this.props.dispatchSaveMovieEditor(payload);
  }

  onScroll = ({ scrollTop }) => {
    this.setState({
      scrollTop
    }, () => {
      scrollPositions.movieIndex = scrollTop;
    });
  }

  //
  // Render

  render() {
    return (
      <MovieIndex
        {...this.props}
        scrollTop={this.state.scrollTop}
        onViewSelect={this.onViewSelect}
        onScroll={this.onScroll}
        onSaveSelected={this.onSaveSelected}
      />
    );
  }
}

MovieIndexConnector.propTypes = {
  isSmallScreen: PropTypes.bool.isRequired,
  view: PropTypes.string.isRequired,
  scrollTop: PropTypes.number.isRequired,
  dispatchFetchRootFolders: PropTypes.func.isRequired,
  dispatchSetMovieView: PropTypes.func.isRequired,
  dispatchSaveMovieEditor: PropTypes.func.isRequired
};

export default withScrollPosition(
  connect(createMapStateToProps, createMapDispatchToProps)(MovieIndexConnector),
  'movieIndex'
);
