import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import { mapRowFields, getField, updateField } from '../src';

const localVue = createLocalVue();

localVue.use(Vuex);

describe(`Component initialized with row setup.`, () => {
  let Component;
  let store;
  let wrapper;

  beforeEach(() => {
    Component = {
      template: `
        <div>
          <input v-model="user.name">
          <input v-model="user.email">
          <pre>
          {{noUser}}
          </pre>
        </div>
      `,
      computed: {
        ...mapRowFields([{user: `users[0]`}, {noUser: `users[2]`}]),
      },
    };

    store = new Vuex.Store({
      state: {
        users: [
          {
            name: `Foo`,
            email: `foo@foo.com`,
          },
          {
            name: `Bar`,
            email: `bar@bar.com`,
          },
        ],
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
    store.state.users[0].name = `New Name`;
    store.state.users[0].email = `new@email.com`;

    expect(wrapper.find(`input`).element.value).toBe(`New Name`);
  });

  test(`It should update the store when the field values are updated.`, () => {
    wrapper.find(`input`).element.value = `New Name`;
    wrapper.find(`input`).trigger(`input`);

    expect(store.state.users[0].name).toBe(`New Name`);
  });
});
