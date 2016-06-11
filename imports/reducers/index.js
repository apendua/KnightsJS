/*jshint -W138*/

import { actorsReducer } from './actors';
import { obstaclesReducer } from './obstacles';
import {
    START_GAME,
    NEXT_ACTOR,
    SET_USER_ID,
    SET_PRELOADING,

    CLAIM_ATTACKING_TEAM,
    CLAIM_DEFENDING_TEAM,

    NEW_GAME_CREATED,
    BEGIN_ACTOR_MOVE,
    FINISH_ACTOR_MOVE,
    BEGIN_ACTOR_ATTACK,
    FINISH_ACTOR_ATTACK,

  } from '/imports/actions';

import { MAP_COLUMNS, MAP_ROWS } from '/imports/constants';

export const rootReducer = (state = {
  
  currentGameId: '',
  currentActor : -1,
  currentRound : -1,
  actorHasMoved: true,
  isPreloading : false,
  attackerId   : '',
  defenderId   : '',
  userId       : '',
  nRows        : MAP_ROWS,
  nColumns     : MAP_COLUMNS,

}, action) => {

  if ([

      BEGIN_ACTOR_MOVE,
      FINISH_ACTOR_MOVE,

    ].indexOf(action.type) >= 0 && action.actorIdx !== state.currentActor) {

    // NOTE: We are ignoring this action because it's probably deprecated.
    return state;
  }

  switch (action.type) {

    case SET_USER_ID:

      return {
        ...state,
        userId: action.userId,
      };

    case SET_PRELOADING: 

      return {
        ...state,
        isPreloading: !!action.value
      };

    case CLAIM_ATTACKING_TEAM:

      if (!action.userId) return state;
      if (state.attackerId) return state;
      if (state.defenderId) {
        return { // also, start the game
          ...state,
          attackerId   : action.userId,
          actorHasMoved: false,
          currentActor : findNextActor(-1, state.actors),
          currentRound : 0,
        };
      } else {
        return {
          ...state,
          attackerId: action.userId
        };
      }

    case CLAIM_DEFENDING_TEAM:

      if (!action.userId) return state;
      if (state.defenderId) return state;
      if (state.attackerId) {
        return { // also, start the game
          ...state,
          defenderId   : action.userId,
          actorHasMoved: false,
          currentActor : findNextActor(-1, state.actors),
          currentRound : 0,
        };
      } else {
        return {
          ...state,
          defenderId: action.userId
        };
      }

    // NOTE: This actions is pretty much deprecated ...
    case START_GAME:

      if (state.currentRound > 0) return state;
      return {
        ...state,

        currentActor: findNextActor(-1, state.actors),
        currentRound: 0,
      };

    case NEXT_ACTOR:
      // NOTE: Check if the game has already started.
      if (state.currentRound < 0) return state;

      const nextActor = findNextActor(state.currentActor, state.actors);
      return {
        ...state,
        actorHasMoved : false,
        currentActor  : nextActor,
        currentRound  : nextActor < state.currentActor ? state.currentRound + 1 : state.currentRound,
      };

    case BEGIN_ACTOR_MOVE:

      return { ...state,

        actors        : actorsReducer(state.actors, action),
        actorHasMoved : true,
      };

    case FINISH_ACTOR_MOVE:

      return { ...state,

        actors : actorsReducer(state.actors, action),
      };

    case BEGIN_ACTOR_ATTACK:

      return { ...state,

        actors        : actorsReducer(state.actors, action),
        actorHasMoved : true,
      };

    case FINISH_ACTOR_ATTACK:

      return { ...state,

        actors : actorsReducer(state.actors, action),
      };

    case NEW_GAME_CREATED:

      return { ...state,

        // NOTE: We are not messing with the current userId

        currentGameId: action.gameId || '',
        currentActor : -1,
        currentRound : -1,
        actorHasMoved:true,
        attackerId   : '',
        defenderId   : '',
        nRows        : action.nRows,
        nColumns     : action.nColumns,

        obstacles    : obstaclesReducer(state.obstacles, action),
        actors       : actorsReducer(state.actors, action),
      };

    default:

      return {
        ...state,

        obstacles : obstaclesReducer(state.obstacles, action),
        actors    : actorsReducer(state.actors, action),
      };
  }

};

/**
 * Return the index of the next actor which is still alive.
 *
 * @param {Number} currentActor
 * @param {Object[]} allActors
 */
function findNextActor (currentActor, allActors) {
  if (!allActors) {
    return -1;
  }
  for (let i=currentActor+1; i < allActors.length; i+=1) {
    const actor = allActors[i];
    if (actor.totalHealth > 0) {
      return i;
    }
  }
  if (currentActor < 0) {
    return -1;
  }
  return findNextActor(-1, allActors);
}


