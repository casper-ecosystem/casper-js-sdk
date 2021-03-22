export abstract class CLType {
  abstract toString(): string;
}

export abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;
}
