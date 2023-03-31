import {
  CLType,
} from './index';
import { ANY_TYPE, CLTypeTag } from './constants';

export class CLAnyType extends CLType {
  linksTo = ANY_TYPE;
  tag = CLTypeTag.Any;
}
