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
          <input v-model="userFun.name">
          <input v-model="userFun.email">
          <pre>
          {{user0}}
          </pre>
          <pre>
          {{noUser}}
          </pre>
        </div>
      `,
      data() {
        return {
          ative_room: '0'
        };
      },
      computed: {
        ...mapRowFields([{userFun: (c) => { return `users[${c.ative_room}]`; }}, {user0: `users[0]`}]),
        ...mapRowFields({noUser: `users[2]`}),
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
