type CLValueTypes = Num | List;

enum CLValueTypesCode {
  Num,
  List
}

class CLValue {
  public static list(vec: CLValueTypes[]): List {
    return new List(vec);
  }

  public static number(val: number): Num {
    return new Num(val);
  }
}

class List extends CLValue {
  protected value: CLValueTypes[];
  public type = CLValueTypesCode.List;

  constructor(vec: CLValueTypes[]) {
    super();
    // Check the length of an array, if all of the objects are instances of CLValue and if has the same type.
    if (
      vec.length > 0 &&
      vec.every((i: CLValueTypes) => i instanceof CLValue && i.type === vec[0].type)
    ) {
      this.value = vec;
    } else {
      throw Error('No compatible values provided ');
    }
  }
}

class Num extends CLValue {
  protected value: number;
  public type = CLValueTypesCode.Num;

  constructor(val: number) {
    super();
    this.value = val;
  }
}

const x = CLValue.list([CLValue.number(1), CLValue.number(2)]);
