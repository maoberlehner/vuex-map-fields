import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import { mapMultiRowFields, getField, updateField } from '../src';

const localVue = createLocalVue();

localVue.use(Vuex);

describe(`Component initialized with multi row setup.`, () => {
  let Component;
  let store;
  let wrapper;

  beforeEach(() => {
    Component = {
      template: `
        <div>
          <div v-for="user in users">
            <input v-model="user.name">
            <input v-model="user.email">
            <input v-model="user.address.city">
          </div>
        </div>
      `,
      computed: {
        ...mapMultiRowFields([`users`]),
      },
    };

    store = new Vuex.Store({
      state: {
        users: [
          {
            name: `Foo`,
            email: `foo@foo.com`,
            address: {
              city: 'Foo Bar'
            },
          },
          {
            name: `Bar`,
            email: `bar@bar.com`,
            address: {
              city: 'Foo Bar'
            },
          },
          {
            name: `Foo`,
            email: `foo@foo.com`,
            address: {
              city: 'Foo Bar'
            },
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

  test(`It should update field values when the store is updated.`, async () => {
    store.state.users[0].name = `New Name`;
    store.state.users[1].email = `new@email.com`;
    store.state.users[2].address.city = `New City Name`;
    
    await wrapper.vm.$nextTick();

    expect(wrapper.find(`input`).element.value).toBe(`New Name`);
    expect(wrapper.find(`div:nth-child(2) input:nth-child(2)`).element.value).toBe(`new@email.com`);
    expect(wrapper.find(`div:nth-child(3) input:nth-child(3)`).element.value).toBe(`New City Name`);
  });

  test(`It should update the store when the field values are updated.`, () => {
    wrapper.find(`input`).element.value = `New Name`;
    wrapper.find(`input`).trigger(`input`);

    // The following line was added because otherwise the tests are failing.
    // This is a pretty dirty workaround for some problem with @vue/test-utils.
    // eslint-disable-next-line no-unused-expressions
    wrapper.find(`div:nth-child(2)`);

    wrapper.find(`div:nth-child(2) input:nth-child(2)`).element.value = `new@email.com`;
    wrapper.find(`div:nth-child(2) input:nth-child(2)`).trigger(`input`);

    wrapper.find(`div:nth-child(2) input:nth-child(3)`).element.value = `New City Name`;
    wrapper.find(`div:nth-child(2) input:nth-child(3)`).trigger(`input`);

    expect(store.state.users[0].name).toBe(`New Name`);
    expect(store.state.users[1].email).toBe(`new@email.com`);
    expect(store.state.users[1].address.city).toBe(`New City Name`);
  });
});
