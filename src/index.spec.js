import {
  createHelpers,
  getField,
  mapFields,
  mapMultiRowFields,
  updateField,
} from '.';

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

    describe(`Namespacing`, () => {
      test(`It should call the namespaced getter function.`, () => {
        const mockGetter = jest.fn();
        const objectOfFields = { foo: `foo` };
        const mappedFields = mapFields(`fooModule/`, objectOfFields);

        mappedFields.foo.get.apply({ $store: { getters: { 'fooModule/getField': mockGetter } } });

        expect(mockGetter).toBeCalledWith(`foo`);
      });

      test(`It should call the namespaced getter function even if no trailing slash is provided.`, () => {
        const mockGetter = jest.fn();
        const objectOfFields = { foo: `foo` };
        const mappedFields = mapFields(`fooModule`, objectOfFields);

        mappedFields.foo.get.apply({ $store: { getters: { 'fooModule/getField': mockGetter } } });

        expect(mockGetter).toBeCalledWith(`foo`);
      });

      test(`It should commit the namespaced mutation function.`, () => {
        const commitMock = jest.fn();
        const objectOfFields = {
          foo: `foo`,
          bar: `bar.baz`,
        };
        const mappedFields = mapFields(`fooModule`, objectOfFields);

        mappedFields.bar.set.apply({ $store: { commit: commitMock } }, [`newFieldValue`]);

        expect(commitMock).toBeCalledWith(`fooModule/updateField`, { path: `bar.baz`, value: `newFieldValue` });
      });
    });
  });

  describe(`mapMultiRowFields()`, () => {
    test(`It should be possible to re-map the initial path.`, () => {
      const expectedResult = {
        otherFieldRows: { get: expect.any(Function) },
      };

      expect(mapMultiRowFields({ otherFieldRows: `fieldRows` })).toEqual(expectedResult);
    });

    test(`It should get the value of a property via the \`getField()\` function.`, () => {
      const mockFieldRows = [
        {
          foo: `Foo`,
          bar: `Bar`,
        },
        {
          foo: `Foo`,
          bar: `Bar`,
        },
      ];
      const mockGetField = jest.fn().mockReturnValue(mockFieldRows);
      const mappedFieldRows = mapMultiRowFields([`fieldRows`]);

      const getterSetters = mappedFieldRows.fieldRows.get.apply({
        $store: { getters: { getField: mockGetField } },
      });

      // eslint-disable-next-line no-unused-vars
      const x = getterSetters[0].bar; // Trigger getter function.
      expect(mockGetField).lastCalledWith(`fieldRows[0].bar`);

      // eslint-disable-next-line no-unused-vars
      const y = getterSetters[1].foo; // Trigger getter function.
      expect(mockGetField).lastCalledWith(`fieldRows[1].foo`);
    });

    test(`It should commit new values to the store.`, () => {
      const mockFieldRows = [
        {
          foo: `Foo`,
          bar: `Bar`,
        },
        {
          foo: `Foo`,
          bar: `Bar`,
        },
      ];
      const mockCommit = jest.fn();
      const mappedFieldRows = mapMultiRowFields([`fieldRows`]);

      const getterSetters = mappedFieldRows.fieldRows.get.apply({
        $store: {
          getters: { getField: () => mockFieldRows },
          commit: mockCommit,
        },
      });

      getterSetters[0].bar = `New Bar`; // Trigger setter function.
      expect(mockCommit).toBeCalledWith(`updateField`, { path: `fieldRows[0].bar`, value: `New Bar` });

      getterSetters[1].foo = `New Foo`; // Trigger setter function.
      expect(mockCommit).toBeCalledWith(`updateField`, { path: `fieldRows[1].foo`, value: `New Foo` });
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
      expect(typeof helpers.mapMultiRowFields).toBe(`function`);
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

    test(`It should call the \`mapMultiRowFields()\` function with the provided getter and mutation types.`, () => {
      const helpers = createHelpers({ getterType: `getFoo`, mutationType: `updateFoo` });
      const expectedResult = {
        foo: {
          get: expect.any(Function),
        },
      };

      expect(helpers.mapMultiRowFields([`foo`])).toEqual(expectedResult);
    });
  });
});
