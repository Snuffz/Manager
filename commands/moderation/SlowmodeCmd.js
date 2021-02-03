const
Command = require("../../base/Command.js"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js"),
tempslowmodes = require("../../models/managers/TempSlowmodeManager"),
{ parseTime } = require("../../utils/OtherUtil");

const max_slowmode = 21600;

class SlowmodeCmd extends Command {
  constructor (client) {
    super(client, {
      name: "slowmode",
      description: "enable or disable slowmode on the channel",
      category: "Moderation",
      usage: "[duration or Off] / [when will it end]",
      guildOnly: true,
      botPermissions: ['MANAGE_CHANNELS'],
      userPermissions: ['MANAGE_CHANNELS']
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id });

if(!args[0])
{
const slowmodeDuration = settings.slowmodes.find(j => j.channelID === message.channel.id);
const slowmodeTime = message.channel.rateLimitPerUser;

if(slowmodeTime <= 0) return reply(`${this.client.config.emojis.success} Slowmode is disabled.`);

if(!slowmodeDuration) 
      return reply(`${this.client.config.emojis.success} The slowmode of this channel is ${FormatUtil.msToTimeCompact(slowmodeTime*1000)}.`);
      else 
      return reply(`${this.client.config.emojis.success} The slowmode of this channel is ${FormatUtil.msToTimeCompact(slowmodeTime*1000)} for ${FormatUtil.msToTimeCompact(slowmodeDuration.duration)}.`);
}

if(parseInt(args[0]) === 0 || args[0].toLowerCase() == "off")
{
  tempslowmodes.clearSlowmode(message.channel);
  message.channel.setRateLimitPerUser(0, `${message.author.tag}: Disabled slowmode`);
  reply(`${this.client.config.emojis.success} Slowmode disabled!`);
  return;
}

const slowmodeTime = args.includes('/') ? args.slice(0, args.indexOf('/')).join(' ') : args.join(' ');

if(parseTime(slowmodeTime).asMilliseconds() == 0)
{
  reply(`${this.client.config.emojis.error} The slowmode time is invalid!`);
  return;
}

if(parseTime(slowmodeTime).asMilliseconds() > max_slowmode*1000)
{
  reply(`${this.client.config.emojis.error} You can only enable slowmode for up to 6 hours!`);
  return;
}

const slowmodeDuration = args.includes("/")?args.slice(args.indexOf('/')).join(' '):null;

if(slowmodeDuration)
{

  if(parseTime(slowmodeDuration).asMilliseconds() == 0)
{
  reply(`${this.client.config.emojis.error} The duration for slowmode is invalid!`);
  return;
}

tempslowmodes.setSlowmode(message.channel, parseTime(slowmodeDuration).asMilliseconds())

message.channel.setRateLimitPerUser(parseTime(slowmodeTime).asSeconds(), `${message.author.tag} (${Math.floor(parseTime(slowmodeTime).asMinutes())}m): Enabled slowmode`)
.then(() => {
  return reply(`${this.client.config.emojis.success} Members will have to wait ${FormatUtil.msToTimeCompact(parseTime(slowmodeTime).asMilliseconds())} to send each message for ${FormatUtil.msToTimeCompact(parseTime(slowmodeDuration).asMilliseconds())}.`)
})
.catch(() => {
  return reply(`${this.client.config.emojis.error} Failed to change channel slowmode.`);
});
return;
} else {
  message.channel.setRateLimitPerUser(parseTime(slowmodeTime).asSeconds(), `${message.author.tag}: Enabled slowmode`)
  .then(() => {
    return reply(`${this.client.config.emojis.success} Members will have to wait ${FormatUtil.msToTimeCompact(parseTime(slowmodeTime).asMilliseconds())} to send each message.`)
  })
  .catch(() => {
    return reply(`${this.client.config.emojis.error} Failed to change channel slowmode.`);
  });
}

  }
};

module.exports = SlowmodeCmd