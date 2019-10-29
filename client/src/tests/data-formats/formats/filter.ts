import { IFormatTest } from './formats';

export default <IFormatTest> {
  format: 'filter',
  state: {
    values: [
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' }
    ]
  },
  expected: {
    'values-all': [ 'value 1', 'value 2', 'value 3' ],
    'values-selected': [ ],
  }
};