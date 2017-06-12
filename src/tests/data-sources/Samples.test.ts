import { IDataSourceDictionary } from '../../data-sources';
import { setupTests } from '../utils/setup';
import dashboardMock from '../mocks/dashboards/samples';

describe('Data Source: Samples', () => {

  let dataSources: IDataSourceDictionary;

  beforeAll((done) => {
    dataSources = setupTests(dashboardMock, done);
  });

  it ('Check basic data == 3 rows', () => {

    expect(dataSources).toHaveProperty('samples');
    expect(dataSources.samples).toHaveProperty('store');
    expect(dataSources.samples).toHaveProperty('action');
    expect(dataSources.samples.store).toHaveProperty('state', {
      values: [
        { id: "value1", count: 60 },
        { id: "value2", count: 10 },
        { id: "value3", count: 30 }
      ]
    });
  });
});
