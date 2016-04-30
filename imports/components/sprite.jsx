import { animationsDb } from '/imports/constants';
import React from 'react';
import { Random } from 'meteor/random';
import _ from 'lodash';

export class Sprite extends React.Component {

  constructor(props) {
    super(props);
    this.spriteId = Random.id();
    this.animationSetup = this.getAnimationSetup(props);
    this.randomFrameOffset = Math.floor(100 * Random.fraction());
    this.state = {
      currentFrame : 0
    };
  }

  componentWillUpdate (nextProps, nextState) {

    if (nextProps.animation !== this.props.animation ||
        nextProps.actorType !== this.props.actorType ||
        nextProps.direction !== this.props.direction) {

      this.animationSetup = this.getAnimationSetup(nextProps);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.animation !== this.props.animation ||
        nextProps.actorType !== this.props.actorType) {

      // NOTE: That we are not reseting currentFrame if only direction changes.
      this.setState({ currentFrame: 0 });
    }
  }

  nextFrame () {
    if (this.state.currentFrame >= this.animationSetup.frames.length - 1) {
      if (this.props.forceLoop || this.animationSetup.isLoop) {
        this.setState({ currentFrame: 0 });
      }
    } else {
      this.setState({ currentFrame: this.state.currentFrame + 1 });
    }
  }

  getAnimationSetup (props) {
    const { direction, animation, actorType } = props;

    if (!animationsDb[actorType]) return { frames: [] };

    const firstMatch = _.find(animationsDb[actorType].animations, data => {
      // NOTE: We may have more matching conditions later on.
      return data.type === animation;
    });
    if (!firstMatch) return { frames: [] };

    const directionMatch = _.find(firstMatch.variants, { direction: Math.abs(direction) });
    if (!directionMatch)  return { frames: [] };

    const sheetIdx = firstMatch.sheetIdx || 0;
    const sheet    = animationsDb[actorType].sheets[sheetIdx];

    if (!sheet) {
      return { frames: [] };
    }

    return {
      ...sheet,
      ...directionMatch,

      isLoop: !!firstMatch.isLoop,
    };
  }

  render () {

    const {
      direction, animation,
      positionX, positionY,
      actorType, height } = this.props;

    const {
      direction: frameDirection,
      frames,
      frameWidth, frameHeight,
      actorHeight,
      offsetX, offsetY,
      nColumns, nRows,
      isLoop, source } = this.animationSetup;

    if (frames.length === 0) {
      // NOTE: It means that there's no animation at all.
      return (<g></g>);
    }

    let currentFrame = this.state.currentFrame;

    if (isLoop || this.props.forceLoop) {
      currentFrame += this.randomFrameOffset;
      currentFrame %= frames.length;
    }

    const mirror = frameDirection !== direction;
    const scale  = height / actorHeight;

    const spriteOffsetX = mirror ? scale * (frameWidth - offsetX) : scale * offsetX;
    const spriteOffsetY = scale * offsetY;
    const spriteWidth   = scale * frameWidth;
    const spriteHeight  = scale * frameHeight;
    const frameOffsetX  = frames[currentFrame][1] * spriteWidth;
    const frameOffsetY  = frames[currentFrame][0] * spriteHeight;

    const spriteX = positionX - spriteOffsetX;
    const spriteY = positionY - spriteOffsetY;

    return (
      <g transform = {`translate(${spriteX},${spriteY})`}>
        <defs>
          <clipPath id={this.spriteId}>
            <rect x={0} y={0} width={spriteWidth} height={spriteHeight}/>
          </clipPath>
        </defs>
        <image
          xlinkHref = {source}
          transform = {mirror ? `translate(${spriteWidth},0),scale(-1,1)` : ''}
          x         = {-frameOffsetX}
          y         = {-frameOffsetY}
          width     = {nColumns * spriteWidth}
          height    = {nRows * spriteHeight}
          clipPath  = {'url(#' + this.spriteId + ')'}
        />
      </g>
    );
  }
}

Sprite.propTypes = {
  direction : React.PropTypes.number.isRequired,
  animation : React.PropTypes.string.isRequired,
  positionX : React.PropTypes.number.isRequired,
  positionY : React.PropTypes.number.isRequired,
  actorType : React.PropTypes.string.isRequired,
  height    : React.PropTypes.number.isRequired,
  forceLoop : React.PropTypes.bool,
};

