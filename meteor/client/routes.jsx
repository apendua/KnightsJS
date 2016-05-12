import { FlowRouter } from 'meteor/kadira:flow-router';

FlowRouter.route('/', {
  name: 'landing'
});

FlowRouter.route('/game/:gameId', {
  name: 'game'
});
