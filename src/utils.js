export const colorsArrToObj = val => {
  const obj = val.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.color }), {});
  return obj;
};

export const fontsArrToObj = val => {
  const obj = val.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.name]: {
        fontSize: cur.style.fontSize,
        textTransform: cur.style.textTransform,
      },
    }),
    {}
  );
  return obj;
};
