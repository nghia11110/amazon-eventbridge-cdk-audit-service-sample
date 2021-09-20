import { AWSEvent } from '../AWSEvent';
import { ArthurBasicInfoChanged } from '../ArthurBasicInfoChanged';
import { BasicInfo } from '../BasicInfo';

const primitives = ['string', 'boolean', 'double', 'integer', 'long', 'float', 'number', 'any'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const enumsMap: { [index: string]: any } = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typeMap: { [index: string]: any } = {
  AWSEvent: AWSEvent,
  ArthurBasicInfoChanged: ArthurBasicInfoChanged,
  BasicInfo: BasicInfo,
};

export class Marshaller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static marshall(data: any, type: string) {
    if (data == undefined) {
      return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
      return data;
    } else if (type.lastIndexOf('Array<', 0) === 0) {
      // string.startsWith pre es6
      let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
      subType = subType.substring(0, subType.length - 1); // Type> => Type
      const transformedData: unknown[] = [];
      for (const index in data) {
        const date = data[index];
        transformedData.push(Marshaller.marshall(date, subType));
      }
      return transformedData;
    } else if (type === 'Date') {
      return data.toString();
    } else {
      if (enumsMap[type]) {
        return data;
      }
      if (!typeMap[type]) {
        // in case we dont know the type
        return data;
      }

      // get the map for the correct type.
      const attributeTypes = typeMap[type].getAttributeTypeMap();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance: { [index: string]: any } = {};
      for (const index in attributeTypes) {
        const attributeType = attributeTypes[index];
        instance[attributeType.baseName] = Marshaller.marshall(data[attributeType.name], attributeType.type);
      }
      return instance;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static unmarshalEvent(data: any, detailType: any) {
    typeMap['AWSEvent'].updateAttributeTypeMapDetail(detailType.name);
    return this.unmarshal(data, 'AWSEvent');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static unmarshal(data: any, type: string) {
    // polymorphism may change the actual type.
    type = Marshaller.findCorrectType(data, type);
    if (data == undefined) {
      return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
      return data;
    } else if (type.lastIndexOf('Array<', 0) === 0) {
      // string.startsWith pre es6
      let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
      subType = subType.substring(0, subType.length - 1); // Type> => Type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedData: any[] = [];
      for (const index in data) {
        const date = data[index];
        transformedData.push(Marshaller.unmarshal(date, subType));
      }
      return transformedData;
    } else if (type === 'Date') {
      return new Date(data);
    } else {
      if (enumsMap[type]) {
        // is Enum
        return data;
      }

      if (!typeMap[type]) {
        // dont know the type
        return data;
      }
      const instance = new typeMap[type]();
      const attributeTypes = typeMap[type].getAttributeTypeMap();
      for (const index in attributeTypes) {
        const attributeType = attributeTypes[index];
        instance[attributeType.name] = Marshaller.unmarshal(data[attributeType.baseName], attributeType.type);
      }
      return instance;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static findCorrectType(data: any, expectedType: string) {
    if (data == undefined) {
      return expectedType;
    } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
      return expectedType;
    } else if (expectedType === 'Date') {
      return expectedType;
    } else {
      if (enumsMap[expectedType]) {
        return expectedType;
      }

      if (!typeMap[expectedType]) {
        return expectedType; // unknown type
      }

      // Check the discriminator
      const discriminatorProperty = typeMap[expectedType].discriminator;
      if (discriminatorProperty == null) {
        return expectedType; // the type does not have a discriminator. use it.
      } else {
        if (data[discriminatorProperty]) {
          return data[discriminatorProperty]; // use the type given in the discriminator
        } else {
          return expectedType; // discriminator was not present (or an empty string)
        }
      }
    }
  }
}
