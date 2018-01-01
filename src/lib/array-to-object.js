export default function arrayToObject(fields = []) {
  return fields.reduce((prev, path) => {
    const key = path.split(`.`).slice(-1)[0];

    if (prev[key]) {
      throw new Error(`The key \`${key}\` is already in use.`);
    }

    // eslint-disable-next-line no-param-reassign
    prev[key] = path;

    return prev;
  }, {});
}
