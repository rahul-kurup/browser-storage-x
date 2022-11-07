const isUndefined = (val: any) => val === undefined;
const isNull = (val: any) => val === null;
const isNullOrUndefined = (val: any) => isNull(val) || isUndefined(val);

export const checkItem = {
  isUndefined,
  isNull,
  isNullOrUndefined,
};

export const noop = () => {};

export const withImg = (imgName: string) => `/assets/images/${imgName}`;
