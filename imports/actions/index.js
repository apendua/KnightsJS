import { TIMING_FRAMES_PER_SECOND, TIMING_MOVE_BY_ONE_FIELD } from '/imports/constants';

/**
 * Only useful to bypass creating game on the server.
 */
export const NEW_GAME_CREATED = 'NEW_GAME_CREATED';
function newGameCreated (gameSetup) {
  return {
    type : NEW_GAME_CREATED,
    ...gameSetup
  };
}

export const BEGIN_ACTOR_MOVE = 'BEGIN_ACTOR_MOVE';
function beginActorMove (actorIdx, movePath) {
  return {
    type     : BEGIN_ACTOR_MOVE,
    actorIdx : actorIdx,
    movePath : movePath,
    queue    : {},
  };
}

export const FINISH_ACTOR_MOVE = 'FINISH_ACTOR_MOVE';
function finishActorMove (actorIdx, delay) {
  return {
    type     : FINISH_ACTOR_MOVE,
    actorIdx : actorIdx,
    queue    : { delay: delay },
  };
}

export function moveActor (actor, movePath, oponent) {
  return (dispatch) => {
    const delay = TIMING_MOVE_BY_ONE_FIELD * (movePath.length - 1);
    
    dispatch(beginActorMove(actor.idx, movePath));
    dispatch(finishActorMove(actor.idx, delay));

    if (oponent) {
      
      dispatch(beginActorAttack(actor, oponent));
      dispatch(finishActorAttack(actor, oponent, 12 * 1000 / TIMING_FRAMES_PER_SECOND));

      // fight back!
      dispatch(beginActorAttack(oponent, actor, 500));
      dispatch(finishActorAttack(oponent, actor, 12 * 1000 / TIMING_FRAMES_PER_SECOND));
    }

    dispatch({ type: NEXT_ACTOR });
  };
}

export const BEGIN_ACTOR_ATTACK = 'BEGIN_ACTOR_ATTACK';
function beginActorAttack (actor, oponent, delay) {
  return {
    type       : BEGIN_ACTOR_ATTACK,
    actorIdx   : actor.idx,
    oponentIdx : oponent.idx,
    queue      : { delay: delay || 0 },
  };
}

export const FINISH_ACTOR_ATTACK = 'FINISH_ACTOR_ATTACK';
function finishActorAttack (actor, oponent, delay) {
  return {
    type       : FINISH_ACTOR_ATTACK,
    actorIdx   : actor.idx,
    oponentIdx : oponent.idx,
    queue      : { delay: delay || 0 },
  };
}

export const NEXT_ACTOR = 'NEXT_ACTOR';
export function nextActor() {
  return {
    type: NEXT_ACTOR,
    queue: { noWait: true },
  };
}

export const SKIP_ANIMATION = 'SKIP_ANIMATION';
export function skipAnimation() {
  return {
    type: SKIP_ANIMATION,
    queue: { noWait: true },
  };
}

export const START_GAME = 'START_GAME';
export function startGame () {
  return {
    type : START_GAME,
  };
}

export const SET_PRELOADING = 'SET_PRELOADING';
export function setPreloading (value) {
  return {
    type   : SET_PRELOADING,
    value  : !!value,
    meteor : { skip: true },
  };
}

export const SET_USER_ID = 'SET_USER_ID';
export function setUserId (userId) {
  return {
    type   : SET_USER_ID,
    userId : userId,
  };
}

export const CLAIM_ATTACKING_TEAM = 'CLAIM_ATTACKING_TEAM';
export function claimAttackingTeam () {
  return function (dispatch, getState) {
    const { userId } = getState();
    dispatch({
      type   : CLAIM_ATTACKING_TEAM,
      userId : userId,
    });
  };
}

export const CLAIM_DEFENDING_TEAM = 'CLAIM_DEFENDING_TEAM';
export function claimDefendingTeam () {
  return function (dispatch, getState) {
    const { userId } = getState();
    dispatch({
      type   : CLAIM_DEFENDING_TEAM,
      userId : userId,
    });
  };
}



