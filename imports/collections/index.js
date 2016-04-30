import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Actions = new Mongo.Collection('actions');
const Games = new Mongo.Collection('games');

Games.attachSchema(new SimpleSchema({
  currentIndex: { type: Number }
}));

Actions.attachSchema(new SimpleSchema({
  gameId    : { type: String },
  index     : { type: Number },
  rawAction : { type: Object, blackbox: true },
}));

export { Games as Games };
export { Actions as Actions };
