const
Settings = require("../../models/settings.js"),
Command = require("../../base/Command.js");

const CANCEL = "\u274C"; // ❌
const CONFIRM = "\u2705"; // ✅

class SetupCmd extends Command {
  constructor (client) {
    super(client, {
      name: "setup",
      description: "makes the bot completely configure something on the server",
      category: "Settings",
      guildOnly: true,
      botPermissions: ['ADMINISTRATOR'],
      userPermissions: ['MANAGE_GUILD'],
      cooldown: 5,
    });
  }

  async run (message, args, reply) { 
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");
    if (!args[0] || args[0].toLowerCase() !== "automod" && args[0].toLowerCase() !== "muterole") return reply(`${this.client.config.emojis.success} Currently, only the following commands are available:
\n\`${settings.prefix}setup muterole\` - Set the 'Muted' role
\`${settings.prefix}setup automod\` - Configure automod on this server`);
    if (args[0].toLowerCase() === "automod") {
if(settings.firstAutomod != false) {
  const ms = await reply(`${this.client.config.emojis.warning} This server already has the automod system configured, do you want to change all strikes and maximum mentions?
\n${CONFIRM} - Continue
${CANCEL} - Cancel`);
  await ms.react(CONFIRM);
  await ms.react(CANCEL);
  const collected = await ms.awaitReactions((reaction, user) => user.id === message.author.id, {max: 1, time: 60000, errors: ["time"] });
  const res = collected.first().emoji.name;

  if (res === CANCEL) {
    ms.delete();
  } else if (res === CONFIRM) {
    ms.delete();
settings.antiSpam = 1;
settings.antiInvite = 2;
settings.antiEveryone = 2;
settings.maxMentions = 10;
settings.maxLines = 2;
settings.nsfwDetection = 3;
settings.antiCopy = 2;
settings.antiReferral = 3;
settings.maxMentionsRoles = 4;
await settings.save().catch(e => this.client.logger.log(e, "error"));
reply(`${this.client.config.emojis.success} Automod setup completed!`);
  }
}
 if(settings.firstAutomod == false) {
  settings.antiSpam = 1;
settings.antiInvite = 2;
settings.antiEveryone = 2;
settings.maxMentions = 10;
settings.maxLines = 2;
settings.nsfwDetection = 3;
settings.antiCopy = 2;
settings.antiReferral = 3;
settings.maxMentionsRoles = 4;
await settings.save().catch(e => this.client.logger.log(e, "error"));
reply(`${this.client.config.emojis.success} Automod setup completed!`);
}
    }
    if (args[0].toLowerCase() === "muterole") {
      let mutedRole = message.guild.roles.cache.find(r => r.name === "Muted");
      if (mutedRole) {
        const ms = await reply(`${this.client.config.emojis.warning} This will modify the role 'Muted' already existing and will assign overrides on all channels?
\n${CONFIRM} - Continue
${CANCEL} - Cancel`);
        await ms.react(CONFIRM);
        await ms.react(CANCEL);
        const collected = await ms.awaitReactions((reaction, user) => user.id === message.author.id, {max: 1, time: 60000, errors: ["time"] });
        const res = collected.first().emoji.name;

        if (res === CANCEL) {
          ms.delete();
        } else if (res === CONFIRM) {
          ms.reactions.removeAll()
          await ms.edit(`${this.client.config.emojis.loading} Starting setup...
${this.client.config.emojis.loading} Creating Role
${this.client.config.emojis.loading} Setting Permissions on Categories
${this.client.config.emojis.loading} Setting Permissions on Text Channels
${this.client.config.emojis.loading} Setting Permissions on Voice Channels
          `);

          await ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.loading} Creating Role
${this.client.config.emojis.loading} Setting Permissions on Categories
${this.client.config.emojis.loading} Setting Permissions on Text Channels
${this.client.config.emojis.loading} Setting Permissions on Voice Channels
          `);

          try {
            await mutedRole.setPermissions(0);
          } catch (e) {
            return ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.error} Role Creation Failed! Missing Permissions!
${this.client.config.emojis.error} Categories Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Text Channels Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Voice Channels Configuration Failed! Missing Permissions!
            `);
          }

          await ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.success} Role Created!
${this.client.config.emojis.loading} Setting Permissions on Categories
${this.client.config.emojis.loading} Setting Permissions on Text Channels
${this.client.config.emojis.loading} Setting Permissions on Voice Channels
          `);

          try {
            message.guild.channels.cache.forEach(async (channel) => {
              await channel.updateOverwrite(mutedRole, { SEND_MESSAGES: false, ADD_REACTIONS: false, SPEAK: false})
             });
          } catch (e) {
            return ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.error} Role Creation Failed! Missing Permissions!
${this.client.config.emojis.error} Categories Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Text Channels Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Voice Channels Configuration Failed! Missing Permissions!
            `);
          }

          await ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.success} Role Created!
