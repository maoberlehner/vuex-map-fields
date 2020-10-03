/* eslint-disable import/no-duplicates */
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import componentFactory from './utils/component';
import storeFactory from './utils/store';

import {
  getField as getFieldSrc,
  mapFields as mapFieldsSrc,
  updateField as updateFieldSrc,
} from './package/dist/index.esm';

import {
  getField as getFieldDist,
  mapFields as mapFieldsDist,
  updateField as updateFieldDist,
} from './package/dist';

import {
  getField as getFieldRoot,
  mapFields as mapFieldsRoot,
  updateField as updateFieldRoot,
} from './package';

const localVue = createLocalVue();

localVue.use(Vuex);

/**
 * Run tests for packaged ./src, ./dist and ./ (pkg.main) files.
 *
 * https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#simulating-package-publishing
 */
[
  {
    dir: `./src`,
    getField: getFieldSrc,
    mapFields: mapFieldsSrc,
    updateField: updateFieldSrc,
  },
  {
    dir: `./dist`,
    getField: getFieldDist,
    mapFields: mapFieldsDist,
    updateField: updateFieldDist,
  },
  {
    dir: `./`,
    getField: getFieldRoot,
    mapFields: mapFieldsRoot,
    updateField: updateFieldRoot,
  },
].forEach(({
  dir,
  getField,
  mapFields,
  updateField,
}) => {
  const Component = componentFactory({ mapFields });

  describe(`Component initialized with functions from \`${dir}\`.`, () => {
    let store;
    let wrapper;

    beforeEach(() => {
      store = storeFactory({ getField, updateField });
      wrapper = shallowMount(Component, { localVue, store });
    });

    test(`It should render the component.`, () => {
      expect(wrapper.exists()).toBe(true);
    });

    test(`It should update field values when the store is updated.`, async () => {
      store.state.foo = `foo`;
      store.state.bar.bar = `bar`;
      store.state.baz[0].foo.baz = `baz`;

      await wrapper.vm.$nextTick();

      expect(wrapper.find(`#foo`).element.value).toBe(`foo`);
      expect(wrapper.find(`#bar`).element.value).toBe(`bar`);
      expect(wrapper.find(`#baz`).element.value).toBe(`baz`);
    });

    test(`It should update the store when the field values are updated.`, () => {
      wrapper.find(`#foo`).element.value = `foo`;
      wrapper.find(`#foo`).trigger(`input`);

      wrapper.find(`#bar`).element.value = `bar`;
      wrapper.find(`#bar`).trigger(`input`);

      wrapper.find(`#baz`).element.value = `baz`;
      wrapper.find(`#baz`).trigger(`input`);

      expect(store.state.foo).toBe(`foo`);
      expect(store.state.bar.bar).toBe(`bar`);
      expect(store.state.baz[0].foo.baz).toBe(`baz`);
    });
  });
});
