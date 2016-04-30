import React, { Component } from 'react';

export class AlertModal extends Component {

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
      <div className = {'alertModal' + (this.state.isVisible ? '' : ' hidden')}>
        <div className="fill"></div>
        <div className="alertBody">
          <div className="alertContent">
            {this.props.children}
          </div>
          <div className="alertButton" onClick={this.props.onButtonClick}>
            {this.props.buttonText}
          </div>
        </div>
        <div className="fill"></div>
      </div>
    );
  }

};

