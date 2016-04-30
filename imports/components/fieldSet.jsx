import React from 'react';
import { Complex } from '/imports/helpers/complex';
import { createEdgeMapping } from '/imports/helpers/mappings';
import { generateFields } from '/imports/helpers/map';
import { grow } from '/imports/helpers/vector';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export class FieldSet extends React.Component {

  constructor (props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render () {

    const { offsetX, offsetY, fieldWidth, fieldHeight } = this.props;
    const { fields, nRows = 0, nColumns = 0} = this.props;
    const { cutHoles = false, borderWidth = 0, fill = 'black', opacity = 0.5 } = this.props;

    const w = fieldWidth / 2;
    const h = fieldHeight / 4;

    const getEdge = createEdgeMapping({ fieldWidth: 2, fieldHeight: 4 });
    const mapPoint = ({ x, y }) => ({ x: offsetX + w * x, y: offsetY + h * y });
    const complex = new Complex();

    let loops = [];

    for (let { row, column } of (fields || generateFields(nRows, nColumns))) {

      const edges = [
        getEdge({ row, column },  1),
        getEdge({ row, column },  2),
        getEdge({ row, column },  3),
        getEdge({ row, column }, -3),
        getEdge({ row, column }, -2),
        getEdge({ row, column }, -1),
      ];

      if (cutHoles) {
        loops.push({ nodes: edges.map(e => e[0]) });
      }

      for (let e of edges) {
        complex.addEdge(...e);
      }
    }

    loops = loops.concat(complex.findAllLoops());

    const d = loops.map(loop => {
      return makePathString(grow(loop.nodes.map(mapPoint), borderWidth / 2));
    }).join(' ');

    return (
      <path 
        d           = {d}
        fillOpacity = {opacity}
        fill        = {fill}
      />
    );
  }
};

FieldSet.propTypes = {
  offsetX     : React.PropTypes.number.isRequired,
  offsetY     : React.PropTypes.number.isRequired,
  fieldWidth  : React.PropTypes.number.isRequired,
  fieldHeight : React.PropTypes.number.isRequired,
  fields      : React.PropTypes.array,
  nRows       : React.PropTypes.number,
  nColumns    : React.PropTypes.number,
  cutHoles    : React.PropTypes.bool,
  fill        : React.PropTypes.string,
  borderWidth : React.PropTypes.number,
  opacity     : React.PropTypes.number,
}

function makePoint ({ x, y }) {
  return x.toFixed(2) + ',' + y.toFixed(2);
}

function makePathString (iterable) {
  let first  = null;
  let string = 'M';
  for (let point of iterable) {
    if (!first) {
      first = point;
    }
    string += makePoint(point);
    string += ' L';
  }
  if (first) {
    string += makePoint(first || { x: 0, y: 0 });
  }
  return string;
}

