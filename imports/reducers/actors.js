/*jshint -W138*/

import { actorReducer } from './actor';
import { NEW_GAME_CREATED, BEGIN_ACTOR_ATTACK, FINISH_ACTOR_ATTACK } from '/imports/actions';
import { getDirection } from '/imports/helpers/neighbors';

export const actorsReducer = (state = [], action) => {

  switch (action.type) {

    case NEW_GAME_CREATED:
      
      if (action.actors) {
        return action.actors.map((rawActor, idx) => {
          return {

            idx    : idx,
            type   : rawActor.type,
            side   : rawActor.side, // attacker or defender?

            // position

            row    : rawActor.row,
            column : rawActor.column,

            // attributes

            speed       : rawActor.speed,
            strength    : rawActor.strength,
            toughness   : rawActor.toughness,

            // status

            totalHealth : rawActor.amount * rawActor.toughness,
          };
        });
      } else {
        return [];
      }

    case BEGIN_ACTOR_ATTACK:
    case FINISH_ACTOR_ATTACK:

      const actor   = state[action.actorIdx];
      const oponent = state[action.oponentIdx];

      // NOTE: Does it make sense to do these types of things in a middleware?
      const attackPower = actor.strength * Math.ceil(actor.totalHealth / actor.toughness);

      if (attackPower <= 0) { // nothing happens if the actor is dead
        return state;
      }

      action = {

        ...action,

        direction   : getDirection(actor, oponent),
        attackPower : attackPower,
        isFinishing : attackPower >= oponent.totalHealth,
      };

      return state.map(actor => actorReducer(actor, action));

    default:
      return state.map(actor => actorReducer(actor, action));
  }

};


