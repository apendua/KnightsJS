import * as V from './vector';

export class Complex {

  constructor () {
    this.edges = new Map();
    this.nodes = new Map();
  }

  getKey ({ x, y }) {
    return `(${x},${y})`;
  }

  addNode ({ x, y }, value = 1) {
    const key = this.getKey({ x, y });
    let node = this.nodes.get(key);
    if (!node) {
      node = { x, y, edges: [], value: 0 };
      this.nodes.set(key, node);
    }
    node.value += value;
    return node;
  }

  _addEdge (p1, p2, value=1) {
    const key = this.getKey(p1) + ',' + this.getKey(p2);
    let edge = this.edges.get(key);
    if (!edge) {
      const n1 = this.addNode(p1,-1);
      const n2 = this.addNode(p2, 1);
      edge = { tail: n1, head: n2, value: 0 };
      n1.edges.push(edge);
      this.edges.set(key, edge);
    }
    edge.value += value;
  }

  addEdge (p1, p2, value=1) {
    this._addEdge(p1, p2,  value);
    this._addEdge(p2, p1, -value);
  }

  /**
   * Find all loops in this graph.
   */
  findAllLoops () {
    const loops = [];

    // clean up
    for (const e of this.edges.values()) {
      delete e.iter;
    }

    let i = 0;
    for (const e of this.edges.values()) {
      i += 1;
      if (e.value <= 0 || e.iter !== undefined) {
        continue;
      }
      const l = findLoopStartingFromEdge(e, i);
      if (l) {
        loops.push(l);
      }
    }
    return loops;
  }

};

/**
 * Try finding a loop starting from the given edge, and
 * use the other edges found so far.
 *
 * @param {Object} edge
 * @param {Number} iter
 * @param {Object[]} loop
 */
function findLoopStartingFromEdge (edge, iter, loop = { nodes: [], edges: [] }) {

  if (edge.tail === edge.head) {
    // this is a dead-end :(
    return;
  }

  // note the reversed order!
  var edgeVector = V.sub(edge.tail, edge.head);

  // mark as visited ...
  edge.iter = iter;

  // add to the loop ...
  loop.edges.push(edge);
  loop.nodes.push(edge.tail);

  var bestEdge = null;
  var bestAngle = null;

  // find the first "next" edge counting counter-clockwise ...
  var weHaveFoundLoop = edge.head.edges.some(function (e) {
    if (e.iter === iter) {
      // looks like we've found a loop
      while (loop.edges[0] !== e) {
        // make sure this edge knows it does not belong to the loop
        delete loop.edges[0].iter;
        // remove all edges that are not in the loop
        loop.edges.shift();
        loop.nodes.shift();
      }
      return true;
    }
    // ... if one of the edges is degenerated, ignore it
    if (e.value === 0 || e.tail === e.head) {
      return false;
    }
    // ... also prevent walking back, along the same path
    if (e.head === loop.edges[loop.edges.length-1].tail) {
      return false;
    }
    const v = V.sub(e.head, e.tail);
    let a = V.angle(edgeVector, v);
    if (isNaN(a)) {
      return false;
    }
    if (a < 0) { // we only want positive values here
      a = 2 * Math.PI + a;
    }
    if (bestAngle === null || a < bestAngle) {
      bestAngle = a;
      bestEdge = e;
    }
    // no loop found yet
    return false;
  });

  if (weHaveFoundLoop) { // cool! let's return it ...
    return loop;
  }

  if (bestEdge === null) { // there's no chance we will find a loop here ...
    return;
  }
  //----------------------------------------------------
  return findLoopStartingFromEdge(bestEdge, iter, loop);
};
