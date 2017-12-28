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

// Import the `updateField` mutation function
// from the `vuex-map-fields` module.
import { updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    fieldA: '',
    fieldB: '',
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
Oftentimes you want to nest the properties in the Vuex store. `vuex-map-fields` supports nested data structures by utilizing the object dot string notation.

#### Store
```js
import Vue from 'vue';
import Vuex from 'vuex';

import { updateField } from 'vuex-map-fields';

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
      // It is also possible to access
      // nested properties in arrays.
      'addresses[0].town',
    ]),
  },
};
</script>
```

### Rename properties
Sometimes you might want to give your computed properties different names than what you're using in the Vuex store. This is also possible by passing an object of fields to the `mapFields` function instead of an array.

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

## About
### Author
Markus Oberlehner  
Website: https://markus.oberlehner.net  
Twitter: https://twitter.com/MaOberlehner  
PayPal.me: https://paypal.me/maoberlehner

### License
MIT
