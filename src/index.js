import arrayToObject from './lib/array-to-object';

function objectEntries(obj) {
  return Object.keys(obj).map(key => [key, obj[key]]);
}

function typeOf(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
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
  return path => path.split(/[.[\]]+/).filter(x => x).reduce((prev, key) => prev[key], state);
}

export function updateField(state, { path, value }) {
  path.split(/[.[\]]+/).filter(x => x).reduce((prev, key, index, array) => {
    if (array.length === index + 1) {
      // eslint-disable-next-line no-param-reassign
      prev[key] = value;
    }

    return prev[key];
  }, state);
}

export const mapFields = normalizeNamespace((
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
        const tpath = typeof path === `function` ? path.call(null, this) : path;
        const store = this.$store;
        const row = store.getters[getterType](tpath);

        if (!row || typeOf(row) !== `object`) return row;

        return Object.keys(row).reduce((prev, fieldKey) => {
          const fieldPath = `${tpath}.${fieldKey}`;
          return Object.defineProperty(prev, fieldKey, {
            get() {
              return store.getters[getterType](fieldPath);
            },
            set(value) {
              store.commit(mutationType, { path: fieldPath, value });
            },
          });
        }, {});
      },
      set(value) {
        const tpath = typeof path === `function` ? path.call(null, this) : path;
        this.$store.commit(mutationType, { path: tpath, value });
      },
    };

    return entries;
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
        const tpath = typeof path === `function` ? path.call(null, this) : path;
        const store = this.$store;
        const rows = objectEntries(store.getters[getterType](tpath));

        return rows
          .map(fieldsObject => Object.keys(fieldsObject[1]).reduce((prev, fieldKey) => {
            const fieldPath = `${tpath}[${fieldsObject[0]}].${fieldKey}`;

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
