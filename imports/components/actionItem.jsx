import React, { Component } from 'react';

export class ActionItem extends Component {

  constructor (props) {
    super(props);
    this.state = {
      isWaiting: false
    };
  }

  handleClick () {
    if (this.state.isWaiting) return;
    //---------------------------------------------------------------------------
    let promise = typeof this.props.action === 'function' && this.props.action();
    if (promise && typeof promise.then === 'function') {
      this.setState({ isWaiting : true });
      promise
        .then(() => this.setState({ isWaiting : false }))
        .then(() => { if (this.props.onReady) this.props.onReady(); });
    }
  }

  render () {
    return (
      <li className = {this.props.className}
          onClick   = {this.handleClick.bind(this)}>
        {(()=>{
          if (this.state.isWaiting) {
            return (<i className="fa fa-cog fa-spin fa-fw"></i>);
          } else {
            return this.props.title;
          }
        })()}
      </li>
    );
  }

}
