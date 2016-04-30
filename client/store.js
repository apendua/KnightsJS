import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { createQueue } from '/imports/middleware/reduxQueue';
import { meteorMiddleware } from '/imports/middleware/reduxMeteor';

import { rootReducer } from '/imports/reducers';

const queueMiddleware = createQueue();
const loggerMiddleware = createLogger();

export const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    meteorMiddleware,
    queueMiddleware,
    loggerMiddleware
  )
);
