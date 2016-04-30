import React, { Component } from 'react';
import { ActionItem } from './actionItem';

export class MenuModal extends Component {

  constructor (props) {
    super(props);

    this.state = {
      isVisible : false,
    };
  }

  setVisible (value) {
    this.setState({ isVisible: !!value });
  }

  handleCloseButtonClick () {
    this.setVisible(false);
  }

  render () {

    return (
      <div className = {'menuModal' + (this.state.isVisible ? '' : ' hidden')}>
        <div className="fill"></div>
        <ul className="menuItems">
          <ActionItem
            className = "menuItem"
            action    = {this.props.onCreateNewGame}
            title     = "Create New Game"
            onReady   = {this.handleCloseButtonClick.bind(this)}
          />
          <li className="menuItem"
              onClick={this.handleCloseButtonClick.bind(this)}>
            Continue
          </li>
        </ul>
        <div className="fill"></div>
      </div>
    );
  }

};

