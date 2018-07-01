import Vuex, { mapMutations } from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import { getField, mapFields, pushArray, setArray, removeArray } from './package/src';

const localVue = createLocalVue();

localVue.use(Vuex);

describe(`Component initialized with Vuex module.`, () => {
  let Component;
  let store;
  let wrapper;

  beforeEach(() => {
    Component = {
      template: `
        <div>
          <button id="push" @click="pushArray({path: 'foo', value: 'push'})"></button>
          <button id="set" @click="setArray({path: 'foo', value: 'set', arrayIndex: 0})"></button>
          <button id="remove" @click="removeArray({path: 'foo', arrayIndex: 0})"></button>
        </div>
      `,
      methods: {
        ...mapMutations([
          `pushArray`,
          `setArray`,
          `removeArray`,
        ]),
      },
      computed: {
        ...mapFields([
          `foo`,
        ]),
      },
    };

    store = new Vuex.Store({
      modules: {
        fooModule: {
          state: {
            foo: [`foo`],
          },
          getters: {
            getField,
          },
          mutations: {
            pushArray,
            setArray,
            removeArray,
          },
        },
      },
    });

    wrapper = shallowMount(Component, { localVue, store });
  });

  test(`It should render the component.`, () => {
    expect(wrapper.exists()).toBe(true);
  });

  test(`It should be pushed the store array element when the button is clicked.`, () => {
    wrapper.find(`#push`).trigger(`click`);

    expect(store.state.fooModule.foo.length).toBe(2);
    expect(store.state.fooModule.foo[1]).toBe(`push`);
  });

  test(`It should be updated the store array element when the button is clicked.`, () => {
    wrapper.find(`#set`).trigger(`click`);

    expect(store.state.fooModule.foo.length).toBe(1);
    expect(store.state.fooModule.foo[0]).toBe(`set`);
  });

  test(`It should be removed the store array element when the button is clicked.`, () => {
    wrapper.find(`#remove`).trigger(`click`);

    expect(store.state.fooModule.foo.length).toBe(0);
  });
});
