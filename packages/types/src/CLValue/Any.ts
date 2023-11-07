import { ANY_TYPE, CLTypeTag } from './constants';
import { CLType } from './index';

export class CLAnyType extends CLType {
  linksTo = ANY_TYPE;
  tag = CLTypeTag.Any;
}
