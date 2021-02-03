const mongoose = require("mongoose");

const settingSchema = mongoose.Schema({
  guildID: String,
  prefix: String,
  modLogsChannel: String,
  timezone: String,
  modRole: String,
  adminRole: String,
  joinrole: String,
  antiSpam: Number,
  antiLinks: String,
  antiInvite: Number,
  antiBad: Number,
  antiEveryone: Number,
  maxMentions: Number,
  maxLines: Number,
  ignoredRoles: Array,
  ignoredUsers: Array,
  ignoredChannels: Array,
  nsfwDetection: Number,
  punishments: Array,
  cases: Number,
  muteRole: String,
  serverLog: String,
  messageLog: String,
  avatarLog: String,
  voiceLog: String,
  antiRaid: String,
  antiCopy: Number,
  antiReferral: Number,
  maxMentionsRoles: Number,
  firstAutomod: Boolean,
  redirectLinks: String,
  voicemove: Boolean,
  hoistCharacters: Array,
  filterWords: Array,
  tempmutes: Array,
  tempbans: Array,
  slowmodes: Array
});

module.exports = mongoose.model("settings", settingSchema);
