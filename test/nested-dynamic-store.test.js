import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import { createHelpers, getField, updateField } from './package/src';

const localVue = createLocalVue();

localVue.use(Vuex);

const { mapFields } = createHelpers({
  getterType: `getFormField`,
  mutationType: `updateFormField`,
});

describe(`Component initialized with customized getter and mutation functions.`, () => {
  let Component;
  let store;
  let wrapper;

  beforeEach(() => {
    Component = {
      template: `<input id="foo" v-model="foo3">`,
      computed: {
        ...mapFields([
          `foo1.foo2.foo3`,
        ]),
      },
    };

    store = new Vuex.Store({
      state: {
        form: { foo1: {} },
      },
      getters: {
        getFormField(state) {
          return getField(state.form);
        },
      },
      mutations: {
        updateFormField(state, payload) {
          updateField(state.form, payload);
        },
      },
    });

    wrapper = shallowMount(Component, { localVue, store });
  });

  test(`It should render the component.`, () => {
    expect(wrapper.exists()).toBe(true);
  });

  test(`It should update field values when the store is updated.`, () => {
    store.commit('updateFormField', {path:'foo1.foo2.foo3', value:'fooValue'}, true);
    // store.state.form.foo1.foo2.foo3 = `fooValue`;

    expect(wrapper.element.value).toBe(`fooValue`);
  });

  test(`It should update the store when the field values are updated.`, () => {
    wrapper.element.value = `fooValue`;
    wrapper.trigger(`input`);

    expect(store.state.form.foo1.foo2.foo3).toBe(`fooValue`);
  });
});
