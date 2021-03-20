const express = require('express');
const app = express();
app.get("/", (request, response) => {
  const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(`Ping received at ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
const { Client, Collection } = require("discord.js");

const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const klaw = require("klaw");
const path = require("path");
const Settings = require("./models/settings.js");
const logs = require('discord-logs')

class Bot extends Client {
  constructor (options) {
    super(options);
    this.cmdMaintenance = false;
    this.config = require("./config.js");
    this.commands = new Collection();
    this.aliases = new Collection();
    this.logger = require("./modules/logger.js");

    this.wait = require("util").promisify(setTimeout);

    this.awaitReply = async (msg, question, limit = 60000) => {
      const filter = m => m.author.id === msg.author.id;
      await msg.channel.send(question);
      try {
        const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
        return collected.first().content;
      } catch (e) {
        return false;
      }
    };

    this.getEmoji = (action) => {
    const emoji = {
      noraidmode: "\uD83D\uDD13", // 🔓
      pardon: "\uD83C\uDFF3", // 🏳
      raidmode: "\uD83D\uDD12", // 🔒
      strike: "\uD83D\uDEA9", // 🚩
      unmute: "\uD83D\uDD0A", // 🔊
      unban : "\uD83D\uDD27", // 🔧
      ban: "\uD83D\uDD28", // 🔨
      tempban: "\u23F2", // ⏲
      softban: "\uD83C\uDF4C", // 🍌
      kick: "\uD83D\uDC62", // 👢
      mute: "\uD83D\uDD07", // 🔇
      tempmute: "\uD83E\uDD10", // 🤐
      clean: "\uD83D\uDDD1" // 🗑️
    }
    return emoji[action];
    };

    this.clean = async (client, text) => {
      if (text && text.constructor.name == "Promise") text = await text;
      if (typeof evaled !== "string") text = require("util").inspect(text, {depth: 0});

      text = text.replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(client.token, null)
        .replace(this.config.dbUrl, "access denied");

      return text;
    };

    this.insertDefaults = async (guildID) => {
      const newSettings = new Settings({
        guildID: guildID,
        prefix: "..",
        modRole: "none",
        antiSpam: 0,
        antiInvite: 0,
        antiEveryone: 0,
        maxMentions: 0,
        maxLines: 0,
        ignoredRoles: [],
        ignoredUsers: [],
        ignoredChannels: [],
        nsfwDetection: 0,
        timezone: 'America/New_York',
        punishments: [],
        messageLog: "off",
        serverLog: "off",
        muteRole: "none",
        avatarLog: "off",
        voiceLog: "off",
        isInRaidMode: false,
        useAutoRaidMode: false,
        raidmodeNumber: 0,
        raidmodeTime: 0,
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
        lastVerification: this.guilds.cache.get(guildID).verificationLevel
      });

      await newSettings.save().catch(e => this.logger.log(e, "error"));
      return;
    };

    this.updateSettings = async (obj) => {
      if (isNaN(parseInt(obj.maxMentions))) obj.maxMentions = 0;
      if (isNaN(parseInt(obj.maxLines))) obj.maxLines = 0;
      if (isNaN(parseInt(obj.maxLines))) obj.cases = 0;
      if (isNaN(parseInt(obj.maxMentionsRoles))) obj.maxMentionsRoles = 0;
      await Settings.findOne({ guildID: obj.guildID }, async (err, settingsKit) => {
        if (err) return console.log(err);

        if (!settingsKit) {
          const newSettings = new Settings({
            guildID: obj.guildID,
            prefix: obj.prefix,
            timezone: obj.tomezone,
            modRole: obj.modRole,
            antiSpam: obj.antiSpam,
            antiInvite: obj.antiDiscord,
            antiEveryone: obj.antiEveryone,
            maxMentions: parseInt(obj.maxMentions),
            maxLines: parseInt(obj.maxLines),
            cases: parseInt(obj.cases),
            ignoredRoles: obj.ignoredRoles,
            ignoredChannels: obj.ignoredChannels,
            ignoredUsers: [],
            nsfwDetection: obj.antiNsfw,
            punishments: [],
            serverLog: obj.serverLog,
            muteRole: obj.muteRole,
            moderationLogs: obj.moderationLogs,
            messageLog: obj.messageLog,
            avatarLog: obj.avatarLog,
            voiceLog: obj.voiceLog,
            isInRaidMode: obj.isInRaidMode,
            antiCopy: obj.antiCopy,
            antiReferral: obj.antiReferral,
            maxMentionsRoles: obj.maxMentionsRoles,
            firstAutomod: obj.firstAutomod,
            redirectLinks: obj.redirectLinks,
            hoistCharacters: obj.hoistCharacters,
            filterWords: obj.filterWords,
            tempmutes: obj.tempmutes,
            tempbans: obj.tempbans,
            slowmodes: obj.slowmodes,
            useAutoRaidMode: obj.useAutoRaidMode,
            raidmodeNumber: obj.raidmodeNumber,
            raidmodeTime: obj.raidmodeTime,
            lastVerification: obj.lastVerification
          });
          await newSettings.save().catch(e => this.logger.log(e, "error"));
          return;
        } else {
          settingsKit.prefix = obj.prefix;
          settingsKit.logsChannel = obj.modLog;
          settingsKit.modRole = obj.modRole;
          settingsKit.antiSpam = obj.antiSpam;
          settingsKit.antiInvite = obj.antiDiscord;
          settingsKit.antiEveryone = obj.antiEveryone;
          settingsKit.maxMentions = parseInt(obj.maxMentions);
          settingsKit.maxLines = parseInt(obj.maxLines);
          settingsKit.cases = parseInt(obj.cases)
          settingsKit.ignoredRoles = obj.ignoredRoles;
          settingsKit.ignoredChannels = obj.ignoredChannels;
          settingsKit.nsfwDetection = obj.antiNsfw;
          settingsKit.serverLog = obj.serverLog;
          settingsKit.muteRole = obj.muteRole;
          settingsKit.timezone = obj.timezone;
          settingsKit.messageLog = obj.messageLog;
          settingsKit.avatarLog = obj.avatarLog;
          settingsKit.voiceLog = obj.voiceLog;
          settingsKit.isInRaidMode = obj.isInRaidMode;
          settingsKit.antiCopy = obj.antiCopy;
          settingsKit.antiReferral = obj.antiReferral;
          settingsKit.maxMentionsRoles = obj.maxMentionsRoles;
          settingsKit.firstAutomod = obj.firstAutomod;
          settingsKit.redirectLinks = obj.redirectLinks;
          settingsKit.hoistCharacters = obj.hoistCharacters;
          settingsKit.filterWords = obj.filterWords;
          settingsKit.tempmutes = obj.tempmutes;
          settingsKit.tempbans = obj.tempbans;
          settingsKit.slowmodes = obj.slowmodes;
          settingsKit.useAutoRaidMode = obj.useAutoRaidMode;
          settingsKit.raidmodeNumber = obj.raidmodeNumber;
          settingsKit.raidmodeTime = obj.raidmodeTime;
          settingsKit.lastVerification = obj.lastVerification
          await settingsKit.save().catch(e => console.log(e));
          return;
        }
      });
    };
  }

  loadCommand (commandPath, commandName) {
    try {
      const props = new (require(`${commandPath}${path.sep}${commandName}`))(this);
      this.logger.log(`Loading Command: ${props.help.name}`, "log");
      props.conf.location = commandPath;
      if (props.init) {
        props.init(this);
      }
      this.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        this.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      console.error(e)
      return `Unable to load command ${commandName}: ${e}`;
    }
  }

   async unloadCommand (commandPath, commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

    if (command.shutdown) {
      await command.shutdown(this);
    }
    delete require.cache[require.resolve(`${commandPath}${path.sep}${commandName}.js`)];
    return false;
  }
}

const client = new Bot({
  fetchAllMembers: true,
   partials: ['MESSAGE', 'CHANNEL', 'GUILD_MEMBER', 'REACTION', 'USER', 'GUILD']
});

logs(client)


const init = async () => {
  const categories = await readdir("./commands/");
    categories.forEach(category => {
      klaw(`./commands/${category}`).on("data", (item) => {
        const cmdFile = path.parse(item.path);
        if (!cmdFile.ext || cmdFile.ext !== ".js") return;
        const response = client.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
        if (response) client.logger.error(response);
    })
  })       
    
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`, "log");
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = new (require(`./events/${file}`))(client);
    client.on(eventName, (...args) => event.run(...args));
  });
  client.login(client.config.token);

};

init();

client.on("disconnect", () => client.logger.warn("Bot is disconnecting..."));
client.on("reconnecting", () => client.logger.log("Bot reconnecting...", "log"));
client.on("error", e => client.logger.error(e));
client.on("warn", info => client.logger.warn(info));

module.exports.Client = client;

Object.defineProperty(String.prototype, "toProperCase", {
  value: function () {
    return this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
});
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
