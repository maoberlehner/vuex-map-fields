import arrayToObject from './lib/array-to-object';

function normalizeNamespace(fn) {
  return (namespace, map, getterType, mutationType) => {
    /* eslint-disable no-param-reassign */
    if (typeof namespace !== `string`) {
      mutationType = getterType;
      getterType = map;
      map = namespace;
      namespace = ``;
    } else if (namespace.charAt(namespace.length - 1) !== `/`) {
      namespace += `/`;
    }

    getterType = `${namespace}${getterType || `getField`}`;
    mutationType = `${namespace}${mutationType || `updateField`}`;
    /* eslint-enable */

    return fn(namespace, map, getterType, mutationType);
  };
}

export function getField(state) {
  return path => path.split(/[.[\]]+/).reduce((prev, key) => prev[key], state);
}

export function updateField(state, { path, value }) {
  path.split(/[.[\]]+/).reduce((prev, key, index, array) => {
    if (array.length === index + 1) {
      // eslint-disable-next-line no-param-reassign
      prev[key] = value;
    }

    return prev[key];
  }, state);
}

export const mapFields = normalizeNamespace((namespace, fields, getterType, mutationType) => {
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

    // eslint-disable-next-line no-param-reassign
    prev[key] = field;

    return prev;
  }, {});
});

export const mapMultiRowFields = normalizeNamespace((
  namespace,
  paths,
  getterType,
  mutationType,
) => {
// export function mapMultiRowFields(paths, getterType = `getField`, mutationType = `updateField`) {
  const pathsObject = Array.isArray(paths) ? arrayToObject(paths) : paths;

  return Object.keys(pathsObject).reduce((entries, key) => {
    const path = pathsObject[key];

    // eslint-disable-next-line no-param-reassign
    entries[key] = {
      get() {
        const store = this.$store;
        const rows = store.getters[getterType](path);

        return rows.map((fieldsObject, index) =>
          Object.keys(fieldsObject).reduce((prev, fieldKey) => {
            const fieldPath = `${path}[${index}].${fieldKey}`;

            return Object.defineProperty(prev, fieldKey, {
              get() {
                return store.getters[getterType](fieldPath);
              },
              set(value) {
                store.commit(mutationType, { path: fieldPath, value });
              },
            });
          }, {}));
      },
    };

    return entries;
  }, {});
});

export const createHelpers = ({ getterType, mutationType }) => ({
  [getterType]: getField,
  [mutationType]: updateField,
  mapFields: (namespace, fields) => mapFields(namespace, fields, getterType, mutationType),
  mapMultiRowFields: (namespace, paths) => mapMultiRowFields(namespace, paths, getterType, mutationType),
});
