export default function makeMapFields({
  arrayToObject,
  getterType = `getField`,
  mutationType = `updateField`,
}) {
  return function mapFields(fields) {
    const fieldsObject = Array.isArray(fields) ? arrayToObject(fields) : fields;

    return Object.keys(fieldsObject).reduce((prev, key) => {
      const path = fieldsObject[key];
      const field = {
        get() {
          return this.$store.getters[getterType](path);
        },
        set(value) {
          this.$store.commit(mutationType, { path, value });
        },
      };

      return Object.assign(prev, { [key]: field });
    }, {});
  };
}
