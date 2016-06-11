import { ATTRIBUTES, KNIGHT, ATTACKER, DEFENDER } from '/imports/constants';
import { createMapOfObstacles, getMapValue, generateFields } from '/imports/helpers/map';
import { randomFraction } from '/imports/helpers/random';

export function generateGame (nRows, nColumns) {
  const game = {};
  const generator = mapGenerator(nRows, nColumns);

  // -----------------------
  // --- generate random map
  // -----------------------

  game.obstacles = [];

  for (const { row, column } of generateFields(nRows, nColumns)) {
    const field = generator({ row, column });
    if (field.isBlocked) {
      game.obstacles.push({ row, column });
    }
  }

  // ------------------------------------
  // --- spawn actors in random positions
  // ------------------------------------
  
  const mapOfObstacles = createMapOfObstacles(nRows, nColumns, game.obstacles);

  game.actors        = createActors(200, nRows, nColumns, mapOfObstacles);
  game.boardWidth    = nColumns;
  game.boardHeight   = nRows;
  game.nRows         = nRows;
  game.nColumns      = nColumns;

  return game;
}

function mapGenerator (nRows, nColumns) {
  return ({ column: j }) => {
    return {
      isBlocked: randomFraction() < 0.4 * Math.pow(1-2*Math.abs(j-nColumns/2)/nColumns, 2)
    };
  };
}

function createActors (perTeamAmount, nRows, nColumns, mapOfObstacles) {

  const actors = [];
  const places = {};

  // ------------------------------------------------------
  // --- give each side the same total amount of actors ---
  // ------------------------------------------------------
  [ ATTACKER, DEFENDER ].forEach(side => {
    let amountSoFar = 0;
    while (amountSoFar < perTeamAmount) {

      const amount = Math.min(perTeamAmount - amountSoFar,
                              Math.floor(20 + randomFraction() * 60));

      actors.push({ side, amount });
      amountSoFar += amount;
    }
  });

  // -----------------------------------------
  // --- try placing all the actors on map ---
  // -----------------------------------------
  for (const actor of actors) {
    const { row, column } = placeActorOnMap(actor.side, nRows, nColumns, mapOfObstacles, places);
    const type = KNIGHT;

    Object.assign(actor, ATTRIBUTES[type], {
      type   : type,
      row    : row,
      column : column,
    });
  }

  // ---------------------------------------------------------------------
  // --- use the order in which actors will make moves during the game ---
  // ---------------------------------------------------------------------
  actors.sort((a1, a2) => {
    if (a1.speed !== a2.speed)
      return a1.speed - a2.speed;

    if (a1.row !== a2.row)
      return a1.row - a2.row;

    if (a1.side !== a2.side)
      return a1.side === ATTACKER ? -1 : 1;

    return a1.column - a2.column;
  });

  // -------------------------------------------------------------
  // --- remove actors who didn't fit due to the lack of space ---
  // -------------------------------------------------------------
  return actors.filter(actor => actor.row >= 0 && actor.column >= 0);
}

/**
 * Try putting the actor on map in an unused spot on a field that is not blocked.
 * There's a limited number of attempts, though. If all of them fail,
 * return { row: -1, column: -1 }.
 *
 * @param {String} side
 * @param {Number} nRows
 * @param {Number} nColumns
 * @param {Boolean[][]} mapOfObstacles
 * @param {Object} placesUsed
 */
function placeActorOnMap (side, nRows, nColumns, mapOfObstacles, placesUsed) {

  let key    = '(-1,-1)';
  let row    = -1;
  let column = -1;

  // NOTE: There's the maximal number of 100 attempts.
  for (let n=0; n<100; n+=1) {

    row    = Math.floor(randomFraction() * nRows);
    column = Math.floor(randomFraction() * 4);

    if (side === DEFENDER) {
      column = nColumns - 1 - column;
    }

    key = `(${row},${column})`;

    if (!placesUsed[key] && !getMapValue({ row, column }, mapOfObstacles)) {
      placesUsed[key] = true;
      return {
        row, column
      };
    }
  }

  return { row: -1, column: -1 };
}



