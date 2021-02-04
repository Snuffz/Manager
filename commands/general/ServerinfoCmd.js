const Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
FormatUtil = require("../../utils/FormatUtil"),
region = {
  "brazil": ":flag_br: Brazil",
  "eu-central": "a",
  "hongkong": ":flag_hk: Hong Kong",
  "japan": ":flag_jp: Japan",
  "russia": ":flag_ru: Russia",
  "singapore": ":flag_sg: Singapore",
  "southafrica": ":flag_za: South Africa",
  "sydney": ":flag_au: Sydney",
  "us-central": ":flag_us: Central United States",
  "us-east": ":flag_us: South United States",
  "us-west": ":flag_us: North United States",
  "europe": ":flag_eu: Western Europe"
},
verificationLevels = {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: '(╯°□°）╯︵ ┻━┻',
  VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
},
linestart = "\u25AB"; // ▫️ 

class ServerinfoCmd extends Command {
  constructor (client) {
    super(client, {
      name: "serverinfo",
      description: "shows information about the guild in which the command is used",
      category: "General",
      guildOnly: true,
      aliases: ["server","guildinfo"],
      botPermissions: ['EMBED_LINKS']
    });
  }

  async run (message, args, reply) {

   var str = `${linestart} ID: **${message.guild.id}**`;

   str+=`\n${linestart} Owner: ${FormatUtil.formatUser(message.guild.owner.user)}`;

   str+=`\n${linestart} Location: **${region[message.guild.region]}**`;

   str+=`\n${linestart} Creation: **${message.guild.createdAt.toUTCString()}**`;

   str+=`\n${linestart} Boost Level: **${message.guild.premiumSubscriptionCount}**`;

   str+=`\n${linestart} Members: **${message.guild.memberCount}** (${message.guild.members.cache.filter(a => !a.user.bot).size} users, ${message.guild.members.cache.filter(a => a.user.bot).size} bots)`;

   str+=`\n${linestart} Channels: **${message.guild.channels.cache.filter(c => c.type === 'text').size}** Text, **${message.guild.channels.cache.filter(c => c.type === 'voice').size}** Voice, **${message.guild.channels.cache.filter(c => c.type === 'category').size}** Categories`
  
   str+=`\n${linestart} Verification: **${verificationLevels[message.guild.verificationLevel]}**`;

   if(message.guild.features.length > 0) str+=`\n${linestart} Features: **${message.guild.features.join(", ")}**`;

   if(message.guild.splashURL()) str+=`\n${linestart} Splash:`


  const embed = new MessageEmbed()
  .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }))
  .setDescription(str)
  .setColor(message.guild.owner.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||"")
  if(message.guild.splashURL()) embed.setImage(message.guild.splashURL({ format: 'png', size: 1024 }));
  message.channel.send({content: `**${message.guild.name}** server information:`, embed: embed, disableMentions: "all"});
}
}

    module.exports = ServerinfoCmd;