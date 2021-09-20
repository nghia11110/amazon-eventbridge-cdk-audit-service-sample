import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
// @ts-ignore
// import * as request from '/opt/nodejs/request/aircloset';
import { handler } from '../index';

chai.use(sinonChai);
const expect = chai.expect;

describe('Call ac api', () => {
  // const stubRequestPut = sinon.stub(request, 'put');

  beforeEach(() => {    
  });

  afterEach(() => {
    // stubRequestPut.reset()
  });

  it("should call ac api once", async () => {
    // const expectRes = { status: 200, statusText: '', headers: {}, data: {}, config: {} };

    // stubRequestPut.onCall(0).resolves(expectRes);

    // act
    // const event = buildEventBridgeEvent();
    // const result = await handler(event);

    // assert
    // expect(result.status).to.equal(200);
  });

  function buildEventBridgeEvent(includeData: boolean = true) {
    return {
      id: '473edc2b-a079-4fa9-8fb3-3ccf602f4957',
      detail: {
        identifier: 'test',
        token: 'test',
        user_id: 1111,
        user_address_id: 222,
        operation: 'update',
        value: includeData ? {
          first_name: 'string',
          last_name: 'string',
          last_name_kana: 'string',
          first_name_kana: 'string',
        } : undefined,
      }
    };
  }

});