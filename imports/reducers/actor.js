
import {
  BEGIN_ACTOR_MOVE,
  FINISH_ACTOR_MOVE,
  BEGIN_ACTOR_ATTACK,
  FINISH_ACTOR_ATTACK } from '/imports/actions';

export const actorReducer = (state = {}, action) => {

  // it's a dead actor!
  if (state.totalHealth === 0) {
    return state;
  }

  switch (action.type) {

    case BEGIN_ACTOR_MOVE:

      if (state.idx !== action.actorIdx) {
        return state;
      }

      return {
        ...state,

        movePath : action.movePath,
      };

    case FINISH_ACTOR_MOVE:

      if (state.idx !== action.actorIdx || !state.movePath || state.movePath.length === 0) {
        return state;
      }

      const lastOnPath = state.movePath[state.movePath.length-1];

      return {
        ...state,

        movePath : null, // or []?
        row      : lastOnPath.row,
        column   : lastOnPath.column,
      };

    case BEGIN_ACTOR_ATTACK:

      if (state.idx === action.actorIdx) {

        return {
          ...state,

          isAttacking : true,
          isFinishing : action.isFinishing,
          direction   : action.direction,
        };

      } else if (state.idx === action.oponentIdx) {

        return {
          ...state,

          isHit     : true,
          isDying   : action.isFinishing,
          direction : action.direction > 0 ? action.direction - 4 : action.direction + 4,
        };

      } else {
        return state;
      }

    case FINISH_ACTOR_ATTACK:

      if (state.idx === action.actorIdx) {

        return {
          ...state,

          isAttacking : false,
          isFinishing : false,
          direction   : 0,
        };

      } else if (state.idx === action.oponentIdx) {

        return {
          ...state,

          isHit       : false,
          isDying     : false,
          totalHealth : Math.max(0, state.totalHealth - action.attackPower),
          direction   : action.isFinishing ? state.direction : 0,
        };

      } else {
        return state;
      }

    default:
      return state;
  }
};
