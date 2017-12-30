import { createHelpers, getField, mapFields, updateField } from './';

describe(`index`, () => {
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
  });

  describe(`getField()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof getField).toBe(`function`);
    });
  });

  describe(`mapFields()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof mapFields).toBe(`function`);
    });
  });

  describe(`updateField()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof updateField).toBe(`function`);
    });
  });
});
