import * as React from 'react';
import * as _ from 'lodash';
import Paper from 'react-md/lib/Papers';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';
import Chip from 'react-md/lib/Chips';
import Divider from 'react-md/lib/Dividers';

interface ITokenInputProps {
  tokens: any[];
  zDepth: number;
  onTokensChanged(): void;
};

interface ITokenInputState {
  newToken: any;
};

/**
 * This is a UI for editing a string array.
 */
export default class TokenInput extends React.Component<ITokenInputProps, ITokenInputState> {

  state: ITokenInputState = {
    newToken: ''
  };

  constructor(props: ITokenInputProps) {
    super(props);
    this.removeToken = this.removeToken.bind(this);
    this.onNewTokenChange = this.onNewTokenChange.bind(this);
    this.addToken = this.addToken.bind(this);
  }

  removeToken(token: any) {
    let tokens = this.props.tokens;
    _.remove(tokens, x => x === token);
    if (this.props.onTokensChanged) {
      this.props.onTokensChanged();
    }
    this.setState(this.state); // foce the component to update
  }

  onNewTokenChange(newData: any) {
    this.setState({ newToken: newData });
  }

  addToken() {
    if (this.state.newToken) {
      let {tokens} = this.props;
      tokens = tokens || [];
      tokens.push(this.state.newToken);
      this.setState({
        newToken: ''
      });
      if (this.props.onTokensChanged) {
        this.props.onTokensChanged();
      }
    }
  }

  render() {
    let { tokens, zDepth } = this.props;
    let { newToken } = this.state;

    let chips = tokens.map((token: string, index: number) => (
      <Chip
        key={index}
        onClick={this.removeToken.bind(this, token)}
        removable
        label={token}
      />
    ));

    return (
      <Paper zDepth={zDepth} >
        <div style={{ padding: 5 }}>
          {chips}
        </div>
        <Divider />
        <div className="md-grid">
          <TextField
            id="addTokenInput"
            lineDirection="center"
            placeholder="Add a value"
            className="md-cell md-cell--bottom"
            value={newToken}
            onChange={this.onNewTokenChange}
          />
          <Button icon primary onClick={this.addToken} className="md-cell">add_circle</Button>
        </div>
      </Paper>
    );
  }
};