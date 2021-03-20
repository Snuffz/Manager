const Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
LINESTART = "\u25AB"; // ▫️ 

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
  const guild = message.guild;
  const owner = guild.owner;
  const usersCount = message.guild.members.cache.filter(m => !m.user.bot).size;
  const botsCount = message.guild.members.cache.filter(m => m.user.bot).size;
  const builder = new MessageEmbed();
  const title = `**${guild.name}** server information:`
  .replace("discord.gg/", "dis\u0441ord.gg/"); // cyrillic c;
  var verif;
  switch(guild.verificationLevel)
  {
    case "VERY_HIGH":
      verif = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻";
      break;
    case "HIGH": 
      verif = "(╯°□°）╯︵ ┻━┻";
      break;
    default:
      verif = guild.verificationLevel;
      break;
  }
  const emojis = {
    "brazil": "\uD83C\uDDE7\uD83C\uDDF7 Brazil", // 🇧🇷
    "eu-central": "\uD83C\uDDEA\uD83C\uDDFA Europe Central", // 🇪🇺
    "hongkong": "\uD83C\uDDED\uD83C\uDDF0 Hong Kong", // 🇭🇰
    "japan": "\uD83C\uDDEF\uD83C\uDDF5 Japan", // 🇯🇵
    "russia": "\uD83C\uDDF7\uD83C\uDDFA Russia",// 🇷🇺
    "singapore": "\uD83C\uDDF8\uD83C\uDDEC Singapore", // 🇸🇬
    "southafrica": "\uD83C\uDDFF\uD83C\uDDE6 South Africa", // 🇿🇦
    "sydney": "\uD83C\uDDE6\uD83C\uDDFA Sydney", // 🇦🇺
    "us-central": "\uD83C\uDDFA\uD83C\uDDF8 Central United States", // 🇺🇸
    "us-east": "\uD83C\uDDFA\uD83C\uDDF8 South United States", // 🇺🇸
    "us-west": "\uD83C\uDDFA\uD83C\uDDF8 North United States", // 🇺🇸
    "europe": "\uD83C\uDDEA\uD83C\uDDFA Western Europe" // 🇪🇺
  }
let str = `${LINESTART}ID: **${guild.id}**\n`
+ `${LINESTART}Owner: ${owner == null ? "Unknown" : `**${owner.user.username}**#${owner.user.discriminator}`}\n`
+ `${LINESTART}Location: **${emojis[guild.region]}**\n`
+ `${LINESTART}Creation: **${guild.createdAt.toUTCString()}**\n`
+ `${LINESTART}Boost Count: **${guild.premiumSubscriptionCount}**\n`
+ `${LINESTART}Members: **${guild.memberCount}** (${usersCount} users, ${botsCount} bots)\n`
+ `${LINESTART}Channels: **${guild.channels.cache.filter(c => c.type === 'text').size}** Text, **${guild.channels.cache.filter(c => c.type === 'voice').size}** Voice, **${guild.channels.cache.filter(c => c.type === 'category').size}** Categories\n`
+ `${LINESTART}Verification: **${verif}**`;
if(!guild.features.length == 0)
str += `\n${LINESTART}Features: **${guild.features.join("**, **")}**`;
if(guild.splashURL() != null)
{
builder.setImage(guild.splashURL({ format: 'png', size: 1024 }));
str += `\n${LINESTART}Splash: `;
}
if(guild.iconURL() != null)
   builder.setThumbnail(guild.iconURL({ format: 'png', dynamic: true, size: 1024 }));
builder.setColor(owner == null ? null : owner.displayColor||"");
builder.setDescription(str)
message.channel.send({ content: title, embed: builder, disableMentions: "all"});
}
}

    module.exports = ServerinfoCmd