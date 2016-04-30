import { Meteor } from 'meteor/meteor';

/**
 * Unless "action.meteor.skip === true" call Meteor method instead of
 * passing the action down the middleware stack.
 */
export const meteorMiddleware = store => next => action => {
  if (typeof action !== 'object' || action.meteor && action.meteor.skip) {
    return next(action);
  }
  const gameId = store.getState().currentGameId;
  Meteor.call('addActionToGame', gameId, action);
};
