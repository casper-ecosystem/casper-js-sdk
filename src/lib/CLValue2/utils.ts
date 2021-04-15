import { BOOL_ID, LIST_ID } from './constants';
import { CLValue, CLType, CLBoolType, CLListType } from './index';

// const cl_type = { List: { List: 'Bool' } };

export const matchTypeToCLType = (type: any): CLType => {
  if (typeof type === typeof 'string') {
    switch (type) {
      case BOOL_ID:
        return new CLBoolType();
      default:
        throw new Error(`The simple type ${type} is not supported`);
    }
  }

  if (typeof type === typeof {}) {
    if (LIST_ID in type) {
      const inner = matchTypeToCLType(type[LIST_ID]) as CLType;
      return new CLListType(inner);
    }
    throw new Error(`The complex type ${type} is not supported`);
  }

  throw new Error(`Unknown data provided.`);
};

export const buildCLValueFromJson = (json: any): CLValue => {
  const clType = matchTypeToCLType(json.cl_type);
  const ref = clType.linksTo;
  const clValue = ref.fromJSON(json);
  return clValue;
};
