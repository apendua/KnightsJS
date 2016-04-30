import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Pattern } from './pattern';
import { Board } from './board';
import { Toolbar } from './toolbar';
import { MenuModal } from './menuModal';
import { AlertModal } from './alertModal';
import { createMapping } from '/imports/helpers/mappings';
import { createNewGame, moveActor, startGame, nextActor, setPreloading} from '/imports/actions';
import {
  DEFENDER,
  ATTACKER,

  MAP_COLUMNS,
  MAP_ROWS,
  SVG_WIDTH,
  SVG_HEIGHT,

  } from '/imports/constants';

class Game extends React.Component {

  constructor (props) {
    super(props);

    // -------------------
    // --- BIND EVENTS ---
    // -------------------
      
    this.handleMenuOpen = this.handleMenuOpen.bind(this);
    this.handleActorMove = this.handleActorMove.bind(this);
    this.handleAlertButton = this.handleAlertButton.bind(this);
    this.handleCreateNewGame = this.handleCreateNewGame.bind(this);
  }

  getDimensions ({ margin = 10 } = {}) {

    const { nColumns, nRows } = this.context.store.getState();
    const ratio = 22 / 30;
    const virtualColumns = nColumns + 0.5;
    const virtualRows = (0.75 * (nRows+2) + 0.25);

    let fieldWidth  = (SVG_WIDTH  - 2 * margin) / virtualColumns;
    let fieldHeight = (SVG_HEIGHT - 2 * margin) / virtualRows;

    if (fieldWidth * ratio < fieldHeight) {
      fieldHeight = fieldWidth * ratio;

    } else {
      fieldWidth = fieldHeight / ratio;
    }

    const offsetX = (SVG_WIDTH  - virtualColumns * fieldWidth) / 2;
    const offsetY = (SVG_HEIGHT - virtualRows * fieldHeight) / 2 + 0.75 * 2 * fieldHeight;

    return { fieldWidth, fieldHeight, offsetX, offsetY };
  }

  componentDidUpdate () {
    const { userId } = this.context.store.getState();
    this.refs.alertModal.setVisible(!userId);
  }

  componentDidMount() {
    const { store } = this.context;
    const { dispatch } = store;
    const { userId } = store.getState();

    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
    this.tracker = Tracker.autorun(() => {
      const gameId = FlowRouter.getParam('gameId');
      if (gameId) {
        dispatch(setPreloading(true));
        Meteor.subscribe('actionsForGame', gameId, (err) => {
          dispatch(setPreloading(false));
        });
      }
    });
  }

  isUserInterfaceActive () {
    const { userId, attackerId, defenderId, actorHasMoved } = this.context.store.getState();
    const actor = this.getCurrentActor();
    console.log(userId, attackerId, defenderId, actorHasMoved);
    if (!actor || actorHasMoved) {
      return false;
    }
    if (attackerId === userId && actor.side === ATTACKER) {
      return true;
    }
    if (defenderId === userId && actor.side === DEFENDER) {
      return true;
    }
    return false;
  }

  getCurrentActor () {
    const { currentActor, actors } = this.context.store.getState();
    return actors[currentActor] || { row: -1, column: -1, idx: -1 };
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.tracker.stop();
  }

  handleActorMove (actor, movePath, oponent) {
    const { store } = this.context;
    if (oponent && oponent.side === actor.side) {
      oponent = null;
    }
    if (!oponent && movePath.length === 1) {
      return;
    }
    store.dispatch(moveActor(actor, movePath, oponent));
  }

  handleCreateNewGame () {
    return new Promise(resolve => {

      Meteor.call('createNewGame', (err, res) => {
        if (err) {
          console.error(err);
        } else {
          resolve(res);
        }
      });

    }).then(gameId => {
      FlowRouter.go('game', { gameId });
    });
  }

  handleAlertButton () {
    if (this.props.onCookieRequested) {
      this.props.onCookieRequested();
    }
    this.refs.alertModal.setVisible(false);
  }

  handleMenuOpen () {
    this.refs.menuModal.setVisible(true);
  }

  render () {
    const { store } = this.context;
    const state = store.getState();

    const currentActor = this.getCurrentActor();
    const { fieldWidth, fieldHeight, offsetX, offsetY } = this.getDimensions();
    
    return (
      <div className="game container">
        <div className="filling panel"></div>
        <svg className="panel" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          <defs>
            <Pattern name="blockedFieldPattern" size={16}/>
          </defs>
          <Board
            isActive    = {this.isUserInterfaceActive()}
            nColumns    = {state.nColumns}
            nRows       = {state.nRows}
            obstacles   = {state.obstacles}
            fieldWidth  = {fieldWidth}
            fieldHeight = {fieldHeight}
            offsetX     = {offsetX}
            offsetY     = {offsetY}
            actors      = {state.actors}
            onActorMove = {this.handleActorMove}

            currentCoords = {{ row: currentActor.row, column: currentActor.column }}
            currentActor  = {currentActor}
          />
        </svg>
        <div className="filling panel"></div>
        <div className="panel">
          <Toolbar
            onMenuOpen      = {this.handleMenuOpen}
            onCreateNewGame = {this.handleCreateNewGame}
          />
        </div>
        <MenuModal ref='menuModal'
          onCreateNewGame={this.handleCreateNewGame}
        />
        <AlertModal
          ref           = 'alertModal'
          buttonText    = 'Accept'
          onButtonClick = {this.handleAlertButton}>
          <p>
            This site uses cookies to enable online play
          </p>
        </AlertModal>
      </div>
    );
  }
};

Game.propTypes = {
  onCookieRequested: React.PropTypes.func,
};

Game.contextTypes = {
  store: React.PropTypes.object
};

export {Game as Game};

