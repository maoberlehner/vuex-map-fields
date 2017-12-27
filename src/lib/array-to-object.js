export default function arrayToObject(fields = []) {
  return fields.reduce((prev, path) => {
    const key = path.split(`.`).slice(-1)[0];

    if (prev[key]) {
      throw new Error(`The key \`${key}\` is already in use.`);
    }

    return Object.assign(prev, { [key]: path });
  }, {});
}
