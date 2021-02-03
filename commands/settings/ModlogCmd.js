const 
Command = require("../../base/Command.js"),
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js");

const required_perms = ["SEND_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY"];
const required_error = (tc) => ` I need permissions Send Messages, Attach Files, Embed Links, Read Messages History in ${tc}`;

class ModlogCmd extends Command {
  constructor (client) {
    super(client, {
      name: "modlog",
      description: "define the moderation log channel",
      category: "Settings",
      usage: "[channel]",
      guildOnly: true,
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) { 
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");

      if(!args[0])
      {
        showCurrentChannel()
      }
    else
      {

      if (["off","none"].includes(args[0].toLowerCase()))
       {
      return await setLogChannel();
      }

      let tc;

      const list = FinderUtil.findTextChannels(args[0], message.guild);

      if(list.size == 0) return reply(`${this.client.config.emojis.error} No text channels were found with the name \`${args[0]}\`!`);

      if(list.size > 1)
      {
        message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfText(list, args[0]), { disableMentions: "all" });
        return;
      }

      tc = await list.first();

      await setLogChannel(tc);

  }

      function showCurrentChannel(){
        const tc = message.guild.channels.cache.get(settings.modLogsChannel);
        if(tc==undefined)
        {
          reply(`${message.client.config.emojis.success} The moderation logs is not set on this server.`);
          return;
        } 
        else reply(`${message.client.config.emojis.success} Moderation logs are currently appearing in ${tc.toString()}
${tc.permissionsFor(message.guild.me).missing(required_perms).length==0?"":message.client.config.emojis.warning+required_error(tc.toString())}`)
      }

      async function setLogChannel(tc){
    if(tc==undefined)
    {
      settings.modLogsChannel = "off";
      await settings.save().catch(e => message.client.logger.log(e));
      reply(`${message.client.config.emojis.success} The moderation logs will no longer appear.`);
      return;
    }
    else 
    settings.modLogsChannel = tc.id;
    await settings.save().catch(e => message.client.logger.log(e));
    reply(`${message.client.config.emojis.success} Moderation Logs will now be sent in ${tc.toString()}`);
    return;
      }
    });
  }
}

module.exports = ModlogCmd