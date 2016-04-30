import { NEW_GAME_CREATED } from '/imports/actions';

export const obstaclesReducer = (state = [], action) => {

  switch (action.type) {
    case NEW_GAME_CREATED:
      return action.obstacles.map(({ row, column }) => ({ row, column }));

    default:
      return state;
  }

};
