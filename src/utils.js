export const objFromArr = (val) => {
  const obj = val.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.color }), {})
  return obj
}
