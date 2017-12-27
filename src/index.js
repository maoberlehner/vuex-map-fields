import { get, set } from 'unchanged';

import arrayToObject from './lib/array-to-object';
import makeMapFields from './lib/map-fields';
import makeUpdateField from './lib/update-field';

export const updateField = makeUpdateField({ set });

export const mapFields = makeMapFields({ arrayToObject, get });
