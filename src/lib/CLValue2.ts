export type CLValueTypes = Bool | List;

export enum CLValueTypesCode {
  Bool,
  List
}

export class CLValue {
  public static list(vec: CLValueTypes[] | CLValueTypesCode): List {
    return new List(vec);
  }

  public static bool(b: boolean): Bool {
    return new Bool(b);
  }
}

function isArrayOfCLValues(
  data: CLValueTypes[] | CLValueTypesCode
): data is CLValueTypes[] {
  return (
    Array.isArray(data) &&
    data.every(
      (i: CLValueTypes) => i instanceof CLValue && i.type === data[0].type
    )
  );
}

export class List extends CLValue {
  protected value: CLValueTypes[];
  protected vectorType: CLValueTypesCode;
  public type = CLValueTypesCode.List;

  constructor(param: CLValueTypes[] | CLValueTypesCode) {
    super();
    // Check the length of an array, if all of the objects are instances of CLValue and if has the same type.
    if (isArrayOfCLValues(param) && param.length > 0) {
      this.vectorType = param[0].type;
      this.value = param;
    } else if (
      !isArrayOfCLValues(param) &&
      Object.values(CLValueTypesCode).includes(param)
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

  push(item: CLValueTypes): void {
    if (item.type === this.vectorType) {
      this.value.push(item);
    } else {
      throw new Error('No compatible values provided');
    }
  }

  size(): number {
    return this.value.length;
  }
}

class Bool extends CLValue {
  public type = CLValueTypesCode.Bool;

  constructor(protected value: boolean) {
    super();
  }
}

// const x = CLValue.list([CLValue.bool(true), CLValue.bool(false)]);
