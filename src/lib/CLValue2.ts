export type CLValueTypesInternal = Bool | List;

export enum CLValueTypes {
  Bool,
  List
}

export class CLValue {
  public static list(vec: CLValueTypesInternal[] | CLValueTypes): List {
    return new List(vec);
  }

  public static bool(b: boolean): Bool {
    return new Bool(b);
  }
}

const isArrayOfCLValues = (
  data: CLValueTypesInternal[] | CLValueTypes
): data is CLValueTypesInternal[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (i: CLValueTypesInternal) =>
        i instanceof CLValue && i.type === data[0].type
    )
  );
};

export class List extends CLValue {
  protected value: CLValueTypesInternal[];
  protected vectorType: CLValueTypes;
  public type = CLValueTypes.List;

  constructor(param: CLValueTypesInternal[] | CLValueTypes) {
    super();
    // Check the length of an array, if all of the objects are instances of CLValue and if has the same type.
    if (isArrayOfCLValues(param) && param.length > 0) {
      this.vectorType = param[0].type;
      this.value = param;
    } else if (
      !isArrayOfCLValues(param) &&
      Object.values(CLValueTypes).includes(param)
    ) {
      this.vectorType = param;
      this.value = [];
    } else {
      throw new Error('No compatible values provided');
    }
  }

  get(index?: number): CLValue {
    if (index === undefined) {
      return this.value;
    }
    return this.value[index];
  }

  set(index: number, value: CLValueTypesInternal): void {
    if (index <= this.value.length) {
      this.value[index] = value;
    }
  }

  push(item: CLValueTypesInternal): void {
    if (item.type === this.vectorType) {
      this.value.push(item);
    } else {
      throw new Error('No compatible values provided');
    }
  }

  pop(): void {
    this.value.pop();
  }

  size(): number {
    return this.value.length;
  }
}

class Bool extends CLValue {
  public type = CLValueTypes.Bool;

  constructor(protected value: boolean) {
    super();
  }
}
