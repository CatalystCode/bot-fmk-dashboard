import { IFormatTest } from './formats';

export default <IFormatTest[]> [
  {
    format: 'retention',
    state: {
      values: [
        {
          totalUnique: 10,
          totalUniqueUsersIn24hr: 5,
          totalUniqueUsersIn7d: 7,
          totalUniqueUsersIn30d: 10,
          returning24hr: 3,
          returning7d: 3,
          returning30d: 6
        }
      ]
    },
    expected: {
      'returning': 0, 
      'returning24hr': 3, 
      'returning30d': 6, 
      'returning7d': 3, 
      'total': 0, 
      'totalUnique': 10,
      'totalUniqueUsersIn24hr': 5, 
      'totalUniqueUsersIn30d': 10, 
      'totalUniqueUsersIn7d': 7, 
      'values': [
        { 'retention': '60%', 'returning': 3, 'timespan': '24 hours', 'unique': 5 }, 
        { 'retention': '43%', 'returning': 3, 'timespan': '7 days', 'unique': 7 }, 
        { 'retention': '60%', 'returning': 6, 'timespan': '30 days', 'unique': 10 }
      ]
    }
  },
  {
    format: 'retention',
    dependencies: {
      selectedTimespan: 'PT24H'
    },
    state: {
      values: [
        {
          totalUnique: 10,
          totalUniqueUsersIn24hr: 5,
          totalUniqueUsersIn7d: 7,
          totalUniqueUsersIn30d: 10,
          returning24hr: 3,
          returning7d: 3,
          returning30d: 6
        }
      ]
    },
    expected: {
      'returning': 3, 
      'returning24hr': 3, 
      'returning30d': 6, 
      'returning7d': 3, 
      'total': 5, 
      'totalUnique': 10,
      'totalUniqueUsersIn24hr': 5, 
      'totalUniqueUsersIn30d': 10, 
      'totalUniqueUsersIn7d': 7, 
      'values': [
        { 'retention': '60%', 'returning': 3, 'timespan': '24 hours', 'unique': 5 }, 
        { 'retention': '43%', 'returning': 3, 'timespan': '7 days', 'unique': 7 }, 
        { 'retention': '60%', 'returning': 6, 'timespan': '30 days', 'unique': 10 }
      ]
    }
  }
];