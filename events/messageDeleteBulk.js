const Discord = require("discord.js");
const Settings = require("../models/settings.js");
const moment = require("moment-timezone");

 const BULK_DELETED = "\ud83d\udeae"; // 🚮
 const VIEW = "\uD83D\uDCC4"; // 📄
 const DOWNLOAD = "\ud83d\udce5"; // 📥

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (messages) {
    if(!messages.first().author) return;
    const settings = await Settings.findOne({ guildID: messages.first().guild.id });
    if(!settings)
    return;
   const tc = this.client.channels.cache.get(settings.messageLog);
   if(!tc || tc.id === messages.first().channel.id)
   return;
  const entry = await messages.first().guild.fetchAuditLogs({
        type: 'MESSAGEDELETE'
      }).then(audit => audit.entries.first());
      const { executor, reason } = entry;
        if(executor.id === this.client.user.id) return;
        const attachmentChannel = this.client.channels.cache.get(this.client.config.guildLogChannel);
        let str = `-- Deleted messages on the server ${messages.first().guild.name} (${messages.first().guild.id}) in channel #${messages.first().channel.name} (${messages.first().channel.id})--\r\n`;
        await Promise.all(
          messages.map(msg => {
            const content = msg.attachments.size>0 ? `${msg.content}\r\n${msg.attachments.first().url}` : msg.content;
            str += `\r\n[${msg.createdAt}] ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) : ${content}\r\n`;
          })
        );
        const strBuffer = Buffer.from(str);
        const attachment = new Discord.MessageAttachment(
          strBuffer,
          "DeletedMessages.txt"
        );
        const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
        attachmentChannel.send(attachment).then(m => {
          const webURL = `https://txt.discord.website/?txt=${attachmentChannel.id}/${
            m.attachments.first().id
          }/DeletedMessages`;
          const downloadURL = `${m.attachments.first().url}`;
          tc.send({ content:`\`[${date}]\`
${BULK_DELETED} **${messages.array().length}** messages deleted on ${messages.first().channel.toString()}`,
embed: new Discord.MessageEmbed().setDescription(`[\`${VIEW} View\`](${webURL}) | [\`${DOWNLOAD} Download\`](${downloadURL})`)
.setColor("ffa500"),
disableMentions: "all" }).catch(()=>{});
        })
  }}