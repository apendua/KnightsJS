import React from 'react';
import { Actor } from './actor';
import { Field } from './field';
import { FieldSet } from './fieldSet';
import { createNeighborsGenerator, getDirection } from '/imports/helpers/neighbors';
import { createMapping, createInverseMapping } from '/imports/helpers/mappings';
import { memoize } from '/imports/helpers/memoize';
import { closest } from '/imports/helpers/dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
  createMapOfDistances,
  createMapOfObstacles,
  findPathTo,
  getMapValue,
  areTheSameField,
  generateFields } from '/imports/helpers/map';

import {

  ANIMATION_WALK,
  ANIMATION_ATTACK,
  ANIMATION_KNOCKOUT,

  } from '/imports/constants';

export class Board extends React.Component {

  constructor (props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    this.state = {
      // NOTE: NaN would cause problems because NaN !== NaN
      cursorCoords   : { row: -1, column: -1 },
      neighborCoords : { row: -1, column: -1 },
    };

    // -------------------
    // --- BIND EVENTS ---
    // -------------------

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);

    // -----------------
    // --- SELECTORS ---
    // -----------------

    this.getMapOfObstacles = memoize(
        (nRows, nColumns, obstacles, actors) => (

      createMapOfObstacles(
        nRows,
        nColumns,
        obstacles,
        actors
      )
    ), (evaluate) => (
      evaluate(
        this.props.nRows,
        this.props.nColumns,
        this.props.obstacles,
        this.props.actors.filter(a => a.totalHealth > 0 && a.idx !== this.props.currentActor.idx)
      )
    ));

    this.getTargetCoords = memoize(
      (cursorCoords, neighborCoords, mapOfObstacles) => {
        let targetCoords = cursorCoords;

        if (getMapValue(targetCoords, mapOfObstacles)) {
          targetCoords = neighborCoords;
        }
        if (getMapValue(targetCoords, mapOfObstacles)) {
          targetCoords = { row: -1, column: -1 };
        }
        return targetCoords;

      }, (evaluate) => (
        evaluate(
          this.state.cursorCoords,
          this.state.neighborCoords,
          this.getMapOfObstacles()
        )
      )
    );

    this.getMapOfDistances = memoize(
        (nRows, nColumns, currentCoords, mapOfObstacles) => {

      return createMapOfDistances(
        nRows,
        nColumns,
        currentCoords,
        mapOfObstacles
      );
    }, (evaluate) => (
      evaluate(
        this.props.nRows,
        this.props.nColumns,
        this.props.currentCoords,
        this.getMapOfObstacles(props)
      )
    ));

    // NOTE: When interface is not active, the path is always empty!
    this.getPathToCursor = memoize(
      (nRows, nColumns, targetCoords, distanceLimit, mapOfDistances, isActive) => {

      if (!isActive) return [];

      const neighborsGenerator =
        createNeighborsGenerator(nRows, nColumns);

      const distance = getMapValue(targetCoords, mapOfDistances);

      return distance > distanceLimit ? [] :
        findPathTo(targetCoords, neighborsGenerator, mapOfDistances);

    }, (evaluate) => {

      return evaluate(
        this.props.nRows,
        this.props.nColumns,
        this.getTargetCoords(),
        this.props.currentActor.speed || 0,
        this.getMapOfDistances(),
        this.props.isActive
      );
    });

