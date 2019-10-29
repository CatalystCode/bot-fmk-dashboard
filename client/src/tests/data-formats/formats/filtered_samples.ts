import * as _ from 'lodash';
import { IFormatTest } from './formats';

const values = [
  { name: 'skype-en', value: 9, locale: 'en', channel: 'skype' },
  { name: 'skype-fr', value: 8, locale: 'fr', channel: 'skype' },
  { name: 'skype-de', value: 7, locale: 'de', channel: 'skype' },
  { name: 'messenger-en', value: 6, locale: 'en', channel: 'messenger' },
  { name: 'messenger-fr', value: 5, locale: 'fr', channel: 'messenger' },
  { name: 'messenger-de', value: 4, locale: 'de', channel: 'messenger' },
  { name: 'slack-en', value: 3, locale: 'en', channel: 'slack' },
  { name: 'slack-fr', value: 2, locale: 'fr', channel: 'slack' },
  { name: 'slack-de', value: 1, locale: 'de', channel: 'slack' }
];

export default <IFormatTest[]> [
  {
    format: 'filtered_samples',
    params: {
      samples: { values },
      filters: [
        { dependency: 'selectedFilter1', queryProperty: 'locale' },
        { dependency: 'selectedFilter2', queryProperty: 'channel' }
      ]
    },
    dependencies: {
      values,
      selectedFilter1: [],
      selectedFilter2: []
    },
    state: { values: [ 'value 1', 'value 2', 'value 3' ] },
    expected:  {
      'filtered_values': values
    }
  },
  {
    format: 'filtered_samples',
    params: {
      samples: { values },
      filters: [
        { dependency: 'selectedFilter1', queryProperty: 'locale' },
        { dependency: 'selectedFilter2', queryProperty: 'channel' }
      ]
    },
    dependencies: {
      values,
      selectedFilter1: ['en'],
      selectedFilter2: []
    },
    state: { values: [ 'value 1', 'value 2', 'value 3' ] },
    expected:  {
      'filtered_values': _.filter(values, { locale: 'en' })
    }
  }
];