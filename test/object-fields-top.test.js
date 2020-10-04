import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import { mapObjectFields, getField, updateField } from '../src';

const localVue = createLocalVue();

localVue.use(Vuex);

describe(`Component initialized with object fields setup (top).`, () => {
  let Component;
  let store;
  let wrapper;

  beforeEach(() => {
    Component = {
      template: `
        <div>
          <input id="city" v-model="address.city">
          <input id="country" v-model="address.country">
        </div>
      `,
      computed: {
        ...mapObjectFields({
          address: `*`,
        }),
      },
    };

    store = new Vuex.Store({
      state: {
        city: `New York`,
        country: `USA`,
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
    store.state.city = `New City`;
    store.state.country = `New Country`;

    expect(wrapper.find(`#city`).element.value).toBe(`New City`);
    expect(wrapper.find(`#country`).element.value).toBe(`New Country`);
  });

  test(`It should update the store when the field values are updated.`, () => {
    wrapper.find(`#city`).element.value = `New City`;
    wrapper.find(`#city`).trigger(`input`);

    wrapper.find(`#country`).element.value = `New Country`;
    wrapper.find(`#country`).trigger(`input`);

    expect(store.state.city).toBe(`New City`);
    expect(store.state.country).toBe(`New Country`);
  });
});
