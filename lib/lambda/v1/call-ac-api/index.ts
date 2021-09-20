// @ts-ignore
import * as request  from '/opt/nodejs/request/aircloset';
import { Marshaller } from './eventbridge/schema/arthur_basic_info_changed/marshaller/Marshaller';
import { ArthurBasicInfoChanged } from './eventbridge/schema/arthur_basic_info_changed/ArthurBasicInfoChanged';
// import { BasicInfo } from './src/modules/schema/arthur_basic_info_changed/BasicInfo';
import { AWSEvent } from './eventbridge/schema/arthur_basic_info_changed/AWSEvent';

const host = process.env.AC_API_HOST || 'http://127.0.0.1:14320';
const path = process.env.AC_API_PATH || '/v1.13/arthur/sync';
const requestMethod = process.env.METHOD === 'post' ? request.post : (process.env.METHOD === 'put' ? request.put : (process.env.METHOD === 'delete' ? request.del : request.get)); 

async function handler(input: any): Promise<any> {
  try {
    const event: AWSEvent<ArthurBasicInfoChanged> = Marshaller.unmarshalEvent(input, ArthurBasicInfoChanged);
    const arthurBasicInfoChanged: ArthurBasicInfoChanged = event.detail;
    // const basicInfo: BasicInfo = arthurBasicInfoChanged.value;

    const { identifier, token } = arthurBasicInfoChanged;

    // const res = await requestMethod(host, path, { identifier, token }, arthurBasicInfoChanged);
    const res = await request.post(host, path, { identifier, token }, arthurBasicInfoChanged);

    return { status: res.status };
  } catch (e) {
    console.log('There has been an error while trying to call ac api', e);
    throw e;
  }
}

export { handler };
