# vuex-map-fields
[![Build Status](https://travis-ci.org/maoberlehner/vuex-map-fields.svg?branch=master)](https://travis-ci.org/maoberlehner/vuex-map-fields)
[![Coverage Status](https://coveralls.io/repos/github/maoberlehner/vuex-map-fields/badge.svg?branch=master)](https://coveralls.io/github/maoberlehner/vuex-map-fields?branch=master)
[![GitHub stars](https://img.shields.io/github/stars/maoberlehner/vuex-map-fields.svg?style=social&label=Star)](https://github.com/maoberlehner/vuex-map-fields)

Enable two-way data binding for form fields saved in a Vuex store.

## Install
```bash
npm install --save vuex-map-fields
```

### Basic example
The following example component shows the most basic usage, for mapping fields to the Vuex store using two-way data binding with `v-model`, without directly modifying the store itself, but using getter and setter functions internally (as it is described in the official Vuex documentation: [Two-way Computed Property](https://vuex.vuejs.org/en/forms.html#two-way-computed-property)).

#### Store
```js
import Vue from 'vue';
import Vuex from 'vuex';

// Import the `getField` getter and the `updateField`
// mutation function from the `vuex-map-fields` module.
import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    fieldA: '',
    fieldB: '',
  },
  getters: {
    // Add the `getField` getter to the
    // `getters` of your Vuex store instance.
    getField,
  },
  mutations: {
    // Add the `updateField` mutation to the
    // `mutations` of your Vuex store instance.
    updateField,
  },
});
```

#### Component
```html
<template>
  <div id="app">
    <input v-model="fieldA">
    <input v-model="fieldB">
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';

export default {
  computed: {
    // The `mapFields` function takes an array of
    // field names and generates corresponding
    // computed properties with getter and setter
    // functions for accessing the Vuex store.
    ...mapFields([
      'fieldA',
      'fieldB',
    ]),
  },
};
</script>
```

### Nested properties
Oftentimes you want to have nested properties in the Vuex store. `vuex-map-fields` supports nested data structures by utilizing the object dot string notation.

#### Store
```js
import Vue from 'vue';
import Vuex from 'vuex';

import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      firstName: '',
      lastName: '',
    },
    addresses: [
      {
        town: '',
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
```

#### Component
```html
<template>
  <div id="app">
    <input v-model="firstName">
    <input v-model="lastName">
    <input v-model="town">
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';

export default {
  computed: {
    // When using nested data structures, the string
    // after the last dot (e.g. `firstName`) is used
    // for defining the name of the computed property.
    ...mapFields([
      'user.firstName',
      'user.lastName',
      // It's also possible to access
      // nested properties in arrays.
      'addresses[0].town',
    ]),
  },
};
</script>
```

### Rename properties
Sometimes you might want to give your computed properties different names than what you're using in the Vuex store. Renaming properties is made possible by passing an object of fields to the `mapFields` function instead of an array.

```html
<template>
  <div id="app">
    <input v-model="userFirstName">
    <input v-model="userLastName">
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';

export default {
  computed: {
    ...mapFields({
      userFirstName: 'user.firstName',
      userLastName: 'user.lastName',
    }),
  },
};
</script>
```

### Custom getters and mutations
By default `vuex-map-fields` is searching for the given properties starting from the root of your state object. Depending on the size of your application, the state object might become quite big and therefore updating the state starting from the root might become a performance issue. To circumvent such problems, it is possible to create a custom `mapFields()` function which is configured to access custom mutation and getter functions which don't start from the root of the state object but are accessing a specific point of the state.

#### Store
```js
import Vue from 'vue';
import Vuex from 'vuex';

import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      firstName: '',
      lastName: '',
    },
  },
  getters: {
    // By wrapping the `getField()` function we're
    // able to provide a specific property of the state.
    getUserField(state) {
      return getField(state.user);
    },
  },
  mutations: {
    // Mutating only a specific property of the state
    // can be significantly faster than mutating the
    // whole state every time a field is updated.
    updateUserField(state, field) {
      updateField(state.user, field);
    },
  },
});
```

#### Component
```html
<template>
  <div id="app">
    <input v-model="firstName">
    <input v-model="lastName">
  </div>
</template>

<script>
import { createHelpers } from 'vuex-map-fields';

// The getter and mutation types we're providing
// here, must be the same as the function names we've
// used in the store.
const { mapFields } = createHelpers({
  getterType: `getUserField`,
  mutationType: `updateUserField`,
});

export default {
  computed: {
    // Because we're providing the `state.user` property
    // to the getter and mutation functions, we must not
    // use the `user.` prefix when mapping the fields.
    ...mapFields([
      'firstName',
      'lastName',
    ]),
  },
};
</script>
```

### Vuex modules
Vuex makes it possible to divide the store into modules.

#### Store
```js
import Vue from 'vue';
import Vuex from 'vuex';

import { createHelpers } from 'vuex-map-fields';

// Because by default, getters and mutations in Vuex
// modules, are globally accessible and not namespaced,
// you most likely want to rename the getter and mutation
// helpers because otherwise you can't reuse them in multiple,
// non namespaced modules.
const { getFooField, updateFooField } = createHelpers({
  getterType: `getFooField`,
  mutationType: `updateFooField`,
});

Vue.use(Vuex);

export default new Vuex.Store({
  // ...
  modules: {
    fooModule: {
      state: {
        foo: ``,
      },
      getters: {
        getFooField,
      },
      mutations: {
        updateFooField,
      },
    },
  },
});
```

#### Component
```html
<template>
  <div id="app">
    <input v-model="foo">
  </div>
</template>

<script>
import { createHelpers } from 'vuex-map-fields';

// We're using the same getter and mutation types
// as we've used in the store above.
const { mapFields } = createHelpers({
  getterType: `getFooField`,
  mutationType: `updateFooField`,
});

export default {
  computed: {
    ...mapFields(['foo']),
  },
};
</script>
```

### Namespaced Vuex modules
By default, mutations and getters inside modules are registered under the global namespace – but you can mark modules as `namespaced` which prevents naming clashes of mutations and getters between modules.

#### Store
```js
import Vue from 'vue';
import Vuex from 'vuex';

import { getField, updateFiled } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  // ...
  modules: {
    fooModule: {
      namespaced: true,
      state: {
        foo: ``,
      },
      getters: {
        getField,
      },
      mutations: {
        updateField,
      },
    },
  },
});
```

#### Component
```html
<template>
  <div id="app">
    <input v-model="foo">
  </div>
</template>

<script>
import { createHelpers } from 'vuex-map-fields';

// `fooModule` is the name of the Vuex module.
const { mapFields } = createHelpers({
  getterType: `fooModule/getField`,
  mutationType: `fooModule/updateField`,
});

export default {
  computed: {
    ...mapFields(['foo']),
  },
};
</script>
```

### Multi-row fields
If you want to build a form which allows the user to enter multiple rows of a specific data type with multiple fields (e.g. multiple addresses) you can use the multi-row field mapping function.

#### Store
```js
import Vue from 'vue';
import Vuex from 'vuex';

import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  // ...
  state: {
    addresses: [
      {
        zip: `12345`,
        town: `Foo Town`,
      },
      {
        zip: `54321`,
        town: `Bar Town`,
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
```

#### Component
```html
<template>
  <div id="app">
    <div v-for="address in addresses">
      <label>ZIP <input v-model="address.zip"></label>
      <label>Town <input v-model="address.town"></label>
    </div>
  </div>
</template>

<script>
import { mapMultiRowFields } from 'vuex-map-fields';

export default {
  computed: {
    ...mapMultiRowFields(['addresses']),
  },
};
</script>
```

## Upgrade from 0.x.x to 1.x.x
Instead of accessing the state directly, since the 1.0.0 release, in order to enable the ability to implement custom getters and mutations, `vuex-map-fields` is using a getter function to access the state. This makes it necessary to add a getter function to your Vuex store.

```js
import Vue from 'vue';
import Vuex from 'vuex';

// You now have to also import the `getField()` function.
import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    fieldA: '',
    fieldB: '',
  },
  getters: {
    // Add the `getField` getter to the
    // `getters` of your Vuex store instance.
    getField,
  },
  mutations: {
    updateField,
  },
});
```

## About
### Author
Markus Oberlehner  
Website: https://markus.oberlehner.net  
Twitter: https://twitter.com/MaOberlehner  
PayPal.me: https://paypal.me/maoberlehner

### License
MIT
