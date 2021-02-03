const Command = require("../../base/Command.js");

class Invite extends Command {
  constructor (client) {
    super(client, {
      name: "invite",
      description: "my invite",
      category: "General"
    });
  }

  async run (message, args, reply) {
reply(`**Manager** moderation bot.
- Invite Link: ${this.client.config.bot_invite}
`)
  }
}

module.exports = Invite;