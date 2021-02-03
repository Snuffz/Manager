const
Command = require("../../base/Command.js"),
FormatUtil = require("../../utils/FormatUtil");

class VoicekickCmd extends Command {
  constructor (client) {
    super(client, {
      name: "voicekick",
      description: "kicks users on voice channel",
      category: "Moderation",
      usage: "<@users>",
      guildOnly: true,
      aliases: ['vkick'],
      botPermissions: ['MOVE_MEMBERS'],
      userPermissions: ['MOVE_MEMBERS'],
      
    });
  }

  async run (message, args, reply) {
    const { victims } = message.context,
    victimmsg = [];

    if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);

    await victims.forEach(async e => {
      try
      {
         await this.client.users.fetch(e)
          }
           catch(e) { return victimmsg.push(`${this.client.config.emojis.error} Please include at least one user (@mention or ID).`) }
     
           const user = await this.client.users.fetch(e);
           user.member = message.guild.members.cache.get(user.id);

           if(!user.member) return victimmsg.push(`${this.client.config.emojis.warning} <@${e}> is not on the server.`);

           if (message.member.roles.highest.position <= user.member.roles.highest.position && message.guild.ownerID !== message.author.id) return victimmsg.push(`${this.client.config.emojis.error} You do not have permission to voicekick ${FormatUtil.formatUser(user)}`);
           if(message.guild.ownerID === user.id || user.member.roles.highest.position >= message.guild.me.roles.highest.position) return victimmsg.push(`${this.client.config.emojis.error} I do not have permission to voicekick ${FormatUtil.formatUser(user)}`);
        
           if(!user.member.voice.channel) return victimmsg.push(`${this.client.config.emojis.warning} ${FormatUtil.formatUser(user)} is not on a voice channel.`);

           if(user.member.roles.cache.has(message.guild.settings.modRole)) return victimmsg.push(`${this.client.config.emojis.error} I won't voicekick ${FormatUtil.formatUser(user)} because they have the Moderator Role.`);

           user.member.voice.kick()
           .then(() => {
            victimmsg.push(`${this.client.config.emojis.success} ${FormatUtil.formatUser(user)} has been voicekicked.`);
           })
           .catch(async () => victimmsg.push(`${this.client.config.emojis.error} Failed to voicekick ${FormatUtil.formatUser(user)}`))
          }); 
          var interval = setInterval(()=>{if(victims.length==victimmsg.length){ reply(victimmsg.join("\n")); clearInterval(interval)}},100); 
  }
};

module.exports = VoicekickCmd