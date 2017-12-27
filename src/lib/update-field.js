export default function makeUpdateField({ set }) {
  return function updateField(state, { path, value }) {
    Object.assign(state, set(path, value, state));
  };
}
