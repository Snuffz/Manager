const Command = require("../../base/Command.js"),
FormatUtil = require("../../utils/FormatUtil"),
os = require('os');

class DebugCmd extends Command {
  constructor (client) {
    super(client, {
      name: "debug",
      description: "shows some debug stats",
      category: "Owner",
      ownerOnly: true
    });
  }

  async run (message, args, reply) {
    var str = "";
    this.client.ws.shards.forEach(shard => {
      str+=`+ Shard ${shard.id}: ${shard.status!=0?shard.status.toUpperCase():"CONNECTED"} - ${this.client.guilds.cache.filter(a => a.shard.id === shard.id).size} guilds\n`
    })
reply(`**Manager** statistics:
Uptime: ${FormatUtil.msToTime(this.client.uptime)} ago
Memory: **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)}**MB / **${(os.totalmem() / 1024 / 1024).toFixed(0)}**MB\n
Guilds: **${this.client.guilds.cache.size}**
Average Ping: **${Date.now()-message.createdAt}**ms
Shards: **${this.client.ws.totalShards}**
Connectivity: \`\`\`diff\n${str}\`\`\``.trim())
  }
}

module.exports = DebugCmd;