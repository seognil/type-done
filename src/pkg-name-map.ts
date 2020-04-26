export const isTypes = (dep: string) => /^@types\//.test(dep);

// * `ora` <=> `@types/ora`
// * `@babel/core` <=> `@types/babel__core`

export const dep2type = (name: string): string => {
  if (/@.+\/.*/.test(name)) {
    return `@types/` + name.replace('@', '').replace('/', '__');
  } else {
    return `@types/` + name;
  }
};

export const type2dep = (name: string): string => {
  if (/@types\/.+__.+/.test(name)) {
    return '@' + name.replace(`@types/`, '').split('__').join('/');
  } else {
    return name.replace(`@types/`, '');
  }
};
