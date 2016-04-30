import { Meteor } from 'meteor/meteor';
import { Games, Actions } from '/imports/collections';
import { generateGame } from '/imports/helpers/generators';
import { NEW_GAME_CREATED } from '/imports/actions';
import { MAP_ROWS, MAP_COLUMNS } from '/imports/constants';

Meteor.publish('actionsForGame', function (gameId) {
  return Actions.find({ gameId }, { sort: { index: 1 }});
});

Meteor.methods({

  'addActionToGame': function (gameId, rawAction) {
    const game = Games.findOne({_id: gameId});
    if (!game) {
      throw new Meteor.Error(400, 'Game not found.');
    }
    let currentIndex = game.currentIndex;
    let success = false;

    while (!success) {
      success = !!Games.update({ _id: gameId, currentIndex }, { $set: { currentIndex: currentIndex + 1 }});
      currentIndex += 1;
    }

    return Actions.insert({
      gameId, rawAction, index: currentIndex
    });
  },

  'createNewGame': function () {
    const gameId = Games.insert({ currentIndex: -1 });
    Meteor.call('addActionToGame', gameId, {
      type: NEW_GAME_CREATED,
      gameId,
      ...generateGame(MAP_ROWS, MAP_COLUMNS)
    });
    return gameId;
  },

});
