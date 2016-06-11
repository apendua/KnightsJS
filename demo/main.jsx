import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { Game } from '/imports/components/game.jsx';
import { setUserId } from '/imports/actions';
import { randomId } from '/imports/helpers/random';
import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { createQueue } from '/imports/middleware/reduxQueue';
import { rootReducer } from '/imports/reducers';
import { NEW_GAME_CREATED } from '/imports/actions';
import { MAP_ROWS, MAP_COLUMNS } from '/imports/constants';
import { generateGame } from '/imports/helpers/generators';
import "./main.less";

const queueMiddleware = createQueue();
const loggerMiddleware = createLogger();
const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    queueMiddleware,
    loggerMiddleware
  )
);

startup(() => {
  const userId = randomId();

  if (userId) {
    store.dispatch({ ...setUserId(userId), meteor: { skip: true }});
  }

  render(
    <Provider store={store}>
      <Game
        onCookieRequested  = {createUserIdCookie}
        onNewGameRequested = {createNewGame}
      />
    </Provider>,
    document.getElementById('render-target')
  );

});

/**
 * Return current userId if cookie is set.
 */
function getUserIdCookie () {
  for (const chunk of document.cookie.split(/\s*;\s*/)) {
    const data = chunk.split('=');
    if (data[0] === 'userId') {
      return data[1];
    }
  }
  return '';
}

function startup(action) {
  action();
}

/**
 * Create a random userId and set the cookie.
 */
function createUserIdCookie () {
  const userId = randomId();
  const expires = Date.now() + 1000 * 3600 * 24 * 7; // 7 days
  document.cookie = 'userId=' + userId + ';expires=' + new Date(expires).toUTCString();
  store.dispatch({ ...setUserId(userId), meteor: { skip: true }});
}

function createNewGame () {
  return new Promise(resolve => {
    setTimeout(() => {
      const gameId = randomId();
      store.dispatch({
        type: NEW_GAME_CREATED,
        gameId,
        ...generateGame(MAP_ROWS, MAP_COLUMNS)
      });
      resolve(gameId);
    }, 1000);
  });
}


