const Command = require("../../base/Command.js"),
Infractions = require("../../models/infractions.js"),
logHandler = require("../../handlers/serverLogger.js"),
FormatUtil = require("../../utils/FormatUtil");

class PardonCmd extends Command {
  constructor (client) {
    super(client, {
      name: "pardon",
      description: "remove strikes",
      category: "Moderation",
      usage: "[number] <@users> <reason>",
      guildOnly: true,
      aliases: ["forget"],    
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run (message, args, reply) {
    const { victims, reason } = message.context,
     victimmsg = [];

    let numstrikes = 1;

    if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);

  if(!(await isUser(this.client, args[0])))
  {
    numstrikes = parseInt(args[0]);
    victims.shift();
  };

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
    if(user.bot) return victimmsg.push(`${this.client.config.emojis.error} Bots cannot have strikes (${(await FormatUtil.formatFullUser(user))})`);

    const mention = message.guild.members.cache.has(user.id)?FormatUtil.formatUser(user):`<@${user.id}>`;

    Infractions.findOne({
      guildID: message.guild.id,
      userID: e
    }, async (err, u) => {
      if (err) this.client.logger.log(err, "error");
      if (!u) {
        const newUser = new Infractions({
          guildID: message.guild.id,
          userID: e,
          infractions: 0
        });
        await newUser.save().catch(e => this.client.logger.log(e, "error"));
        return undefined;
      }

      if(u.infractions == 0) return victimmsg.push(`${this.client.config.emojis.warning} ${mention} has no strikes.`);

      const strikes = numstrikes>u.infractions?u.infractions:numstrikes;

      u.infractions-=strikes;
      await u.save().catch(e => this.client.logger.log(e, "error"));

      if(message.guild.channels.cache.has(message.guild.settings.modLogsChannel)) {
        const Logger = new logHandler({ client: this.client, case: "pardon", guild: message.guild.id, member: user, reason: reason, moderator: message.author, amount: `\`[${u.infractions + strikes} → ${u.infractions}]\`` });
       await Logger.send().then(t => Logger.kill());
      };

      victimmsg.push(`${this.client.config.emojis.success} ${mention} has been pardoned \`${strikes}\` strikes.`);
  if(message.guild.members.cache.has(e))
   user.send(`${this.client.config.emojis.success} You have been pardoned \`${strikes}\` strikes in **${message.guild.name}** for: \`${reason}\``).catch(e => {});
      });
    }); 
    var interval = setInterval(()=>{if(victims.length==victimmsg.length&&victimmsg.length>0){ reply(victimmsg.join("\n")); clearInterval(interval)}},100);
  }
};

module.exports = PardonCmd;

async function isUser(client, id) {
  if(isNaN(id)) return false;
  try{
    await client.users.fetch(id);
    return true;
  } catch (e) {
    return false
  }
}