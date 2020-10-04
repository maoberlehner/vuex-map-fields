import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import { createHelpers, getField, updateField } from '../src';

const localVue = createLocalVue();

localVue.use(Vuex);

const { mapFields } = createHelpers({
  getterType: `getField`,
  mutationType: `updateField`,
});

describe(`Component initialized with row setup.`, () => {
  let Component;
  let store;
  let wrapper;

  beforeEach(() => {

    Component = {
      template: `
        <div>
          <div>
            <input v-model="user.name">
            <input v-model="user.email">
          </div>
      </div>
      `,
      data() {
        return {
          ative_room: '0'
        };
      },
      computed: {
        ...mapFields({user: `users[0]` }),
      }
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
    expect(wrapper.find(`input:nth-child(2)`).element.value).toBe(`new@email.com`);
  });

  test(`It should update the store when the field values are updated.`, () => {
    wrapper.find(`input`).element.value = `Foo`;
    wrapper.find(`input:nth-child(2)`).element.value = `foo@foo.com`;
    wrapper.find(`input`).trigger(`input`);
    wrapper.find(`input:nth-child(2)`).trigger(`input`);

    expect(store.state.users[0].name).toBe(`Foo`);
    expect(store.state.users[0].email).toBe(`foo@foo.com`);
  });
});
