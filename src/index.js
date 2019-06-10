import traverse from 'traverse';
import arrayToObject from './lib/array-to-object';

function computeTree(store, obj, mutationType, getterType, rootPath) {
  // eslint-disable-next-line no-param-reassign
  obj = JSON.parse(JSON.stringify(obj));

  return traverse(obj).forEach(function nodeHandler(v) {
    const path = `${rootPath}.${this.path.join(`.`)}`;
    if (this.isLeaf) {
      Object.defineProperty(
        this.parent.node,
        this.key, // eslint-disable-next-line no-use-before-define
        buildLeafPropertyObject(store, path, getterType, mutationType),
      );
    } else if (!this.isRoot) {
      Object.defineProperty(
        this.parent.node,
        this.key, // eslint-disable-next-line no-use-before-define
        buildBranchPropertyObject(store, v, path, getterType, mutationType),
      );
    }
  });
}

function buildLeafPropertyObject(store, path, getterType, mutationType) {
  return {
    get() {
      return store.getters[getterType](path);
    },
    set(value) {
      store.commit(mutationType, { path, value });
    },
  };
}

function buildBranchPropertyObject(store, computedValue, path, getterType, mutationType) {
  return {
    get() {
      return computedValue;
    },
    set(value) {
      store.commit(mutationType, { path, value });
      // eslint-disable-next-line no-param-reassign
      computedValue = computeTree(store, value, mutationType, getterType, path);
    },
  };
}

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
    let computedEntry;
    // eslint-disable-next-line no-param-reassign
    entries[key] = {
      get() {
        const store = this.$store;
        if (computedEntry) {
          return computedEntry;
        }

        const state = store.getters[getterType](path);
        computedEntry = computeTree(store, state, mutationType, getterType, path);
        return computedEntry;
      },
      set(value) {
        const store = this.$store;
        store.commit(mutationType, { path, value });

        if (typeof value !== `object`) { store.commit(mutationType, { path, value }); } else {
          const state = store.getters[getterType](path);
          computedEntry = computeTree(store, state, mutationType, getterType, path);
        }
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
