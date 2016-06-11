
/**
 * If the given fields are neighbors, return the "direction index" from the
 * first filed, to the second one. If they're not neighbors, return 0.
 * Note that "getDirection(a, b) !== 0" <=> "a and b are neighbors".
 *
 * The "direction index" is defined by the following diagram:
 *
 *   -1   1
 * -2   0   2
 *   -3   3
 *
 * @param {Object} from
 * @param {Number} from.row
 * @param {Number} from.column
 * @param {Object} to
 * @param {Number} to.row
 * @param {Number} to.column
 * @returns {Number}
 */
export function getDirection (
    { row: fromRow , column: fromColumn },
    { row: toRow   , column: toColumn   }

  ) {

  const nColumns = Math.abs(toColumn - fromColumn);
  const nRows    = Math.abs(toRow    - fromRow);

  if (nColumns > 1 || nRows > 1) {
    return 0;
  }

  if (nRows === 0) {
    return nColumns !== 1 ? 0 : (toColumn > fromColumn ? 2 : -2);
  }


  if (fromRow % 2 === 0) {

    // The pattern for even rows:
    //
    // -1  1  0
    // -2  0  2
    // -3  3  0

    if (toColumn > fromColumn) {
      return 0;

    } else if (fromColumn === toColumn) {
      return fromRow > toRow ? 1 : 3;

    } else { // fromColumn - 1 === toColumn
      return fromRow > toRow ? -1 : -3;
    }
  } else {

    // The pattern for odd rows:
    //
    //  0 -1  1
    // -2  0  2
    //  0 -3  3

    if (toColumn < fromColumn) {
      return 0;

    } if (fromColumn === toColumn) {
      return fromRow > toRow ? -1 : -3;

    } else { // fromColumn + 1 === toColumn
      return fromRow > toRow ? 1 : 3;
    }
  }
};

/**
 * Check if the given fields are neighbors. Note that a field
 * is not a neighbor of itself.
 *
 * @param {Object} field
 * @param {Number} field.row
 * @param {Number} field.column
 * @param {Object} anotherField
 * @param {Number} anotherField.row
 * @param {Number} anotherField.column
 * @returns {Boolean}
 */
export function isNeighbor (field, anotherField) {
  return getDirection(field, anotherField) !== 0;
}

// TODO: Finish the implementation ...

/**
 * Create a function that will be generating neighbors for
 * the given field. Optionally, you can provide map dimensions
 * to restrict the set of neighbors to the given rectangle only.
 *
 * @param {Number} nRows - optional
 * @param {Number} nColumns - optional
 * @returns {Function}
 */
export function createNeighborsGenerator (...args) {

  const [ nRows, nColumns ] = args;

  if (args.length >= 2) {

    return function* filteredNeighborsGenerator({ row, column }) {

      // NOTE: By convention, if a field is not on the map, it has no neighbors.

      if (row < 0 ||
          row >= nRows ||
          column < 0 ||
          column >= nColumns) {

        return;
      }

      for (const n of neighborsGenerator({ row, column })) {

        if (n.row >= 0 &&
            n.row < nRows &&
            n.column >= 0 &&
            n.column < nColumns) {

          yield n;
        }
      }
    };

  } else {
    return neighborsGenerator;
  }
}

/**
 * Generator neighbors of the given field.
 * @param {Object} field
 * @param {Number} field.row
 * @param {Number} field.column
 */
function* neighborsGenerator ({ row, column }) {

  if (row % 2 === 0) {

    // 2 1
    // 3   0
    // 4 5

    yield { row: row + 0, column: column + 1 };
    yield { row: row - 1, column: column + 0 };
    yield { row: row - 1, column: column - 1 };
    yield { row: row + 0, column: column - 1 };
    yield { row: row + 1, column: column - 1 };
    yield { row: row + 1, column: column + 0 };

  } else {

    //   5 4
    // 0   3
    //   1 2

    yield { row: row + 0, column: column - 1 };
    yield { row: row + 1, column: column + 0 };
    yield { row: row + 1, column: column + 1 };
    yield { row: row + 0, column: column + 1 };
    yield { row: row - 1, column: column + 1 };
    yield { row: row - 1, column: column + 0 };
  }
};
