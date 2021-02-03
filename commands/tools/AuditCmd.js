const
Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
linestart = "\u25AB"; // ▫

class AuditCmd extends Command {
  constructor (client) {
    super(client, {
      name: "audit",
      description: "shows the latest audit logs",
      category: "Tools",
      usage: "[number]",
      guildOnly: true,
      userPermissions: ["VIEW_AUDIT_LOG"],
      botPermissions: ["VIEW_AUDIT_LOG","EMBED_LINKS"],
      cooldown: 5
    });
  }

  async run (message, args, reply) { 
    let startPos = 0;
    let page = 1;
    if (args[0] && !isNaN(args[0]) && args[0] > 0) { //valid page number?
        startPos = (args[0] - 1) * 5;
        page = args[0];
    }
            const audit = await message.guild.fetchAuditLogs();
        const entries = audit.entries.array();
        if(page > audit.entries.size) return reply(`${this.client.config.emojis.error} Invalid page number.`)
        const embed = new MessageEmbed()
            .setColor(message.guild.me.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position+b.position).map(a =>a.color)[0]||"")
            .addField(`${linestart} Log #${startPos + 1}`, format(entries[startPos]))
            .addField(`${linestart} Log #${startPos + 2}`, format(entries[startPos + 1]))
            .addField(`${linestart} Log #${startPos + 3}`, format(entries[startPos + 2]))
            .addField(`${linestart} Log #${startPos + 4}`, format(entries[startPos + 3]))
            .addField(`${linestart} Log #${startPos + 5}`, format(entries[startPos + 4]));
        await message.channel.send({content: `${this.client.config.emojis.success} Audit log number #${page} for **${message.guild.name}**:`, embed: embed, disableMentions: "all" });

        function format(entry) {

            if (entry.actionType == "DELETE") {
                return `\tTimestamp: ${entry.createdAt.toUTCString()()}\n\tAction: ${entry.action}`
                    + `\n\tExecutor: **${entry.executor.username}**#${entry.executor.discriminator}`;
            }
            else {
                return `\tTimestamp: ${entry.createdAt.toUTCString()()}\n\tAction: ${entry.action}`
                    + `\n\tExecutor: **${entry.executor.username}**#${entry.executor.discriminator}\n\tChanges: ${JSON.stringify(entry.changes)}`;
            }
        }
}
}
module.exports = AuditCmd