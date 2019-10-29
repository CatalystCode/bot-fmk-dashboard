import { IDataSourceDictionary } from '../../data-sources';
import Sample from '../../data-sources/plugins/Sample';

import { formatTests } from './formats';
import * as formats from '../../utils/data-formats';

describe('Data Formats', () => {

  let sampleMockPlugin = new Sample(<any> {
      params: {
        values: [ 'value 1', 'value 2', 'value 3' ],
        samples: {
          values: [ 'value1', 'value2', 'value3' ] 
        }
      }
    }, {});

  Object.keys(formatTests).forEach(testFormat => {

    it (testFormat, () => {

      let testCase = formatTests[testFormat];
      let tests = [];
      if (!Array.isArray(testCase)) {
        tests = [ testCase ];
      } else {
        tests = testCase;
      }

      tests.forEach(test => {
        let values = test.state;

        let mockPlugin = sampleMockPlugin;
        if (test.params) {
          mockPlugin = new Sample(<any>{
            params: test.params
          }, {});
        }

        let dependencies = test.dependencies || {};
      
        let result = formats[testFormat](test.format, test.state, dependencies, mockPlugin, {});
        expect(result).toMatchObject(test.expected);
      });
    });
  });
});
