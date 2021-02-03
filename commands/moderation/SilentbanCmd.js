const BanCmd = require("./BanCmd");

class SilentbanCmd extends BanCmd {
    constructor (client) {
    super(client)
    this.help.name = "silentban",
    this.conf.aliases = [],
    this.help.description = "bans users without deleting messages",
    this.help.category = "Moderation",
    this.mod.daysToDelete = 0
    }
  }

  module.exports = SilentbanCmd