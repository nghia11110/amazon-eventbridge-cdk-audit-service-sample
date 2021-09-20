import { BasicInfo } from './BasicInfo';

export class ArthurBasicInfoChanged {
  'userId': number;
  'userAddressId': number;
  'identifier': string;
  'token': string;
  'operation': string;
  'value': BasicInfo;

  private static discriminator: string | undefined = undefined;

  private static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
    {
      name: 'userId',
      baseName: 'user_id',
      type: 'number',
    },
    {
      name: 'userAddressId',
      baseName: 'user_address_id',
      type: 'number',
    },
    {
      name: 'identifier',
      baseName: 'identifier',
      type: 'string',
    },
    {
      name: 'token',
      baseName: 'token',
      type: 'string',
    },
    {
      name: 'operation',
      baseName: 'operation',
      type: 'string',
    },
    {
      name: 'value',
      baseName: 'value',
      type: 'BasicInfo',
    },
  ];

  public static getAttributeTypeMap() {
    return ArthurBasicInfoChanged.attributeTypeMap;
  }
}
