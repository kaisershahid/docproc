export const execute = (ctx, directive) => {
  return "\nlook at me executing\n";
};

export const altEntry = (ctx, directive, opts) => {
  const { parameters } = opts;
  return "altEntry::" + JSON.stringify(parameters);
};
