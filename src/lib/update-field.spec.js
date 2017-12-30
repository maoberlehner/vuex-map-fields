import { set } from 'unchanged';

import makeUpdateField from './update-field';

describe(`updateField()`, () => {
  test(`It should be a function.`, () => {
    const updateField = makeUpdateField({ set: jest.fn() });

    expect(typeof updateField).toBe(`function`);
  });

  test(`It should override the key at the given path in the state with the given value.`, () => {
    const updateField = makeUpdateField({ set });
    const mockState = { foo: { bar: `initial value` } };
    const expectedResult = { foo: { bar: `new value` } };

    updateField(mockState, { path: `foo.bar`, value: `new value` });

    expect(mockState).toEqual(expectedResult);
  });
});
