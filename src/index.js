import arrayToObject from './lib/array-to-object';

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
        const isFunctionGetter = typeof path === `function`;
        if (isFunctionGetter) {
          const param = path.call(this);
          const getter = this.$store.getters(param);
          return typeof getter === `function`
            ? getter(path.name)
            : getter;
        }

        return this.$store.getters[getterType](path);
      },
      set(value) {
        const isFunctionGetter = typeof path === `function`;
        const param = isFunctionGetter ? path.call(this) : null;
        const values = { path, value };
        if (param) {
          values.param = param;
        }
        this.$store.commit(mutationType, values);
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
        // eslint-disable-next-line no-unused-vars
        let param = null;
        const isFunctionGetter = typeof path === `function`;
        if (isFunctionGetter) {
          param = path.call(this);
        }
        const store = this.$store;
        const getter = store.getters[getterType];
        const pathToUse = isFunctionGetter ? path.name : path;
        const rows = isFunctionGetter
          ? getter(param)(pathToUse)
          : getter(pathToUse);

        return rows.map((fieldsObject, index) =>
          Object.keys(fieldsObject).reduce((prev, fieldKey) => {
            const fieldPath = `${pathToUse}[${index}].${fieldKey}`;

            return Object.defineProperty(prev, fieldKey, {
              get() {
                if (isFunctionGetter) {
                  return getter(param)(fieldPath);
                }
                return getter(fieldPath);
              },
              set(value) {
                const values = { path: fieldPath, value };
                if (param) {
                  values.param = param;
                }
                store.commit(mutationType, values);
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
