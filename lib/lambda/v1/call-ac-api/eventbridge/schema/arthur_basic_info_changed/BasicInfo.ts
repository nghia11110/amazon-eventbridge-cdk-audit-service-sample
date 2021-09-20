export class BasicInfo {
  'firstName': string;
  'lastName': string;
  'lastNameKana': string;
  'firstNameKana': string;
  'birthday': string;
  'imagePathtypeface': string;
  'imagePathtypebody': string;
  'occupation': number;
  'postalCode': string;
  'prefecture': string;
  'city': string;
  'street': string;
  'building': string;
  'worry': string;
  'height': number;
  'tel': string;

  private static discriminator: string | undefined = undefined;

  private static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
    {
      name: 'firstName',
      baseName: 'first_name',
      type: 'string',
    },
    {
      name: 'lastName',
      baseName: 'last_name',
      type: 'string',
    },
    {
      name: 'lastNameKana',
      baseName: 'last_name_kana',
      type: 'string',
    },
    {
      name: 'firstNameKana',
      baseName: 'first_name_kana',
      type: 'string',
    },
    {
      name: 'birthday',
      baseName: 'birthday',
      type: 'string',
    },
    {
      name: 'imagePathtypeface',
      baseName: 'image_path*type:face',
      type: 'string',
    },
    {
      name: 'imagePathtypebody',
      baseName: 'image_path*type:body',
      type: 'string',
    },
    {
      name: 'occupation',
      baseName: 'occupation',
      type: 'number',
    },
    {
      name: 'postalCode',
      baseName: 'postal_code',
      type: 'string',
    },
    {
      name: 'prefecture',
      baseName: 'prefecture',
      type: 'string',
    },
    {
      name: 'city',
      baseName: 'city',
      type: 'string',
    },
    {
      name: 'street',
      baseName: 'street',
      type: 'string',
    },
    {
      name: 'building',
      baseName: 'building',
      type: 'string',
    },
    {
      name: 'worry',
      baseName: 'worry',
      type: 'string',
    },
    {
      name: 'height',
      baseName: 'height',
      type: 'number',
    },
    {
      name: 'tel',
      baseName: 'tel',
      type: 'string',
    },
  ];

  public static getAttributeTypeMap() {
    return BasicInfo.attributeTypeMap;
  }
}