${this.client.config.emojis.success} Permissions Set on Categories!
${this.client.config.emojis.success} Permissions Set on Text Channels!
${this.client.config.emojis.success} Permissions Set in Voice Channels!

${this.client.config.emojis.success} Muted Role configured!
          `);

          settings.muteRole = mutedRole.id;
          await settings.save().catch(e => this.client.logger.log(e));


        } else {
          return ms.delete();
        }
      } else {
        try {
          const ms = await reply(`${this.client.config.emojis.warning} Starting configuration.`);

          await ms.edit(`${this.client.config.emojis.loading} Starting setup...
${this.client.config.emojis.loading} Creating Role
${this.client.config.emojis.loading} Setting Permissions on Categories
${this.client.config.emojis.loading} Setting Permissions on Text Channels
${this.client.config.emojis.loading} Setting Permissions on Voice Channels
          `);

          await ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.loading} Creating Role
${this.client.config.emojis.loading} Setting Permissions on Categories
${this.client.config.emojis.loading} Setting Permissions on Text Channels
${this.client.config.emojis.loading} Setting Permissions on Voice Channels
          `);

          try {
            mutedRole = await message.guild.roles.create({
              data: {
                name: "Muted",
                color: "#000001",
                permissions: []
              }

            });
          } catch (e) {
            return ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.error} Role Creation Failed! Missing Permissions!
${this.client.config.emojis.error} Categories Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Text Channels Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Voice Channels Configuration Failed! Missing Permissions!
            `);
          }

          await ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.success} Role Created!
${this.client.config.emojis.loading} Setting Permissions on Categories
${this.client.config.emojis.loading} Setting Permissions on Text Channels
${this.client.config.emojis.loading} Setting Permissions on Voice Channels
          `);

          try {
            message.guild.channels.cache.forEach(async (channel) => { 
              await channel.updateOverwrite(mutedRole, { SEND_MESSAGES: false, ADD_REACTIONS: false, SPEAK: false})
            })
          } catch (e) {
            return ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.error} Role Creation Failed! Missing Permissions!
${this.client.config.emojis.error} Categories Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Text Channels Configuration Failed! Missing Permissions!
${this.client.config.emojis.error} Voice Channels Configuration Failed! Missing Permissions!
            `);
          }

          await ms.edit(`${this.client.config.emojis.success} Start setup!
${this.client.config.emojis.success} Role Created!
${this.client.config.emojis.success} Permissions Set on Categories!
${this.client.config.emojis.success} Permissions Set on Text Channels!
${this.client.config.emojis.success} Permissions Set in Voice Channels!
          
${this.client.config.emojis.success} Muted Role configured!
          `);
          settings.muteRole = mutedRole.id;
          await settings.save().catch(e => this.client.logger.log(e));
        } catch (e) {
          console.log(e.stack);
        }
      }
    } 
  })
  }
}
module.exports = SetupCmd