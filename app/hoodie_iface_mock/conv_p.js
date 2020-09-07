module.exports = function (val) {
  if (val instanceof Promise) {
    return val
  }
  return Promise.resolve(val)
};
