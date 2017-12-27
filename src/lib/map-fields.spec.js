import makeMapFields from './map-fields';

describe(`arrayToObject()`, () => {
  test(`It should be a function.`, () => {
    const mapFields = makeMapFields({ arrayToObject: jest.fn(), get: jest.fn() });

    expect(typeof mapFields).toBe(`function`);
  });

  test(`It should map getter and setter functions to an object of fields.`, () => {
    const mapFields = makeMapFields({ arrayToObject: jest.fn(), get: jest.fn() });
    const objectOfFields = {
      foo: `foo`,
      bar: `bar`,
    };
    const expectedResult = {
      foo: {
        get: expect.anything(),
        set: expect.anything(),
      },
      bar: {
        get: expect.anything(),
        set: expect.anything(),
      },
    };

    expect(mapFields(objectOfFields)).toEqual(expectedResult);
  });

  test(`It should should map getter and setter functions to an array of fields`, () => {
    const mockArrayToObject = () => ({
      foo: `foo`,
      bar: `bar`,
    });
    const mapFields = makeMapFields({ arrayToObject: mockArrayToObject, get: jest.fn() });
    const arrayOfFields = [
      `foo`,
      `bar`,
    ];
    const expectedResult = {
      foo: {
        get: expect.anything(),
        set: expect.anything(),
      },
      bar: {
        get: expect.anything(),
        set: expect.anything(),
      },
    };

    expect(mapFields(arrayOfFields)).toEqual(expectedResult);
  });

  test(`It should call the injected \`get\` function when calling a field getter.`, () => {
    const getMock = jest.fn();
    const mapFields = makeMapFields({ arrayToObject: jest.fn(), get: getMock });
    const objectOfFields = {
      foo: `foo`,
      bar: `bar.baz`,
    };
    const mappedFields = mapFields(objectOfFields);

    mappedFields.bar.get.apply({ $store: { state: `mockState` } });

    expect(getMock).toBeCalledWith(`bar.baz`, `mockState`);
  });

  test(`It should commit the \`updateField\` mutation when calling a field setter.`, () => {
    const commitMock = jest.fn();
    const mapFields = makeMapFields({ arrayToObject: jest.fn(), get: jest.fn() });
    const objectOfFields = {
      foo: `foo`,
      bar: `bar.baz`,
    };
    const mappedFields = mapFields(objectOfFields);

    mappedFields.bar.set.apply({ $store: { commit: commitMock } }, [`newFieldValue`]);

    expect(commitMock).toBeCalledWith(`updateField`, { path: `bar.baz`, value: `newFieldValue` });
  });
});
