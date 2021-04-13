export function getField(state: any): (path: any) => any;
export function updateField(state: any, { path, value }: {
    path: any;
    value: any;
}): void;
export function mapFields(...params: any[]): any;
export function mapMultiRowFields(...params: any[]): any;
export function createHelpers({ getterType, mutationType }: {
    getterType: any;
    mutationType: any;
}): {
    [x: number]: typeof updateField;
    mapFields: (...params: any[]) => any;
    mapMultiRowFields: (...params: any[]) => any;
};
