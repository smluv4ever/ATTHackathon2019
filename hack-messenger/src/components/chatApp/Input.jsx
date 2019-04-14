import { Component } from "react";
import React from "react";

class Input extends Component {
  state = {
    text: ""
  };
  onChange(e) {
    this.setState({ text: e.target.value });
  }
  onSubmit(e) {
    e.preventDefault();
    this.setState({ text: "" });
    this.props.onSendMessage(this.state.text);
  }
  render() {
    return (
      <React.Fragment>
        <div className="chat-input">
          <form onSubmit={e => this.onSubmit(e)} className="chat-form">
            <input
              onChange={e => this.onChange(e)}
              className="col-md-8 offset-2 form-control"
              value={this.state.text}
              type="text"
              placeholder="Enter your message"
              autoFocus={true}
            />
            <button className="chat-btn btn btn-outline-info col-md-8">Send</button>
          </form>
        </div>
      </React.Fragment>
    );
  }
}
export default Input;
