const Discord = require('discord.js');
const Command = require("../../base/Command.js");

class EvalCmd extends Command {
  constructor (client) {
    super(client, {
      name: "eval",
      description: "run a code",
      category: "Owner",
      usage: "<code>",
      ownerOnly: true
    });
  }

  async run (message, args, reply) {
    message.channel.startTyping();
    const code = args.join(" ");
    try {
      const evaluat = async (c) => eval(c);
      const evaled = await evaluat(code);
      const clean = await this.client.clean(this.client, evaled);

      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 1500) {
        message.channel.send("This code has passed 1500 characters:", { files: [{ attachment: Buffer.from(clean), name: "eval.txt" }] });
        message.channel.stopTyping();
        return;
      }
      reply(`${this.client.config.emojis.success} Successfully Evaluated:\n\`\`\`js\n${clean}\n\`\`\``);
    } catch (err) {
      reply(`${this.client.config.emojis.error} An error has occurred:\n\`\`\`xl\n${err}\n\`\`\``);
    }
    message.channel.stopTyping();
  }
}

module.exports = EvalCmd;