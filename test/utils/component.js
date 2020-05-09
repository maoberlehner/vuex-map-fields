export default ({ mapFields }) => ({
  template: `
    <div>
      <input id="foo" v-model="foo">
      <input id="bar" v-model="bar">
      <input id="baz" v-model="baz">
    </div>
  `,
  computed: {
    ...mapFields([
      `foo`,
      `bar.bar`,
      `baz[0].foo.baz`,
    ]),
  },
});
