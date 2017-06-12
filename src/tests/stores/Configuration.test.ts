import ConfigurationsStore from "../../stores/ConfigurationsStore";
import ConfigurationsActions from "../../actions/ConfigurationsActions";
import { mockRequests } from '../mocks/requests/configuration';

describe('Data Source: ConfigurationsActions', () => {

  beforeAll(() => {
    mockRequests();
  })

  it ('Testing load', (done) => {

    ConfigurationsStore.listen((state) => {

      try {
        expect(state).toHaveProperty('dashboards');
        expect(state).toHaveProperty('templates');
        done();
      } catch (e) {
        done(e);
        throw e;
      }
    });
    ConfigurationsActions.loadConfiguration();
  });
});
