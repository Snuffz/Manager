const Settings = require("../../models/settings.js"),
Command = require("../../base/Command.js");

class ReasonCmd extends Command {
  constructor (client) {
    super(client, {
      name: "reason",
      description: "changes the reason in moderation log",
      category: "Moderation",
      usage: "[case] <reason>",
      guildOnly: true,
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id }); 

    if(!args[0]) return reply(`${this.client.config.emojis.error} Please provide a new reason.`);

    if(!isNaN(args[0]) && (parseInt(args[0]) <= -1) || parseInt(args[0]) == 0) return reply(`${this.client.config.emojis.error} The case value cannot be a negative number!`);

    if(!message.guild.channels.cache.has(settings.modLogsChannel))
    return reply(`${this.client.config.emojis.error} The mod logs are not set on this server!`);

    const modlog = message.guild.channels.cache.get(settings.modLogsChannel);

    if(!modlog.permissionsFor(message.guild.me).has("SEND_MESSAGES")||
    !modlog.permissionsFor(message.guild.me).has("READ_MESSAGE_HISTORY"))
     return reply(`${this.client.config.emojis.error} I need permission to Send Messages and Read Message History on the Moderation Logs channel to do this.`)

     if(!isNaN(args[0])) {
      modlog.messages.fetch({ limit: 100 }).then((c) => {
        if(settings.cases < args[0] || c.filter(m => m.author.id === this.client.user.id &&
          m.content &&
           m.content.substring(0,2) === '`[' &&
           m.content.split(' ')[1]&&
              m.content.split(' ')[1].substring(0,2) === '`[' &&
              !isNaN(parseInt(m.content.split(' ')[1].replace(/`/g, '').replace('[', '').replace(']', '')))&&
              parseInt(m.content.split(' ')[1].replace(/`/g, '').replace('[', '').replace(']', '')) === parseInt(args[0])
                ).size === 0) return reply(`${this.client.config.emojis.error} No recent cases with the number \`${args[0]}\` were found`)
      modlog.messages.fetch({ limit: 100 }).then((a) => {
    
       const caseLog = a.filter(m => m.author.id === this.client.user.id &&
        m.content &&
         m.content.substring(0,2) === '`[' &&
         m.content.split(' ')[1]&&
            m.content.split(' ')[1].substring(0,2) === '`[' &&
            !isNaN(parseInt(m.content.split(' ')[1].replace(/`/g, '').replace('[', '').replace(']', '')))&&
            parseInt(m.content.split(' ')[1].replace(/`/g, '').replace('[', '').replace(']', '')) === parseInt(args[0])
              ).first()
    
              const msg = caseLog.content.replace(`${caseLog.content.substring(caseLog.content.indexOf("Reason:** "))}`, `Reason:** ${args.slice(1).join(' ')}`)
    
               if(!caseLog.embeds[0]){caseLog.edit(msg)}else{caseLog.edit({content:msg, embed: caseLog.embeds[0]})}
      })
      reply(this.client.config.emojis.success + ` Case **${args[0]}** updated on channel ${modlog}`)
      })
      } else {
     modlog.messages.fetch({ limit: 100 }).then((a) => {
          if(a.filter(m => m.author.id === this.client.user.id &&
            m.content &&
             m.content.substring(0,2) === '`[' &&
             m.content.split(' ')[1]&&
                m.content.split(' ')[1].substring(0,2) === '`[' &&
                !isNaN(parseInt(m.content.split(' ')[1].replace(/`/g, '').replace('[', '').replace(']', '')))&&
                m.content.substring(m.content.indexOf("Reason:** ")+10) === '[no reason specified]'
                  ).size == 0) return reply(`${this.client.config.emojis.error} No recent cases without reason were found.`)
    
          const caseLog = a.filter(m => m.author.id === this.client.user.id &&
            m.content &&
             m.content.substring(0,2) === '`[' &&
             m.content.split(' ')[1]&&
                m.content.split(' ')[1].substring(0,2) === '`[' &&
                !isNaN(parseInt(m.content.split(' ')[1].replace(/`/g, '').replace('[', '').replace(']', '')))&&
                m.content.substring(m.content.indexOf("Reason:** ")+10) === '[no reason specified]'
                  ).first()
    
                  const msg = caseLog.content.replace(`Reason:** [no reason specified]`, `Reason:** ${args.join(' ')}`)
    
                  if(!caseLog.embeds[0]){caseLog.edit(msg)}else{caseLog.edit({content:msg, embed: caseLog.embeds[0]})}
       
                  reply(this.client.config.emojis.success + ` Case **${caseLog.content.split(' ')[1].replace(/`/g, '').replace('[', '').replace(']', '')}** updated on channel ${modlog}`)
    
         })
      }

  }
};

module.exports = ReasonCmd