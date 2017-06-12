import * as nock from 'nock';

function mockRequests() {

  nock('http://localhost')
    .get('/auth/account')
    .reply(200, {
      account: 'account'
    });
}
export {
  mockRequests
};