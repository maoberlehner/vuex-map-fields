export default function makeGetField({ get }) {
  return function getField(state) {
    return path => get(path, state);
  };
}
