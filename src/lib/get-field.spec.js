import { get } from 'unchanged';

import makeGetField from './get-field';

describe(`getField()`, () => {
  test(`It should be a function.`, () => {
    const getField = makeGetField({ get: jest.fn() });

    expect(typeof getField).toBe(`function`);
  });

  test(`It should return a function which returns the value of the state at the given path.`, () => {
    const getField = makeGetField({ get });

    expect(getField({ foo: { bar: `value` } })(`foo.bar`)).toEqual(`value`);
  });
});
