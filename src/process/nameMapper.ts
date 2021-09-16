export const isTypes = (dep: string) => /^@types\//.test(dep);

// * `ora` <=> `@types/ora`
// * `@babel/core` <=> `@types/babel__core`

export const depName2typeName = (name: string): string => {
  if (/@.+\/.*/.test(name)) {
    return `@types/` + name.replace('@', '').replace('/', '__');
  } else {
    return `@types/` + name;
  }
};

export const typeName2depName = (name: string): string => {
  if (/@types\/.+__.+/.test(name)) {
    return '@' + name.replace(`@types/`, '').split('__').join('/');
  } else {
    return name.replace(`@types/`, '');
  }
};
