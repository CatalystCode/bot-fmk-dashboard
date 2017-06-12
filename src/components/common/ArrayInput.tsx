import * as React from 'react';
import Paper from 'react-md/lib/Papers';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';

interface IArrayInputProps{
    value:any
}
interface IArrayInputState{ 
  value:any
}

export default class ArrayInput extends React.Component<IArrayInputProps,IArrayInputState>{

  constructor(props: IArrayInputProps) {
        super(props);

        this.add_more = this.add_more.bind(this);
        this.remove_item = this.remove_item.bind(this);
        this.onParamChange = this.onParamChange.bind(this);
    }
    
    state:IArrayInputState ={
        value : (!this.props.value || this.props.value == '')?['']:this.props.value
    }

  
  add_more() {
    let new_val = this.state.value.concat([]);
    new_val.push('');
    this.setState({ value: new_val });
  }

  remove_item(i,e) {
    let new_state = this.state.value.concat([]);
    new_state[i] = undefined;
    this.setState({ value: new_state });
  }

  onParamChange(value: any, event: any) {
        var arr = this.state.value.concat([]);
        arr[event.target.key] = value;
        this.setState({value:arr});
    }

  render() {
    let me = this;

    let lines = this.state.value.map( function(e, i) {
      if (e == undefined) {
        return null;
      }

      return (
        <div  className="md-grid">
          <TextField className="md-cell md-cell--bottom md-cell--10" value={e} onChange={me.onParamChange} key={i}/>
          <Button icon onClick={me.remove_item.bind(null, i)} className="md-cell md-cell--bottom md-cell--2">close</Button>
        </div>
      )
    }).filter( function(e) {
      return e != undefined;
    })

    return (
      
        <Paper zDepth={1} className="">
          {lines}
          <Button raised secondary floating onClick={this.add_more} label="Add" style={{"float":"right","margin":"5px"}}>add</Button>
        </Paper>
      
    )
  }
};