
export function mul(v, c) {
  return {
    x: v.x * c,
    y: v.y * c,
  };
}

export function sub (u, v) {
  return {
    x: u.x - v.x,
    y: u.y - v.y,
  };
}

export function add (u, v) {
  return {
    x: u.x + v.x,
    y: u.y + v.y,
  };
}

export function dot (u, v) {
  return u.x * v.x + u.y * v.y;
}

export function det (u, v) {
  return u.x * v.y - u.y * v.x;
}

 export function norm (u) {
  return Math.sqrt(u.x * u.x + u.y * u.y);
}

export function norm2 (u) {
  return u.x * u.x + u.y * u.y;
}

export function normalize (u) {
  return mul(u, 1/norm(u));
}

export function rot90 (u) {
  return { x: -u.y, y: u.x };
}

export function inv (u, v) {
  var oneOverDet = 1 / (u.x * v.y - u.y * v.x);
  return function (p) {
    return {
      x: oneOverDet * (  p.x * v.y - p.y * v.x),
      y: oneOverDet * (- p.x * u.y + p.y * u.x),
    };
  };
}

/**
 * Create a derived iterator that shifts all points by the given
 * value relatively to the interior region bounded by the path.
 */
export function* grow (path, value) {
  for (const [p, q, r] of walk3(path)) {
    const v1  = normalize(sub(p, q));
    const v2  = normalize(sub(r, q));
    const cos = dot(v1, v2);
    const u1  = rot90(v1);
    const u2  = rot90(v2);
    yield add(q, add(mul(u1, value/(cos-1)), mul(u2, value/(1-cos))));
  }
}

/**
 * Compute angle between the two vectors. The result is a value
 * between -pi and +pi, and it's positive <=> [u,v] is positively
 * oriented, i.e. we are counting "counter-clockwise".
 *
 * @param {Object} u
 * @param {Object} v
 */
export function angle (u, v) {
  var c = dot(u,v) / ( norm(u) * norm(v) );
  //---------------------------------------
  if (!Number.isFinite(c)) {
    return NaN;
  }
  // e.g. sometimes c may end up being 1.00000000001
  if (c > 1) {
    c = 1;
  }
  if (c < -1) {
    c = -1;
  }
  if (det(u,v) > 0) {
    return Math.acos(c);
  }
  return - Math.acos(c);
}

/**
 * Return the orientation of the given path.
 */
export function orientation (path) {
  let sum = 0;
  for (const [p, q, r] of walk3(path)) {
    sum += angle(sub(q, p), sub(r, q));
  }
  return Math.round(sum / (2 * Math.PI));
}

/**
 * Compute path index w.r.t. point.
 */
export function index (p, path) {
  let sum = 0;
  for (const [q, r] of walk2(path)) {
    sum += angle(sub(q, p), sub(r, p));
  }
  return Math.round(sum / (2 * Math.PI));
}

/**
 * Create an iterator that yields all consecutive pairs.
 */
export function* walk2 (path) {
  let p0, p1;
  for (const p of path) {
    if (p1) {
      yield [ p1, p ];
    } else {
      p0 = p;
    }
    p1 = p;
  }
  if (p0 && p1) {
    yield [ p1, p0 ];
  }
}

/**
 * Create an iterator that yields all consecutive triples.
 */
export function* walk3 (path) {
  let p0, p1, p2, p3;
  for (const p of path) {
    if (p2 && p3) {
      yield [ p2, p3, p ];
    } else if (p0) {
      p1 = p;
    } else {
      p0 = p;
    }
    p2 = p3;
    p3 = p;
  }
  if (p0 && p1 && p2 && p3) {
    yield [ p2, p3, p0 ];
    yield [ p3, p0, p1 ];
  }
}
