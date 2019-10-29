import { IFormatTest } from './formats';

export default <IFormatTest> {
  format: { 
   type: 'scorecard',
   args: { 
     thresholds: [{ value: 0, heading: 'Heading', color: '#fff', icon: 'chat' }],
     subvalueField: 'other_count',
     subvalueThresholds: [{ subvalue: 0, subheading: 'Subheading' }]
   }
  },
  state: {
    values: [{ count: 99, other_count: 44 }]
  },
  expected: {
    'value': '99',
    'heading': 'Heading',
    'color': '#fff',
    'icon': 'chat',
    'subvalue': 44,
    'subheading': 'Subheading'
  }
};