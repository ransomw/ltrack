/** base error class for all application-specific errors */
class LtError extends Error {
  constructor () {
    super()
    this.name = 'LtError';
  }
}

/** in case data cannot be saved before logout */
class LogoutNoSaveError extends LtError {
  constructor () {
    super()
    this.name = 'LogoutNoSaveError';
  }
}

var exports = {};

exports.LogoutNoSaveError = LogoutNoSaveError;

module.exports = exports;
