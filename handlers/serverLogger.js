const
FormatUtil = require("../utils/FormatUtil"),
moment = require("moment-timezone"),
Settings = require("../models/settings.js");

const SOFTBAN = "\ud83c\udf4c"; // 🍌
const BAN = "\ud83d\udd28"; // 🔨
const MUTE = "\ud83d\udd07"; // 🔇
const TEMPMUTE = "\ud83e\udd10"; // 🤐
const KICK = "\ud83d\udc62"; // 👢
const TEMPBAN = "\u23f2\ufe0f"; // ⏲️
const RAIDMODE = "\ud83d\udd12"; // 🔒
const STRIKE = "\ud83d\udea9"; // 🚩
const UNBAN = "\ud83d\udd27"; // 🔧
const UNMUTE = "\ud83d\udd0a"; // 🔊
const NORAIDMODE = "\ud83d\udd13"; // 🔓
const PARDON = "\ud83c\udff3\ufe0f"; // 🏳️
const LINESTART = "\u25AB"; // ▫

class Logger {
  constructor(options) {
    this.options = options;
  }
  async send() {
    const guildSettings = await Settings.findOne({ guildID: this.options.guild });
    if (!guildSettings) return;
    guildSettings.cases++;
    const date = moment(Date.now()).tz(guildSettings.timezone).format("hh:mm:ss");
    if(this.options.duration) this.options.duration = FormatUtil.msToTime(this.options.duration);
    var toSend;
    const event = this.options.case;
    if (event === "softbanAdd") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${SOFTBAN} ${FormatUtil.formatUser(this.options.moderator)} softbanned ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Reason:** ${this.options.reason}`;
    } else if (event === "banAdd") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${BAN} ${FormatUtil.formatUser(this.options.moderator)} banned ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Reason:** ${this.options.reason}`;
    } else if (event === "muteAdd") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${MUTE} ${FormatUtil.formatUser(this.options.moderator)} muted ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Reason:** ${this.options.reason}`;
    } else if (event === "muteTimeAdd") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${TEMPMUTE} ${FormatUtil.formatUser(this.options.moderator)} tempmuted ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Duration:** ${this.options.duration}\n**${LINESTART} Reason:** ${this.options.reason}`
    } else if (event === "kickAdd") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${KICK} ${FormatUtil.formatUser(this.options.moderator)} kicked ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Reason:** ${this.options.reason}`
    } else if (event === "banTimeAdd") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${TEMPBAN} ${FormatUtil.formatUser(this.options.moderator)} tempbanned ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Duration:** ${this.options.duration}\n**${LINESTART} Reason:** ${this.options.reason}`
    } else if (event === "lockdownOn") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${RAIDMODE} ${FormatUtil.formatUser(this.options.moderator)} **ENABLE** anti-raid mode.\n**${LINESTART} Reason:** ${this.options.reason}`
        } else if (event === "warnAdd") {
       toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${STRIKE} ${FormatUtil.formatUser(this.options.moderator)} gave strikes to ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Amount:** ${this.options.amount}\n**${LINESTART} Reason:** ${this.options.reason}`
    } else if (event === "unban") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${UNBAN} ${FormatUtil.formatUser(this.options.moderator)} unbanned ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Reason:** ${this.options.reason}`
    } else if (event === "muteRemove") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${UNMUTE} ${FormatUtil.formatUser(this.options.moderator)} unmuted ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Reason:** ${this.options.reason}`
    } else if (event === "lockdownOff") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${NORAIDMODE} ${FormatUtil.formatUser(this.options.moderator)} **DISABLE** anti-raid mode.\n**${LINESTART} Reason:** ${this.options.reason}`
    } else if (event === "pardon") {
      toSend = `\`[${date}]\`\n \`[${guildSettings.cases}]\` ${PARDON} ${FormatUtil.formatUser(this.options.moderator)} pardoned strikes from ${FormatUtil.formatFullUser(this.options.member)}.\n**${LINESTART} Amount:** ${this.options.amount}\n**${LINESTART} Reason:** ${this.options.reason}`
    }
    const logChannel = this.options.client.channels.cache.get(guildSettings.modLogsChannel);
if(!logChannel) return;
    logChannel.send(toSend, { disableMentions: "all" });
       guildSettings.save();
  }
  kill() {
    this.options = {};
  }
}

module.exports = Logger