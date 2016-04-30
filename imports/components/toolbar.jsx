import React, { Component } from 'react';
import { ActionItem } from './actionItem';
import {
  nextActor,
  startGame,
  skipAnimation,
  claimAttackingTeam,
  claimDefendingTeam } from '/imports/actions';

import { DEFENDER, ATTACKER } from '/imports/constants';

export class Toolbar extends Component {

  constructor (props) {
    super(props);
    this.handleMainButton = this.handleMainButton.bind(this);
  }

  hasGameStarted () {
    const { currentRound } = this.context.store.getState();
    return currentRound >= 0;
  }

  handleMainButton () {
    const { dispatch } = this.context.store;
    const { actorHasMoved } = this.context.store.getState();
    if (!this.isUserInterfaceActive()) {
      return;
    }
    if (actorHasMoved) {
      dispatch(skipAnimation());
    } else if (this.hasGameStarted()) {
      dispatch(nextActor());
    } else {
      dispatch(startGame());
    }
  }

  getCurrentActor () {
    const { currentActor, actors } = this.context.store.getState();
    return actors[currentActor] || { row: -1, column: -1, idx: -1 };
  }

  isUserInterfaceActive () {
    const { userId, attackerId, defenderId } = this.context.store.getState();
    const actor = this.getCurrentActor();
    if (attackerId === userId && actor.side === ATTACKER) {
      return true;
    }
    if (defenderId === userId && actor.side === DEFENDER) {
      return true;
    }
    return false;
  }

  render () {

    const isActive = this.isUserInterfaceActive();
    const { store } = this.context;
    const { dispatch } = store;
    const { attackerId, defenderId, currentGameId, actorHasMoved } = store.getState();

    return (
      <div className="console">
        <ul className="menuItems">
          <li className="menuItem" onClick={this.props.onMenuOpen}>
            <i className="fa fa-bars"></i>
          </li>
          {(() => {
            if (!currentGameId || (defenderId && attackerId)) {
              return (<li className="fill disabled menuItem"></li>);
            } else if (attackerId) {
              return (<li className="fill disabled menuItem">Choose white</li>);
            } else {
              return (
                <li className="fill inverted menuItem" onClick={() => dispatch(claimAttackingTeam())}>
                  Choose white
                </li>
              );
            }
          })()}
          {(() => {
            if (!currentGameId) {
              return (
                <ActionItem
                  className = "menuItem"
                  action    = {this.props.onCreateNewGame}
                  title     = "Create New Game"
                />
              );
            } else if (attackerId && defenderId) {
              return (
                <li className={'menuItem' + (isActive ? '' : ' disabled')} onClick={this.handleMainButton}>
                  {this.hasGameStarted() ? 'Continue' : 'Start game'}
                </li>
              );
            }
          })()}
          {(() => {
            if (!currentGameId || (defenderId && attackerId)) {
              return (<li className="fill disabled menuItem"></li>);
            } else if (defenderId) {
              return (<li className="fill disabled menuItem">Choose black</li>);
            } else {
              return (
                <li className="fill menuItem" onClick={() => dispatch(claimDefendingTeam())}>
                  Choose black
                </li>
              );
            }
          })()}
          <li className="disabled menuItem">
            <i className="fa fa-wrench"></i>
          </li>
        </ul>
      </div>
    );
  }
}

Toolbar.propTypes = {
  onMenuOpen      : React.PropTypes.func,
  onCreateNewGame : React.PropTypes.func,
};

Toolbar.contextTypes = {
  store: React.PropTypes.object
};
