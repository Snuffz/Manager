const Command = require("../../base/Command.js"),
Infractions = require("../../models/infractions.js"),
logHandler = require("../../handlers/serverLogger.js"),
Settings = require("../../models/settings.js"),
warnReceiver = require("../../handlers/warnReceive.js"),
FormatUtil = require("../../utils/FormatUtil");

const DISCORD_ID = new RegExp("[0-9]{17,20}");

class StrikeCmd extends Command {
  constructor (client) {
    super(client, {
      name: "strike",
      description: "the users receives a strike",
      category: "Moderation",
      usage: "[number] <@users> <reason>",
      guildOnly: true,
      aliases: ["warn"],    
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id }),
    { victims, reason } = message.context,
     victimmsg = [];

    let numstrikes = 1;

    if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);

  if(!args[0].match(DISCORD_ID))
  {
    numstrikes = parseInt(args[0]);
    victims.shift();
  };

  if(numstrikes<1 || numstrikes>100)
  {
    return reply(`${this.client.config.emojis.error} Number of strikes must be between 1 and 100!`);
  }

  if(!reason) return reply(`${this.client.config.emojis.error} Please provide a reason for the strike(s)!`);

  await victims.forEach(async e => {
    try
    { 
      await this.client.users.fetch(e)
        }
         catch(e) { return victimmsg.push(`${this.client.config.emojis.error} Please include at least one user (@mention or ID).`) }
     
         const user = await this.client.users.fetch(e); 
       user.member = message.guild.members.cache.get(user.id);

     if(message.guild.members.cache.has(user.id))
     {
      if (message.member.roles.highest.position <= user.member.roles.highest.position && message.guild.ownerID !== message.author.id) return victimmsg.push(`${this.client.config.emojis.error} You are not allowed to interact with ${FormatUtil.formatUser(user)}`);
      if(message.guild.ownerID === user.id || user.member.roles.highest.position >= message.guild.me.roles.highest.position) return victimmsg.push(`${this.client.config.emojis.error} I can't interact with ${FormatUtil.formatUser(user)}`);
    };

    const mention = message.guild.members.cache.has(user.id)?FormatUtil.formatUser(user):`<@${user.id}>`;

    Infractions.findOne({
      guildID: message.guild.id,
      userID: e
    }, async (err, u) => {
      if (err) this.client.logger.log("inf" + err, "error");
      if (!u) {
        const newUser = new Infractions({
          guildID: message.guild.id,
          userID: e,
          infractions: numstrikes
        });
       
        await newUser.save().catch(e => this.client.logger.log(e, "error"));
        await warnReceiver.emit(this.client, user.member, message.author, message.guild, numstrikes, reason, `${this.client.config.emojis.warning} You have received \`${numstrikes}\` strikes in **${message.guild.name}** for: \`${reason}\``);
        victimmsg.push(`${this.client.config.emojis.success} ${mention} has been gave \`${numstrikes}\` strikes.`);
        if(message.guild.members.cache.has(e)) 
        user.send(`${this.client.config.emojis.warning} You have received \`${numstrikes}\` strikes in **${message.guild.name}** for: \`${reason}\``).catch(e => e);
        return undefined
      }

      u.infractions+=numstrikes;
      await u.save().catch(e => console.log(e));

      if (settings.punishments.length == 0 || !settings.punishments.some(p => p.nr === u.infractions) && u.infractions < Math.max(...settings.punishments.map(a => a.nr))) {
        if(message.guild.channels.cache.has(message.guild.settings.modLogsChannel)) {
        const Logger = new logHandler({ client: this.client, case: "warnAdd", guild: message.guild.id, member: user, reason: reason, moderator: message.author, amount: `\`[${u.infractions-numstrikes} → ${u.infractions}]\`` });
        await Logger.send().then(t => Logger.kill());
        await user.send(`${this.client.config.emojis.warning} You have received \`${numstrikes}\` strikes in **${message.guild.name}** for: \`${reason}\``).catch(e => e);
      }
    }
      await warnReceiver.emit(this.client, user.member, message.author, message.guild, `${u.infractions-numstrikes} → ${u.infractions}`, reason, `${this.client.config.emojis.warning} You have received \`${numstrikes}\` strikes in **${message.guild.name}** for: \`${reason}\``);
    victimmsg.push(`${this.client.config.emojis.success} ${mention} has been gave \`${numstrikes}\` strikes.`);
    
  })
  });
  var interval = setInterval(()=>{if(victims.length==victimmsg.length&&victimmsg.length>0){reply(victimmsg.join("\n")); clearInterval(interval)}},100);
}
};

module.exports = StrikeCmd