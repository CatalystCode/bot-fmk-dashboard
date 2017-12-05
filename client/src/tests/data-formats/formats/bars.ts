import { IFormatTest } from './formats';

export default <IFormatTest[]>[
  {
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
      ],
      'isTimeChart': false
    }
  },
  {
    format: {
      type: 'bars', 
      args: { 
        barsField: 'timestamp', 
        seriesField: 'sum_itemCount' 
      }
    },
    state: {
      values: [
        { timestamp: '2017-08-31T01:30:00Z', sum_itemCount: 1 },
        { timestamp: '2017-08-31T02:00:00Z', sum_itemCount: 40 },
        { timestamp: '2017-08-31T08:00:00Z', sum_itemCount: 28 },
        { timestamp: '2017-08-30T16:30:00Z', sum_itemCount: 60 },
        { timestamp: '2017-08-30T20:00:00Z', sum_itemCount: 12 },
        { timestamp: '2017-08-31T02:30:00Z', sum_itemCount: 3 }
      ]
    },
    expected: {
      'bars': ['sum_itemCount'],
      'bar-values': [
        { timestamp: '2017-08-30T16:30:00Z', sum_itemCount: 60, time: 1504110600000 },
        { timestamp: '2017-08-30T20:00:00Z', sum_itemCount: 12, time: 1504123200000 },
        { timestamp: '2017-08-31T01:30:00Z', sum_itemCount: 1, time: 1504143000000 },
        { timestamp: '2017-08-31T02:00:00Z', sum_itemCount: 40, time: 1504144800000 },
        { timestamp: '2017-08-31T02:30:00Z', sum_itemCount: 3, time: 1504146600000 },
        { timestamp: '2017-08-31T08:00:00Z', sum_itemCount: 28, time: 1504166400000 }
      ],
      'isTimeChart': true
    }
  }
];