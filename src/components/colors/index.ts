import * as colors from 'material-colors';

var ThemeColors = [ 
  colors.pink[800], 
  colors.purple[800], 
  colors.cyan[800], 
  colors.red[800], 
  colors.blue[800], 
  colors.lightBlue[800], 
  colors.deepPurple[800],
  colors.lime[800],
  colors.teal[800] 
];

var ThemeColors2 = ThemeColors.slice().reverse();

const DangerColor = colors.red[500];
const PersonColor = colors.teal[700];
const IntentsColor = colors.teal.a700;
const GoodColor = colors.lightBlue[700];
const BadColor = colors.red[700];
const PositiveColor = colors.lightBlue[700];
const NeutralColor = colors.grey[500];

export default {
  ThemeColors,
  ThemeColors2,
  
  DangerColor,
  PersonColor,
  IntentsColor,

  GoodColor,
  BadColor,

  PositiveColor,
  NeutralColor,

  getColor: (idx) => {
    return ThemeColors[idx];
  }
};
