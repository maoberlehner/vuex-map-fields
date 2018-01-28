import { createHelpers, getField, mapFields, updateField } from './';

describe(`index`, () => {
  describe(`getField()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof getField).toBe(`function`);
    });

    test(`It should return a function which returns the value of the state at the given path.`, () => {
      expect(getField({ foo: { bar: `value` } })(`foo.bar`)).toEqual(`value`);
    });
  });

  describe(`updateField()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof updateField).toBe(`function`);
    });

    test(`It should override the key at the given path in the state with the given value.`, () => {
      const mockState = { foo: { bar: `initial value` } };
      const expectedResult = { foo: { bar: `new value` } };

      updateField(mockState, { path: `foo.bar`, value: `new value` });

      expect(mockState).toEqual(expectedResult);
    });
  });

  describe(`mapFields()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof mapFields).toBe(`function`);
    });

    test(`It should map getter and setter functions to an object of fields.`, () => {
      const objectOfFields = {
        foo: `foo`,
        bar: `bar`,
      };
      const expectedResult = {
        foo: {
          get: expect.any(Function),
          set: expect.any(Function),
        },
        bar: {
          get: expect.any(Function),
          set: expect.any(Function),
        },
      };

      expect(mapFields(objectOfFields)).toEqual(expectedResult);
    });

    test(`It should should map getter and setter functions to an array of fields`, () => {
      const arrayOfFields = [
        `foo`,
        `bar`,
      ];
      const expectedResult = {
        foo: {
          get: expect.any(Function),
          set: expect.any(Function),
        },
        bar: {
          get: expect.any(Function),
          set: expect.any(Function),
        },
      };

      expect(mapFields(arrayOfFields)).toEqual(expectedResult);
    });

    test(`It should call the getter function defined by the \`getterType\` when calling a field getter.`, () => {
      const mockGetter = jest.fn();
      const objectOfFields = { foo: `foo` };
      const mappedFields = mapFields(objectOfFields);

      mappedFields.foo.get.apply({ $store: { getters: { getField: mockGetter } } });

      expect(mockGetter).toBeCalledWith(`foo`);
    });

    test(`It should commit the \`updateField\` mutation when calling a field setter.`, () => {
      const commitMock = jest.fn();
      const objectOfFields = {
        foo: `foo`,
        bar: `bar.baz`,
      };
      const mappedFields = mapFields(objectOfFields);

      mappedFields.bar.set.apply({ $store: { commit: commitMock } }, [`newFieldValue`]);

      expect(commitMock).toBeCalledWith(`updateField`, { path: `bar.baz`, value: `newFieldValue` });
    });
  });

  describe(`createHelpers()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof createHelpers).toBe(`function`);
    });

    test(`It should return an object of helper functions.`, () => {
      const helpers = createHelpers({ getterType: `getFoo`, mutationType: `updateFoo` });

      expect(typeof helpers.getFoo).toBe(`function`);
      expect(typeof helpers.updateFoo).toBe(`function`);
      expect(typeof helpers.mapFields).toBe(`function`);
    });

    test(`It should call the \`mapFields()\` function with the provided getter and mutation types.`, () => {
      const helpers = createHelpers({ getterType: `getFoo`, mutationType: `updateFoo` });
      const expectedResult = {
        foo: {
          get: expect.any(Function),
          set: expect.any(Function),
        },
      };

      expect(helpers.mapFields([`foo`])).toEqual(expectedResult);
    });
  });
});
