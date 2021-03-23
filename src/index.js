import arrayToObject from './lib/array-to-object';

function objectEntries(obj) {
  return Object.keys(obj).map(key => [key, obj[key]]);
}

function normalizeNamespace(fn) {
  return (...params) => {
    // eslint-disable-next-line prefer-const
    let [namespace, map, getterType, mutationType] = typeof params[0] === `string`
      ? [...params]
      : [``, ...params];

    if (namespace.length && namespace.charAt(namespace.length - 1) !== `/`) {
      namespace += `/`;
    }

    getterType = `${namespace}${getterType || `getField`}`;
    mutationType = `${namespace}${mutationType || `updateField`}`;

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
  const pathsObject = Array.isArray(paths) ? arrayToObject(paths) : paths;

  return Object.keys(pathsObject).reduce((entries, key) => {
    const path = pathsObject[key];

    // eslint-disable-next-line no-param-reassign
    entries[key] = {
      get() {
        const store = this.$store;
        const rows = store.getters[getterType](path);

        const defineProperties = (fieldsObject, index, path) => {
          return Object.keys(fieldsObject).reduce((prev, fieldKey) => {

            let fieldPath = index !== false ? `${path}[${index}].${fieldKey}` : `${path}.${fieldKey}`;

            return Object.defineProperty(prev, fieldKey, {
              get() {
                if (typeof fieldsObject[fieldKey] === 'object' && fieldsObject[fieldKey] !== null) {
                  return defineProperties(fieldsObject[fieldKey], false, fieldPath)
                }
                return store.getters[getterType](fieldPath);
              },
              set(value) {
                store.commit(mutationType, { path: fieldPath, value });
              },
            });
          }, {})
        };

        return rows
          .map((fieldsObject, index) => {
            return defineProperties(fieldsObject, index, path)
          });
      },
    };

    return entries;
  }, {});
});

export const createHelpers = ({ getterType, mutationType }) => ({
  [getterType]: getField,
  [mutationType]: updateField,
  mapFields: normalizeNamespace((namespace, fields) => mapFields(
    namespace,
    fields,
    getterType,
    mutationType,
  )),
  mapMultiRowFields: normalizeNamespace((namespace, paths) => mapMultiRowFields(
    namespace,
    paths,
    getterType,
    mutationType,
  )),
});
