const Command = require("../../base/Command.js");

class Ping extends Command {
  constructor (client) {
    super(client, {
      name: "ping",
      description: "send my ping",
      category: "General"
    });
  }

  async run (message, args, reply) { 
    const m = await reply("Pong!");
    const tLatency = m.createdTimestamp - message.createdTimestamp;
    m.edit(`Ping: ${tLatency}ms\nWebSocket: ${Math.round(this.client.ws.ping)}ms`);
  }
}

module.exports = Ping;
