import AccountStore from "../../stores/AccountStore";
import AccountActions from "../../actions/AccountActions";
import { mockRequests } from '../mocks/requests/account';

describe('Data Source: Samples', () => {

  beforeAll(() => {
    mockRequests();
  })

  it ('Testing AccountActions', (done) => {

    AccountStore.listen((state) => {
      expect(state).toHaveProperty('account');
      done();
    });
    AccountActions.updateAccount();
  });
});
