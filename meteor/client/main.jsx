import React from 'react';
import { Provider } from 'react-redux';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tracker } from 'meteor/tracker';
import { render } from 'react-dom';
import { Actions } from '/imports/collections';
import { Game } from '/imports/components/game';
import { setUserId, setPreloading } from '/imports/actions';
import { store } from './store';

Meteor.startup(() => {
  const userId = getUserIdCookie();

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

  // ----------------------------------------
  // --- track actions coming from server ---
  // ----------------------------------------

  Tracker.autorun(function () {
    const gameId = FlowRouter.getParam('gameId');
    
    if (gameId) {
      store.dispatch(setPreloading(true));
      Meteor.subscribe('actionsForGame', gameId, () => {
        store.dispatch(setPreloading(false));
      });
    }

    Actions.find({
      gameId: FlowRouter.getParam('gameId'),

    }, { sort: { index: 1 }}).observeChanges({
      added: function (id, fields) {
        store.dispatch({ ...fields.rawAction, meteor: { skip: true } });
      }
    });
  });

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

/**
 * Create a random userId and set the cookie.
 */
function createUserIdCookie () {
  const userId = Random.id();
  const expires = Date.now() + 1000 * 3600 * 24 * 7; // 7 days
  document.cookie = 'userId=' + userId + ';expires=' + new Date(expires).toUTCString();
  store.dispatch({ ...setUserId(userId), meteor: { skip: true }});
}

function createNewGame () {
  return new Promise(resolve => {

    Meteor.call('createNewGame', (err, res) => {
      if (err) {
        console.error(err);
      } else {
        resolve(res);
      }
    });

  }).then(gameId => {
    FlowRouter.go('game', { gameId });
  });
}


