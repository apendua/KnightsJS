import React, { Component } from 'react';
import { createMapping } from '/imports/helpers/mappings';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { memoize } from '/imports/helpers/memoize';
import {
  DEFENDER,
  ATTACKER,
  ANIMATION_IDLE,
  ANIMATION_WALK,
  ANIMATION_ATTACK,
  ANIMATION_HIT,
  ANIMATION_DEAD,
  ANIMATION_FALL,
  ANIMATION_ACTIVE,
  ANIMATION_KNOCKOUT,
  
  TIMING_MOVE_BY_ONE_FIELD,
  TIMING_FRAMES_PER_SECOND,

  } from '/imports/constants';

import { Sprite } from './sprite';

export class Actor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentFrame : 0,
      moveSpeed    : 0,
      moveProgress : 0,
    };
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    // -----------------
    // --- SELECTORS ---
    // -----------------
    this.getMapping = memoize(
      (offsetX, offsetY, fieldWidth, fieldHeight) => {
        return createMapping({ offsetX, offsetY, fieldWidth, fieldHeight });
      },
      (evaluate) => {
        return evaluate(
          this.props.offsetX,
          this.props.offsetY,
          this.props.fieldWidth,
          this.props.fieldHeight
        );
      }
    );
  }

  componentDidMount() {
    this.interval = Meteor.setInterval(() => {
      this.setState({
        currentFrame : (this.state.currentFrame + 1) % 6,
        moveProgress : Math.min(1.0, this.state.moveProgress + this.state.moveSpeed),
      });
      this.refs.sprite.nextFrame();
    }, 1000 / TIMING_FRAMES_PER_SECOND);
  }

  componentWillUnmount() {
    Meteor.clearInterval(this.interval);
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.movePath !== this.props.movePath) {
      if (nextProps.movePath && nextProps.movePath.length > 0) {
        
        const totalTime = TIMING_MOVE_BY_ONE_FIELD * (nextProps.movePath.length - 1);
        const moveSpeed = (1000 / TIMING_FRAMES_PER_SECOND) / totalTime;

        this.setState({
          moveProgress : 0,
          moveSpeed    : moveSpeed,
        });
      } else {
        this.setState({
          moveProgress : 0,
          moveSpeed    : 0,
        });
      }
    }
  }

  isMoving () {
    return this.props.movePath && this.props.movePath.length > 0;
  }

  getPathIndex () {
    const { moveProgress } = this.state;
    const { movePath } = this.props;

    if (movePath && movePath.length > 0) {
      return indexOnPath = Math.floor(moveProgress * (movePath.length - 1));
    } else {
      return -1;
    }
  }

  getDirectionVector () {
    const { movePath, fieldWidth, side } = this.props;
    const i = this.getPathIndex();

    if (i < 0 || i === movePath.length - 1) {
      return { x: side === ATTACKER ? 1 : -1, y: 0 };
    }

    const p0 = this.getMapping()(movePath[i+0]);
    const p1 = this.getMapping()(movePath[i+1]);

    return { x: p1.x - p0.x, y: p1.y - p0.y };
  }

  getDirection (v = { x: 1, y: 0 }) {
    let d = 0;

    if (Math.abs(v.y) < 0.001) {
      d = 2;

    } else if (v.y > 0) {
      d = 3;

    } else if (v.y < 0) {
      d = 1;
    }

    return v.x < 0 ? -d : d;
  }

  getAnimation () {
    if (this.props.totalHealth === 0) {
      return ANIMATION_DEAD;

    } else if (this.isMoving()) {
      return ANIMATION_WALK;

    } else if (this.props.isHit) {
      return this.props.isDying ? ANIMATION_FALL : ANIMATION_HIT;

    } else if (this.props.isAttacking) {
      // return this.props.isFinishing ? ANIMATION_KNOCKOUT : ANIMATION_ATTACK;
      return ANIMATION_ATTACK;

    } else {
      return this.props.isActive ? ANIMATION_ACTIVE : ANIMATION_IDLE;
    }
  }

  renderStatusBar (offsetX, offsetY, fieldWidth, fieldHeight) {
    const amount = Math.ceil(this.props.totalHealth / this.props.toughness);

    const textColor = this.props.side === ATTACKER ? 'black' : 'white';
    const fillColor = this.props.side === ATTACKER ? 'white' : 'black';

    if (amount) {
      return (
        <g transform = {`translate(${offsetX},${offsetY-1.5*fieldHeight})`}>
          <rect
            x           = {1/6 * fieldWidth}
            y           = {0}
            width       = {2/3 * fieldWidth}
            height      = {1/3 * fieldHeight}
            strokeWidth = {1.5}
            stroke      = "#444"
            fill        = {fillColor}
          />
          <text
            x          = {0.50 * fieldWidth}
            y          = {0.25 * fieldHeight}
            stroke     = {textColor}
            textAnchor = "middle"
            style={{
              fontSize    : 0.25 * fieldHeight,
              fill        : textColor,
              strokeWidth : 1
            }}
          >
            {amount}
          </text>
        </g>
      );
    }

    return '';
  }

  render () {

    let { x, y } = createMapping(this.props)(this.props);
    
    const { fieldWidth, fieldHeight, movePath, isActive, opacity = 1.0 } = this.props;
    const { moveProgress } = this.state;

    const vector    = this.getDirectionVector();
    const pathIndex = this.getPathIndex();

    if (this.isMoving()) {

      const posOnSegment = (movePath.length - 1) * moveProgress - pathIndex;
      const p0 = this.getMapping()(movePath[pathIndex]);

      x = p0.x + vector.x * posOnSegment;
      y = p0.y + vector.y * posOnSegment;
    }

    return (
      <g opacity={opacity}>
        <Sprite
          ref       = 'sprite'
          actorType = {this.props.type}
          animation = {this.props.animation || this.getAnimation()}
          positionX = {x + 0.5 * fieldWidth}
          positionY = {y + 0.5 * fieldHeight}
          direction = {this.props.direction || this.getDirection(vector)}
          forceLoop = {this.props.forceLoop}
          height    = {2 * fieldHeight}
        />
        {this.renderStatusBar(x, y, fieldWidth, fieldHeight)}
      </g>
    );
  }

}

Actor.propTypes = {
  isActive    : React.PropTypes.bool,
  row         : React.PropTypes.number.isRequired,
  column      : React.PropTypes.number.isRequired,
  offsetX     : React.PropTypes.number.isRequired,
  offsetY     : React.PropTypes.number.isRequired,
  fieldWidth  : React.PropTypes.number.isRequired,
  fieldHeight : React.PropTypes.number.isRequired,  

  forceLoop   : React.PropTypes.bool,
  opacity     : React.PropTypes.number,
  direction   : React.PropTypes.number,
  animation   : React.PropTypes.string,
};

