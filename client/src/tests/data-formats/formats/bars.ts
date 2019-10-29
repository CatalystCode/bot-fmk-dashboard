import { IFormatTest } from './formats';

export default <IFormatTest> {
  format: {
    type: 'bars', 
    args: { 
      barsField: 'barField', 
      seriesField: 'seriesField' 
    }
  },
  state: {
    values: [
      { count: 10, barField: 'bar 1', seriesField: 'series1Value' },
      { count: 15, barField: 'bar 2', seriesField: 'series1Value' },
      { count: 20, barField: 'bar 1', seriesField: 'series2Value' },
      { count: 44, barField: 'bar 3', seriesField: 'series2Value' },
    ]
  },
  expected: {
    'bars': ['series1Value', 'series2Value'],
    'bar-values': [
      {'series1Value': 10, 'series2Value': 20, 'value': 'bar 1'}, 
      {'series1Value': 15, 'value': 'bar 2'}, 
      {'series2Value': 44, 'value': 'bar 3'}
    ]
  }
};