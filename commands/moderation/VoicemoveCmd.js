const
Command = require("../../base/Command.js"),
FormatUtil = require("../../utils/FormatUtil"),
FinderUtil = require("../../utils/FinderUtil"),
Settings = require("../../models/settings.js");

class VoicemoveCmd extends Command {
  constructor (client) {
    super(client, {
      name: "voicemove",
      description: "move all users in voice channel",
      category: "Moderation",
      usage: "[channel]",
      guildOnly: true,
      aliases: ['vmove']
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id });
    if(message.guild.me.voice.channel) return reply(`${this.client.config.emojis.error} I'm already connected to a voice channel.`);

    if(!args[0] && !message.member.voice.channel) return reply(`${this.client.config.emojis.error} Please provide a voice channel.`);

    let vc;

    if(args[0])
    {
     const list = FinderUtil.findVoiceChannels(args.join(" "), message.guild);
      if(list.size == 0) return reply(`${this.client.config.emojis.error} No voice channels were found with the name \`${args[0]}\`!`);

      if(list.size > 1)
      {
        message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfVoice(list, args.join(" ")), { disableMentions: "all" });
        return;
      }

      vc = await list.first()
    }
    else vc = message.member.voice.channel;
    if(!vc.permissionsFor(message.member).has("MOVE_MEMBERS"))
    {
      reply(`${this.client.config.emojis.error} You are not allowed to move members on the channel **${vc.name}**!`);
      return;
    }

    if(!vc.permissionsFor(message.guild.me).has("MOVE_MEMBERS"))
    {
      reply(`${this.client.config.emojis.error} I am not allowed to move members on the channel **${vc.name}**!`);
      return;
    }

try
{
  vc.join()
  .then(async () => {
    settings.voicemove = true;
    await settings.save().catch(e => this.client.logger.log(e, "error"));
    reply("\ud83d\udd03 I entered the voice channel, move me to move all users connected to it.")
  });
}
catch(e)
{
  message.channel.send(`${this.client.config.emojis.warning} I was unable to connect to the channel **${vc.name}**`, { disableMentions: "all" });
  return;
}

setTimeout(async () => {
if(settings.voicemove === false) return;

settings.voicemove = false;
await settings.save().catch(e => this.client.logger.log(e, "error"));

reply(`${this.client.config.emojis.warning} ${message.member} I was too long connected, time out!`)
.then(() => message.guild.me.voice.channel.leave())
.catch(()=>{});
}, 120000);

  }
};

module.exports = VoicemoveCmd