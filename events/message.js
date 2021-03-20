const Discord = require("discord.js");
const cooldowns = new Discord.Collection();
const config = require("../config.js");
const pref = config.prefix;
const Settings = require("../models/settings.js");
const automod = require("../handlers/automod.js");
const ArgsUtil = require("../utils/ArgsUtil");
const FormatUtil = require("../utils/FormatUtil");
module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (message) {
    const reply = (c, e) => message.channel.send({ content: c, embed: e });
    const guildSettings = message.channel.type === "text" ? await Settings.findOne({ guildID: message.guild.id }) : { prefix: ".." };
    if (message.guild) message.guild.settings = guildSettings;
    if (!guildSettings && message.guild) {
      const newSettings = new Settings({
        guildID: message.guild.id,
        prefix: pref,
        modRole: "none",
        antiSpam: 0,
        antiLinks: "off",
        antiInvite: 0,
        antiBad: 0,
        antiEveryone: 0,
        maxMentions: 0,
        maxLines: 0,
        cases: 0,
        timezone: 'America/New_York',
        ignoredRoles: [],
        ignoredUsers: [],
        ignoredChannels: [],
        nsfwDetection: 0,
        punishments: [],
        serverLog: "off",
        muteRole: "none",
        messageLog: "off",
        avatarLog: "off",
        voiceLog: "off",
        isInRaidMode: false,
        useAutoRaidMode: false,
        antiCopy: 0,
        antiReferral: 0,
        maxMentionsRoles: 0,
        firstAutomod: true,
        redirectLinks: "off",
        hoistCharacters: [],
        filterWords: [],
        tempmutes: [],
        tempbans: [],
        slowmodes: [],
        raidmodeNumber: 0,
        lastVerification: message.guild.verificationLevel
            });
      await newSettings.save().catch(e => this.client.logger.log(e, "error"));
      return undefined;
    }
    if (message.guild && !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
      if(message.author.bot) return;
    const mentionHelp = new RegExp(`^<@!?${this.client.user.id}>( |)$`);
    if (message.content.match(mentionHelp)) {
      return message.channel.send(`My prefix on that server is \`${guildSettings.prefix}\``, { disableMentions: "all" });
    }
     if(message.member){
    if (!message.member.hasPermission("MANAGE_MESSAGES") && !message.member.hasPermission("MANAGE_GUILD") && !message.member.hasPermission("ADMINISTRATOR") && !message.member.roles.cache.has(guildSettings.modRole)) {
      if (!guildSettings.ignoredUsers.includes(message.author.id)) {
        if (!guildSettings.ignoredChannels.includes(message.channel.id)) {
          if (!message.member.roles.cache.some(r=>guildSettings.ignoredRoles.includes(r.id))) {
            automod.run(this.client, message, message.guild.settings);
          }
        }
        }
      }
    }
    if (message.content.indexOf(guildSettings.prefix) !== 0) return;
    const args = message.content.slice(guildSettings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
    if (!cmd) return;
    if (message.author.id !== this.client.config.OWNER_ID && this.client.cmdMaintenance === true) return;
    if (cmd.conf.enabled === false && message.author.id !== this.client.config.OWNER_ID) return;
    if(cmd.conf.ownerOnly === true && message.author.id !== this.client.config.OWNER_ID) return;
    if (!message.guild && cmd.conf.guildOnly) return reply(`${this.client.config.emojis.error} This command cannot be used in Direct Messages.`)
if(message.guild)
{
  if(!cmd.conf.botPermissions.every(e =>message.channel.permissionsFor(message.guild.me).has(e)) && !message.guild.me.hasPermission(cmd.conf.botPermissions))
  return reply(`${this.client.config.emojis.error} I need ${cmd.conf.botPermissions.map(perm => FormatUtil.formatPerms(perm)).join(", ")} permissions to use this.`);
  else if(!cmd.conf.userPermissions.every(e =>message.channel.permissionsFor(message.member).has(e)) && !message.member.hasPermission(cmd.conf.userPermissions))
  {
    if(cmd.help.category !== "Moderation")
    {
      return reply(`${this.client.config.emojis.error} You need ${cmd.conf.userPermissions.map(perm => FormatUtil.formatPerms(perm)).join(", ")} permissions to use this.`);
    } 
    else if(!message.member.roles.cache.has(guildSettings.modRole))
    {
      return reply(`${this.client.config.emojis.error} You need ${cmd.conf.userPermissions.map(perm => FormatUtil.formatPerms(perm)).join(", ")} permissions to use this.`);
    }
  }
}
    if (!cooldowns.has(cmd.help.name)) {
      cooldowns.set(cmd.help.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(cmd.help.name);
    const cooldownAmount = cmd.conf.cooldown * 1000;
    if (message.author.id !== this.client.config.ownerID) {
      if (!timestamps.has(message.author.id)) {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      } else {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return reply(`${this.client.config.emojis.warning} You should wait ${timeLeft.toFixed()} seconds`);
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      }
    };
    message.context = ArgsUtil(message);

    try {
      await cmd.run(message, args, reply);
    } catch (e) {
     console.error(e);
     this.client.users.cache.get(this.client.config.OWNER_ID).send(`An error occurred with the command \`${cmd.help.name}\`:\n\`\`\`xl\n${e.toString()}\n\`\`\``);
    }
  }
};