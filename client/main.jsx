import React from 'react';
import { Provider } from 'react-redux';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tracker } from 'meteor/tracker';
import { render } from 'react-dom';
import { Actions } from '/imports/collections';
import { Game } from '/imports/components/game';
import { setUserId } from '/imports/actions';
import { store } from './store';

Meteor.startup(() => {
  const userId = getUserIdCookie();

  if (userId) {
    store.dispatch({ ...setUserId(userId), meteor: { skip: true }});
  }

  render(
    <Provider store={store}>
      <Game onCookieRequested={createUserIdCookie}/>
    </Provider>,
    document.getElementById('render-target')
  );

  // ----------------------------------------
  // --- track actions coming from server ---
  // ----------------------------------------

  Tracker.autorun(function () {
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
  for (let chunk of document.cookie.split(/\s*;\s*/)) {
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


