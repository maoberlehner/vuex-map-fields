import { updateField, mapFields } from './';

describe(`index`, () => {
  describe(`updateField()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof updateField).toBe(`function`);
    });
  });

  describe(`mapFields()`, () => {
    test(`It should be a function.`, () => {
      expect(typeof mapFields).toBe(`function`);
    });
  });
});
