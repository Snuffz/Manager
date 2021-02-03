const Command = require("../../base/Command.js");
class Autodehoist extends Command {
  constructor (client) {
    super(client, {
      name: "autodehoist",
      description: "set the character on automatic deHoist",
      category: "Automod",
      usage: "<character | OFF>",
      guildOnly: true,
      aliases: ['auto-dehoist'],
      botPermissions: ['MANAGE_NICKNAMES'],
      userPermissions: ['MANAGE_GUILD'],
      cooldown: 7  
    });
  }

  async run (message, args, reply) {
    if(!args[0]) return reply(`${this.client.config.emojis.error} Please provide the character.`)
 if(!["off", "!", "*", '"', "#", ".", "(", ")", "$", "'", "&", "+", "-", "%", "/", ","].includes(args[0].toLowerCase())){ 
   return reply(`${this.client.config.emojis.error} Choose one of the following valid characters: \`!\`, \`#\`, \`.\`, \`,\`, \`'\`, \`"\`, \`&\`, \`(\`, \`$\`, \`)\`, \`*\`, \`+\`, \`-\`, \`%\`, \`/\` or \`OFF\``)
  };

  if(args[0].toLowerCase() === "off") {
    message.guild.settings.hoistCharacters = new Array();
    await message.guild.settings.save().catch(e => this.client.logger.log(e, "error"));
    return reply(`${this.client.config.emojis.success} No hoist users will be removed.`);
  };

  message.guild.settings.hoistCharacters.push(args[0]);
  await message.guild.settings.save().catch(e => this.client.logger.log(e, "error"));

 return reply(`${this.client.config.emojis.success} Users will now be dehoisted if their effective name starts with \`${args[0]}\``);
  }}

  module.exports = Autodehoist