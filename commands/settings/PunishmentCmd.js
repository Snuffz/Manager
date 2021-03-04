const 
{ MessageEmbed } = require ("discord.js"),
Command = require("../../base/Command.js"),
PunishmentManager = require("../../models/managers/PunishmentManager"),
OtherUtil = require("../../utils/OtherUtil"),
Settings = require("../../models/settings"),
FormatUtil = require("../../utils/FormatUtil");

const settings_strikes = (prefix) => `\n\nHow to use: \`${prefix}punishments <add | remove> <number> <action> [duration]\`
\`<number>\` - The number of strikes equivalent to the action
\`<action>\` - The punishment that will occur (\`Kick\`, \`Mute\`, \`Softban\` or \`Ban\`)
\`[duration]\` - The amount of time the user will mute or ban
\nNote: You should not include <> and [] in the commands, they are just examples. The words between <> mean that such a thing is mandatory and between [], optional.`

class PunishmentCmd extends Command {
  constructor (client) {
    super(client, {
      name: "punishment",
      description: "define the punishments and actions",
      aliases: ["setstrikes","setstrike","punishments"],
      usage: "<add | remove> <number> <action> [duration]",
      category: "Settings",      
      guildOnly: true,
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) {
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");
    if(!args[0] || !["add","remove"].includes(args[0].toLowerCase()))
    {
      return reply(`${this.client.config.emojis.error} You must make sure you want to add or remove a punishment.${settings_strikes(settings.prefix)}`)
    }
    const option = args[0].toLowerCase();
    if(option === "add")
    {
      if(args.length<3)
      {
        reply(`${this.client.config.emojis.error} You must provide the number of strikes and the action.${settings_strikes(settings.prefix)}`);
        return;
      }
      const numstrikes = parseInt(args[1]);
      if(!numstrikes)
      {
        reply(`${this.client.config.emojis.error} You must provide the number of strikes and the action.${settings_strikes(settings.prefix)}`);
        return;
      }
    if(numstrikes<1 || numstrikes>PunishmentManager.MAX_STRIKES)
    {
      reply(`${this.client.config.emojis.error} The number of strikes must be greater than or equal to 1 and less than ${PunishmentManager.MAX_STRIKES}.${settings_strikes(settings.prefix)}`);
      return;
    }
    const ind = settings.punishments.findIndex(i=>i.nr===numstrikes);
    if (ind>=0)
    {
      reply(`${this.client.config.emojis.error} There is already a punishment with that number of strikes.`);
      return;
    }
    if(!["mute","ban","kick","softban"].includes(args[2].toLowerCase()))
    {
      reply(`${this.client.config.emojis.error} You must provide valid action!${settings_strikes(settings.prefix)}`);
      return;
    }
    let action = args[2].toLowerCase();
    if(args.length>3&&["ban","mute"].includes(action)){
 const parseResult = OtherUtil.parseTime(args.slice(3).join(" "));
 if(parseResult.asMilliseconds() == 0)
 {
reply(`${this.client.config.emojis.error} Invalid time!`);
return;
 }
 action = (action=="mute"?"tempmute ":"tempban ")+FormatUtil.msToTimeCompact(parseResult.asMilliseconds());
    }
    const punishment = {
      nr: numstrikes,
      action: action
    }
    settings.punishments.push(punishment);
   await settings.save().catch(e => this.client.logger.log(e, "error"))
   const sucessMsg = {
     mute: "`muted`",
     ban: "`banned`",
     softban: "`softbanned`",
     tempmute: `\`muted\` for ${FormatUtil.msToTime(OtherUtil.parseTime(args.slice(3).join(" ")).asMilliseconds())}`,
     tempban: `\`banned\` for ${FormatUtil.msToTime(OtherUtil.parseTime(args.slice(3).join(" ")).asMilliseconds())}`
   }
   const muteRole = message.guild.roles.cache.get(settings.muteRole) || message.guild.roles.cache.find(r => r.name.toLowerCase()=="muted");
  await message.channel.send({ content: `${this.client.config.emojis.success} Users will now be ${sucessMsg[action.split(" ")[0]]} upon reaching \`${numstrikes}\` strikes.
${muteRole||(action.split(" ")[0]!=="mute"&&action.split(" ")[0]!=="tempmute")?"":`${this.client.config.emojis.warning} The 'Muted' role does not exist.`}`,
   embed: new MessageEmbed()
   .setDescription(PunishmentManager.getAllPunishmentsDisplay(settings.punishments))
   .setColor(message.guild.me.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||"")
   , disableMentions: "all"})
} 
else if(option === "remove")
{
  if(!args[1])
   {
     reply(`${this.client.config.emojis.error} Provide the number of strikes of the punishment you want to remove.`);
     return;
   }
   const numstrikes = parseInt(args[1]);
   if(!numstrikes)
   {
     reply(`${this.client.config.emojis.error} You must provide a valid number!`);
     return;
   }
   const index = settings.punishments.findIndex(i=>i.nr===numstrikes);
   if (index<0){
    reply(`${this.client.config.emojis.error} Punishment number not found.`);
    return;
   }
   settings.punishments.splice(index, 1);
   await settings.save().catch(e => this.client.logger.log(e, "error"));
   message.channel.send({ content: `${this.client.config.emojis.success} Users who reach \`${numstrikes}\` they will no longer be punished.`,
   embed: new MessageEmbed()
  .setDescription(PunishmentManager.getAllPunishmentsDisplay(settings.punishments))
  .setColor(message.guild.me.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||""),
  disableMentions: "all"})
}
  });
  }
}
module.exports = PunishmentCmd