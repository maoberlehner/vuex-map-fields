export function mapFields(fields) {
  // TODO eigene funktion
  const normalizedFields = Array.isArray(fields) ? fields.reduce((prev, path) => {
    const key = path.split(`.`).slice(-1)[0];

    // TODO throw error if key already set, with info that dings oder anderer key verwendet werden sollte

    // eslint-disable-next-line no-param-reassign
    prev[key] = path;

    return prev;
  }, {}) : fields;

  return Object.keys(normalizedFields).reduce((prev, key) => {
    const path = normalizedFields[key];

    // eslint-disable-next-line no-param-reassign
    prev[key] = {
      get() {
        return get(path, store.state);
      },
      set(value) {
        store.commit(`updateForm`, { path, value }); // TODO mutation name
      },
    };

    return prev;
  }, {});
}
