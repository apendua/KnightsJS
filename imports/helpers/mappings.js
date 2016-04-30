
/**
 * Create a function that will be evaluating field coordinates
 * when given the (row, column) pair.
 *
 * @param {Number} fieldWidth
 * @param {Number} fieldHeight
 * @param {Number} offsetX
 * @param {Number} offsetY
 * @returns {Function} map
 */
export function createMapping ({
    fieldWidth  = 1,
    fieldHeight = 1,
    offsetX     = 0,
    offsetY     = 0
  } = {}) {

  const w  = fieldWidth / 2;
  const h  = fieldHeight / 4;
  const h3 = h * 3;

  /**
   * Compute the coordinates of upper-left corner of the given field.
   *
   * @param {Object} options
   * @param {Number} options.row
   * @param {Number} options.column
   */
  return function map ({ row, column }) {
    const x = offsetX + column * fieldWidth + (row % 2 === 1 ? w : 0);
    const y = offsetY + row    * h3;
    return { x, y };
  };
}

/**
 * Return a function that given a field and direction 
 * returns the corresponding edge.
 *
 * @param {Number} fieldWidth
 * @param {Number} fieldHeight
 * @param {Number} offsetX
 * @param {Number} offsetY
 * @returns {Function} map 
 */
export function createEdgeMapping ({
    fieldWidth  = 1,
    fieldHeight = 1,
    offsetX     = 0,
    offsetY     = 0
  } = {}) {

  const w  = fieldWidth / 2;
  const h  = fieldHeight / 4;
  const h3 = h * 3;
  const w2 = w * 2;
  const h4 = h * 4;

  /**
   * Return a pair of vertexes representing the edge of the given field
   * at the given direction. 
   *
   * @param {Object} options
   * @param {Number} options.row
   * @param {Number} options.column
   * @param {Number} direction
   */
  return function map ({ row, column }, direction) {
    const x = offsetX + column * fieldWidth + (row % 2 === 1 ? w : 0);
    const y = offsetY + row    * h3;

    switch (direction) {
      case  1: return [ { x: x + w2, y: y + h },  { x: x + w,  y: y }      ];
      case  2: return [ { x: x + w2, y: y + h3 }, { x: x + w2, y: y + h }  ];
      case  3: return [ { x: x + w,  y: y + h4 }, { x: x + w2, y: y + h3 } ];
      case -1: return [ { x: x + w,  y: y },      { x: x,      y: y + h }  ];
      case -2: return [ { x: x,      y: y + h },  { x: x,      y: y + h3 } ];
      case -3: return [ { x: x,      y: y + h3 }, { x: x + w,  y: y + h4 } ];
      default: return [];
    }
  };
}

/**
 * Return a function that will be evaluating column and row
 * when given the (x,y) coordinates (e.g. mouse cursor position).
 *
 * @param {Number} fieldWidth
 * @param {Number} fieldHeight
 * @param {Number} offsetX
 * @param {Number} offsetY
 * @param {Boolean} findNeighbor - if true, the function will also return the closest neighbor
 * @returns {Function} map
 */
export function createInverseMapping ({

    fieldWidth   = 1,
    fieldHeight  = 1,
    offsetX      = 0,
    offsetY      = 0,
    findNeighbor = false,

  } = {}) {

  const w = fieldWidth  / 2;
  const h = fieldHeight / 4;
  
  /**
   * Compute the row and column of the field that covers the given point.
   *
   * @param {Object} options
   * @param {Number} options.x
   * @param {Number} options.y
   */
  return function map ({ x, y }) {

    x -= offsetX;
    y -= offsetY;

    let i = Math.floor(y / h);
    let j = Math.floor(x / w);
    let r = i % 6;

    if (r === 0) {
      if (j % 2 === 0) {
        if (x/w+y/h < 1+i+j) {
          i -= 1;
          j -= 1;
        }
      } else {
        if (y/h-i < x/w-j) {
          i -= 1;
        }
      }
    } else if (r === 3) {
      if (j % 2 === 0) {
        if (y/h-i < x/w-j) {
          i -= 1;
        } else {
          j -= 1;
        }
      } else {
        if (x/w+y/h < 1+i+j) {
          i -= 1;
        } else {
          j -= 1;
        }
      }
    } else if (r === 4 || r === 5) {
      j -= 1;
    }

    const row    = Math.floor(i / 3);
    const column = Math.floor(j / 2);

    if (findNeighbor) {
      const { row: nRow, column: nColumn } =
        findTheClosestNeighbor(x, y, row, column, w, h);

      return { row, column, nRow, nColumn };
    } else {
      return { row, column };
    }

  };

}

/**
 * Given the cursor coordinates return the neighbor field that is
 * closest to the direction pointed out by cursor.
 *
 * @param {Number} x - cursor x
 * @param {Number} y - cursor y
 * @param {Number} r - row under cursor
 * @param {Number} c - column under cursor
 * @param {Number} w - half of the field width
 * @param {Number} h - quarter of the field height
 *
 * @returns {Object} neighbor
 * @returns {Number} neighbor.row
 * @returns {Number} neighbor.column
 */
function findTheClosestNeighbor (x, y, r, c, w, h) {

  // NOTE: Find out coordinates of the center of the hexagon.
  const ox = c * 2 * w + (r % 2 ? 2 * w : w);
  const oy = r * 3 * h + 2 * h;

  let row;
  let column;

  if (x >= ox) {
    if (w * (y-oy) >= h * (x-ox)) {
      row = r + 1;
      column = r % 2 ? c + 1 : c;
    } else if (w * (y-oy) < - h * (x-ox)) {
      row = r - 1;
      column = r % 2 ? c + 1 : c;
    } else {
      row = r;
      column = c + 1;
    }
  } else {
    if (w * (y-oy) <= h * (x-ox)) {
      row = r - 1;
      column = r % 2 ? c : c - 1;
    } else if (w * (y-oy) > - h * (x-ox)) {
      row = r + 1;
      column = r % 2 ? c : c - 1;
    } else {
      row = r;
      column = c - 1;
    }
  }
  return { row, column };
}


