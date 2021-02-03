const warningHandler = require("./warnings.js");

class warnReceive {
  static emit (client, warnedUser, warnAuthor, guild, strikes, reason, msg) {
    try {
      warningHandler.process(client, warnedUser, warnAuthor, guild, strikes, reason, msg);
    } catch (e) {
      client.logger.log(e, "error");
    }
  }
}

module.exports = warnReceive;