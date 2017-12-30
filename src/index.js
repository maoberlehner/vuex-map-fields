import { get, set } from 'unchanged';

import arrayToObject from './lib/array-to-object';
import makeGetField from './lib/get-field';
import makeMapFields from './lib/map-fields';
import makeUpdateField from './lib/update-field';

export const createHelpers = ({ getterType, mutationType }) => ({
  [getterType]: makeGetField({ get }),
  [mutationType]: makeUpdateField({ set }),
  mapFields: makeMapFields({
    arrayToObject,
    getterType,
    mutationType,
  }),
});

export const getField = makeGetField({ get });

export const mapFields = makeMapFields({ arrayToObject });

export const updateField = makeUpdateField({ set });
