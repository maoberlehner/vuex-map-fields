import arrayToObject from './array-to-object';

describe(`arrayToObject()`, () => {
  test(`It should be a function.`, () => {
    expect(typeof arrayToObject).toBe(`function`);
  });

  test(`It should return an object.`, () => {
    expect(typeof arrayToObject()).toBe(`object`);
  });

  test(`It should return an empty object if no \`fields\` parameter is given.`, () => {
    expect(arrayToObject()).toEqual({});
  });

  test(`It should set the given value in the array as key and value.`, () => {
    expect(arrayToObject([`foo`])).toEqual({ foo: `foo` });
  });

  test(`It should set the last key in a dot notation object as key.`, () => {
    expect(arrayToObject([`foo.bar.baz`])).toEqual({ baz: `foo.bar.baz` });
  });

  test(`It should throw an error if a key is already set.`, () => {
    const fields = [
      `foo`,
      `bar.bar`,
      `baz[0].bar`,
    ];

    expect(() => arrayToObject(fields)).toThrow();
  });

  test(`It should work with multiple values.`, () => {
    const fields = [
      `foo`,
      `bar.bar`,
      `baz[0].foo.baz`,
    ];
    const expectedResult = {
      foo: `foo`,
      bar: `bar.bar`,
      baz: `baz[0].foo.baz`,
    };

    expect(arrayToObject(fields)).toEqual(expectedResult);
  });
});
