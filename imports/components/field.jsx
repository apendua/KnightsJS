import React from 'react';
import { createMapping } from '/imports/helpers/mappings';

export class Field extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {

    if (this.props.column < 0 || this.props.row < 0) {
      return false;
    }

    const { x, y } = createMapping(this.props)(this.props);
    const w = this.props.fieldWidth;
    const h = this.props.fieldHeight;

    const x1 = x;
    const x2 = x+w/2;
    const x3 = x+w;
    const y1 = y;
    const y2 = y+h/4;
    const y3 = y+3*h/4;
    const y4 = y+h;

    const points = `${x1},${y2},${x2},${y1},${x3},${y2},${x3},${y3},${x2},${y4},${x1},${y3}`;

    const { fill = 'black', opacity = 0.5 } = this.props;
    return (
      <polygon points={points} fill={fill} fillOpacity={opacity}/>
    );
  }
};

Field.propTypes = {
  row         : React.PropTypes.number.isRequired,
  column      : React.PropTypes.number.isRequired,
  fieldWidth  : React.PropTypes.number.isRequired,
  fieldHeight : React.PropTypes.number.isRequired,
  offsetX     : React.PropTypes.number.isRequired,
  offsetY     : React.PropTypes.number.isRequired,
  fill        : React.PropTypes.string,
  opacity     : React.PropTypes.number,
};

