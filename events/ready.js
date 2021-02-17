const
TempMuteManager = require("../models/managers/TempMuteManager"),
TempBanManager = require("../models/managers/TempBanManager"),
PremiumManager = require("../models/managers/PremiumManager"),
TempSlowmodeManager = require("../models/managers/TempSlowmodeManager");

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run () {
    this.client.user.setActivity(`Use ${this.client.config.prefix}help`);
    setInterval(() => {
      postStats(this.client);
    }, 3e5);
    setInterval(async() => {
      await PremiumManager.checkExpirations(this.client);
      TempMuteManager.checkUnmutes(this.client);
      TempBanManager.checkUnbans(this.client);
      TempSlowmodeManager.checkSlowmode(this.client);
    }, 10*100*60);

   console.log(`Servers [${this.client.guilds.cache.size}] Users [${this.client.users.cache.filter(a => !a.bot).size}]`)
  }
}
function postStats(client)
{
  const IBL = require("infinity-api");
  const stats = new IBL(client.user.id, client.config.iblToken);
    stats.postStats(client.guilds.cache.size, client.ws.totalShards);
}
