import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import { mapObjectFields, getField, updateField } from '../src';

const localVue = createLocalVue();

localVue.use(Vuex);

describe(`Component initialized with object fields setup.`, () => {
  let Component;
  let store;
  let wrapper;

  beforeEach(() => {
    Component = {
      template: `
        <div>
          <input id="name" v-model="user.name">
          <input id="email" v-model="user.email">
        </div>
      `,
      computed: {
        ...mapObjectFields({
          user: `user.*`,
        }),
      },
    };

    store = new Vuex.Store({
      state: {
        user: {
          name: `Foo`,
          email: `foo@foo.com`,
        },
      },
      getters: {
        getField,
      },
      mutations: {
        updateField,
      },
    });

    wrapper = shallowMount(Component, { localVue, store });
  });

  test(`It should render the component.`, () => {
    expect(wrapper.exists()).toBe(true);
  });

  test(`It should update field values when the store is updated.`, () => {
    store.state.user.name = `New Name`;
    store.state.user.email = `new@email.com`;

    expect(wrapper.find(`#name`).element.value).toBe(`New Name`);
    expect(wrapper.find(`#email`).element.value).toBe(`new@email.com`);
  });

  test(`It should update the store when the field values are updated.`, () => {
    wrapper.find(`#name`).element.value = `New Name`;
    wrapper.find(`#name`).trigger(`input`);

    wrapper.find(`#email`).element.value = `new@email.com`;
    wrapper.find(`#email`).trigger(`input`);

    expect(store.state.user.name).toBe(`New Name`);
    expect(store.state.user.email).toBe(`new@email.com`);
  });
});
