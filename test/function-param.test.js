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
	          <input v-model="name">
	        </div>
	    </div>
      `,
      data() {
        return {
          ative_room: '0'
        };
      },
      computed: {
        ...mapFields([{name: (c) => `users[${c.ative_room}].name` }]),
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
    // store.state.users[0].email = `new@email.com`;

    expect(wrapper.find(`input`).element.value).toBe(`New Name`);
  });

  test(`It should update the store when the field values are updated.`, () => {
    wrapper.find(`input`).element.value = `New Name`;
    wrapper.find(`input`).trigger(`input`);

    expect(store.state.users[0].name).toBe(`New Name`);
  });
});