    this.getFieldsWithinDistance = memoize(
      (nRows, nColumns, distance, mapOfDistances) => {
        const fields = [];
        for (const { row, column } of generateFields(nRows, nColumns)) {
          if (getMapValue({ row, column }, mapOfDistances) <= distance) {
            fields.push({ row, column });
          }
        }
        return fields;
      }, (evaluate, distance) => {

        return evaluate(
          this.props.nRows,
          this.props.nColumns,
          distance,
          this.getMapOfDistances()
        );
      }
    );
  }

  handleMouseMove (e) {

    if (!this.props.isActive) {
      return;
    }

    const theCoords = this.getMapCoords({ x: e.clientX, y: e.clientY });
    this.setCoords('cursorCoords'   , { row: theCoords.row,  column: theCoords.column  });
    this.setCoords('neighborCoords' , { row: theCoords.nRow, column: theCoords.nColumn });
  }

  handleMouseClick (e) {

    if (!this.props.isActive) {
      return;
    }

    const pathToCursor = this.getPathToCursor();

    if (pathToCursor.length > 0 &&
        this.props.currentActor.idx >= 0 &&
        this.props.onActorMove) {

      const { actors } = this.props;

      const theCoords = this.getMapCoords({ x: e.clientX, y: e.clientY });
      const oponent = actors.find(a => a.totalHealth > 0 && areTheSameField(a, theCoords));

      this.props.onActorMove(
        this.props.currentActor,
        pathToCursor,
        oponent
      );
    }
  }

  setCoords (name, { row, column }) {
    if (!areTheSameField(this.state[name], { row, column })) {
      this.setState({ [ name ]: { row, column }});
    }
  }

  getMapCoords ({ x, y }) {
    const svg = closest(this.root, 'svg');
    const CTM = svg.getScreenCTM();
    const pt = svg.createSVGPoint();

    pt.x = x;
    pt.y = y;

    return createInverseMapping({ ...this.props, findNeighbor: true })(pt.matrixTransform(CTM.inverse()));
  }

  renderGhost () {

    const { fieldWidth, fieldHeight, actors } = this.props;

    const targetActor = actors.find(a => areTheSameField(a, this.state.cursorCoords));
    const pathToCursor = this.getPathToCursor();
    const numSteps = pathToCursor.length;

    if (pathToCursor.length === 0) {
      return '';
    }

    let targetCoords = pathToCursor[numSteps-1];
    let animation;
    let direction;

    if (targetActor && targetActor.side !== this.props.currentActor.side) {
      animation = ANIMATION_KNOCKOUT;
      direction = getDirection(pathToCursor[numSteps-1], targetActor);

    } else if (pathToCursor.length >= 2) {
      animation = ANIMATION_WALK;
      direction = getDirection(pathToCursor[numSteps-2], pathToCursor[numSteps-1]);

    } else {
      return '';
    }

    return (
      <Actor
        type    = {this.props.currentActor.type}

        row     = {targetCoords.row}
        column  = {targetCoords.column}

        offsetX = {this.props.offsetX}
        offsetY = {this.props.offsetY}

        fieldWidth  = {this.props.fieldWidth}
        fieldHeight = {this.props.fieldHeight}

        forceLoop = {true}
        opacity   = {0.4}
        animation = {animation}
        direction = {direction}
      />
    );
  }

  renderActors () {

    const sortedActors = [ ...this.props.actors ].sort((a1, a2) => a1.row - a2.row);
    const getCoords    = createMapping(this.props);

    return sortedActors.map((actor, i) => {
      const { x, y } = getCoords(actor);
      return (
        <Actor
          {...actor}

          key = {actor.idx}

          offsetX = {this.props.offsetX}
          offsetY = {this.props.offsetY}

          fieldWidth  = {this.props.fieldWidth}
          fieldHeight = {this.props.fieldHeight}

          isActive  = {this.props.currentActor.idx === actor.idx}
        />
      );
    });
  }

  render () {
    const { speed: distance = 0 } = this.props.currentActor;
    return (
      <g ref         = {n => this.root = n}
         onClick     = {this.handleMouseClick}
         onMouseMove = {this.handleMouseMove}
         onMouseOut  = {this.handleMouseMove}
      >
        <FieldSet
          fields      = {this.getFieldsWithinDistance(distance)}
          fieldWidth  = {this.props.fieldWidth}
          fieldHeight = {this.props.fieldHeight}
          offsetX     = {this.props.offsetX}
          offsetY     = {this.props.offsetY}
          opacity     = {this.props.isActive ? 0.5 : 0.01}
        />

        <FieldSet
          fields      = {this.props.obstacles}
          fieldWidth  = {this.props.fieldWidth}
          fieldHeight = {this.props.fieldHeight}
          offsetX     = {this.props.offsetX}
          offsetY     = {this.props.offsetY}
          opacity     = {1.0}
          fill        = 'url(#blockedFieldPattern)'
        />

        <FieldSet
          fields      = {this.getPathToCursor(this.props, this.state)}
          fieldWidth  = {this.props.fieldWidth}
          fieldHeight = {this.props.fieldHeight}
          offsetX     = {this.props.offsetX}
          offsetY     = {this.props.offsetY}
          cutHoles    = {true}
          borderWidth = {8}
          opacity     = {0.5}
          fill        = 'black'
        />

        <Field
          fieldWidth  = {this.props.fieldWidth}
          fieldHeight = {this.props.fieldHeight}
          offsetX     = {this.props.offsetX}
          offsetY     = {this.props.offsetY}
          cutHoles    = {!this.props.isActive}
          fill        = {'red'}
          opacity     = {this.props.isActive ? 1.0 : 0.2}

          {...this.props.currentCoords}
        />

        <FieldSet
          nRows       = {this.props.nRows}
          nColumns    = {this.props.nColumns}
          fieldWidth  = {this.props.fieldWidth}
          fieldHeight = {this.props.fieldHeight}
          offsetX     = {this.props.offsetX}
          offsetY     = {this.props.offsetY}
          opacity     = {0.9}
          cutHoles    = {true}
          borderWidth = {2}
        />

        {this.renderActors()}
        {this.renderGhost()}
      </g>
    );
  }
}

Board.propTypes = {
  isActive    : React.PropTypes.bool.isRequired,
  actors      : React.PropTypes.array.isRequired,
  obstacles   : React.PropTypes.array.isRequired,
  nRows       : React.PropTypes.number.isRequired,
  nColumns    : React.PropTypes.number.isRequired,
  offsetX     : React.PropTypes.number.isRequired,
  offsetY     : React.PropTypes.number.isRequired,
  fieldWidth  : React.PropTypes.number.isRequired,
  fieldHeight : React.PropTypes.number.isRequired,

  currentCoords : React.PropTypes.object.isRequired,
  currentActor  : React.PropTypes.object.isRequired,
};
