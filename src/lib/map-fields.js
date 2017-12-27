export default function makeMapFields({ arrayToObject, get }) {
  return function mapFields(fields) {
    const fieldsObject = Array.isArray(fields) ? arrayToObject(fields) : fields;

    return Object.keys(fieldsObject).reduce((prev, key) => {
      const path = fieldsObject[key];
      const field = {
        get() {
          return get(path, this.$store.state);
        },
        set(value) {
          this.$store.commit(`updateField`, { path, value });
        },
      };

      return Object.assign(prev, { [key]: field });
    }, {});
  };
}
