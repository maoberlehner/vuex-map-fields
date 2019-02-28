import arrayToObject from './lib/array-to-object';
import Vue from 'vue';

function normalizeNamespace(fn) {
  return (...params) => {
    // eslint-disable-next-line prefer-const
    let [namespace, map, getterType, mutationType] =
      typeof params[0] === `string` ? [...params] : [``, ...params];

    if (namespace.length && namespace.charAt(namespace.length - 1) !== `/`) {
      namespace += `/`;
    }

    getterType = `${namespace}${getterType || `getField`}`;
    mutationType = `${namespace}${mutationType || `updateField`}`;

    return fn(namespace, map, getterType, mutationType);
  };
}

export function getField(state) {
  return path => path.split(/[.[\]]+/).reduce((prev, key) => prev && prev.hasOwnProperty(key)?prev[key]:null, state);
}

export function updateField(state, { path, value }) {

  console.log('pathsplit', path.split(/[.[\]]+/));
  path.split(/[.[\]]+/).reduce((prev, key, index, array) => {
    // console.log(`BEFORE: array: ${array}  -- index:${index}  -- key:${key} --- prev:`, prev);
    // console.log('BEFORE: prev[key]:', prev[key]);

    const nv = index == array.length-1 ? value: prev[key] != null ? prev[key]: {}
    if (index < array.length - 1){
      Vue.set(prev, key, prev[key] ? prev[key]: {});
    }
    else { // last key
      Vue.set(prev, key, value);
    }

    // console.log(`AFTER: array: ${array}  -- index:${index}  -- key:${key} --- prev:`, prev);

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
  mapFields: normalizeNamespace((namespace, fields) =>
    mapFields(namespace, fields, getterType, mutationType)),
  mapMultiRowFields: normalizeNamespace((namespace, paths) =>
    mapMultiRowFields(namespace, paths, getterType, mutationType)),
});
