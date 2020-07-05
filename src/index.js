import arrayToObject from './lib/array-to-object';

function objectEntries(obj) {
  return Object.keys(obj).map(key => [key, obj[key]]);
}

function normalizeNamespace(fn) {
  return (...params) => {
    // eslint-disable-next-line prefer-const
    let [namespace, map, options, mutationType] =
      typeof params[0] === `string` ? [...params] : [``, ...params];
    let signature = `legacy`;
    let getterType;

    if (namespace.length && namespace.charAt(namespace.length - 1) !== `/`) {
      namespace += `/`;
    }

    if (typeof options === `object`) {
      options.getterType = `${namespace}${options.getterType || `getField`}`;
      options.mutationType = `${namespace}${options.mutationType || `updateField`}`;
      signature = `options`;
    } else {
      getterType = options;
      getterType = `${namespace}${getterType || `getField`}`;
      mutationType = `${namespace}${mutationType || `updateField`}`;
    }
    if (signature === `options`) {
      return fn(namespace, map, options);
    }

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
        const rows = objectEntries(store.getters[getterType](path));

        return rows
          .map(fieldsObject => Object.keys(fieldsObject[1]).reduce((prev, fieldKey) => {
            const fieldPath = `${path}[${fieldsObject[0]}].${fieldKey}`;

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


export const createHelpers = ({ getterType, mutationType, options }) => ({
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
  ))
});

