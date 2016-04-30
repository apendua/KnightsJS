
import { createNeighborsGenerator } from './neighbors';

/**
 * Return true if the given objects represent the same field.
 */
export function areTheSameField ({ row: a, column: b }, { row: c, column: d }) {
  return a === c && b === d;
}

/**
 * Safely get the value at the given map coordinates.
 *
 * @param {Object} field
 * @param {Number} field.row
 * @param {Number} field.column
 * @param {Any[][]} map
 * @returns {Any} value
 */
export function getMapValue ({ row, column }, map) {
  return map && map[row] && map[row][column];
}

/**
 * Safely set the value at the given map coordinates.
 *
 * @param {Object} field
 * @param {Number} field.row
 * @param {Number} field.column
 * @param {Any[][]} map
 * @param {Any} value
 */
export function setMapValue ({ row, column }, map, value) {
  if (map[row] && 0 <= column && column < map[row].length) {
    map[row][column] = value;
  }
}

/**
 * Create map of obstacles, i.e. a two dimensional array
 * that contains boolean values.
 *
 * @param {Number} nRows
 * @param {Number} nColumns 
 * @param {Object[]} obstacles
 * @param {Number} obstacles.row
 * @param {Number} obstacles.column
 * @returns {Boolean[][]} map
 */
export function createMapOfObstacles (nRows, nColumns, ...rest) {
  const map = createMap(nRows, nColumns, ({ row, column }) => false);
  for (let obstacles of rest) {
    for (let o of obstacles) setMapValue(o, map, true);
  }
  return map;
}

/**
 * Create map of distances relative to the given field.
 *
 * @param {Number} nRows
 * @param {Number} nColumns 
 * @param {Object} field
 * @param {Number} field.row
 * @param {Number} field.column
 * @param {Boolean[][]} mapOfObstacles - optional
 * @param {Number[][]} map
 */
export function createMapOfDistances (nRows, nColumns, { row, column }, mapOfObstacles) {
  const mapOfDistances = createMap(nRows, nColumns, ({ row: i, column: j }) => {
    return i === row && j === column ? 0 : Infinity;
  });

  const neighborsGenerator = createNeighborsGenerator(nRows, nColumns);

  let currentFields = Array.from(neighborsGenerator({ row, column }));
  let currentDistance = 1;

  while (currentFields.length > 0) {

    const fieldsToUpdate = [];

    for (let field of currentFields) {

      const fieldDistance = getMapValue(field, mapOfDistances);
      const isObstacle = !!mapOfObstacles && getMapValue(field, mapOfObstacles);

      if (isObstacle ||
          // NOTE: This is not necessary, because the field is guaranteed to be on the map.
          // fieldDistance === undefined ||
          fieldDistance <= currentDistance) {

        continue;
      }

      setMapValue(field, mapOfDistances, currentDistance);

      for (let neighbor of neighborsGenerator(field)) {
        fieldsToUpdate.push(neighbor);
      }
    }

    currentFields = fieldsToUpdate;
    currentDistance += 1;
  }
  return mapOfDistances;
}

/**
 * Create a two-dimensional array with the given number of rows and columns.
 *
 * @param {Number} nRows
 * @param {Number} nColumns
 * @param {Function} generator - an optional function that receives (row, column) and returns data
 * @returns {Any[][]} map
 */
export function createMap (nRows, nColumns, generator = ()=>({})) {
  const map = [];
  for (let row=0; row < nRows; row+=1) {
    const data = [];
    for (let column=0; column < nColumns; column+=1) {
      data.push(generator({ row, column }));
    }
    map.push(data);
  }
  return map;
}

/**
 * Create an iterator that traverse all fields of a rectangular board.
 *
 * @param {Number} nRows
 * @param {Number} nColumns
 * @returns {Any[][]} map
 */
export function* generateFields (nRows, nColumns) {
  for (let row=0; row < nRows; row+=1) {
    for (let column=0; column < nColumns; column+=1) {
      yield { row, column };
    }
  }
}

/**
 * Find a path to the given field starting at
 * the field for which the map of distances was computed.
 *
 * @param {Object} options
 * @param {Number} options.row
 * @param {Number} options.column
 * @param {Number[][]} mapOfDistances
 * @param {[Array]} pathSoFar
 */
export function findPathTo ({ row, column }, neighborsGenerator, mapOfDistances, pathSoFar) {
  let currentDistance = getMapValue({ row, column }, mapOfDistances);
  if (!pathSoFar) { // initialize path
    pathSoFar = [];
  }
  if (Number.isFinite(currentDistance)) {
    pathSoFar.unshift({ row, column });
  } else {
    return [];
  }
  if (currentDistance === 0) { // already there
    return pathSoFar;
  }
  let nextMove = null;

  for (let move of neighborsGenerator({ row, column })) {
    const distance = getMapValue(move, mapOfDistances);
    if (distance < currentDistance) {
      currentDistance = distance;
      nextMove = move;
    }
  }
  if (!nextMove) {
    return [];
  }
  return findPathTo(nextMove, neighborsGenerator, mapOfDistances, pathSoFar);
}
