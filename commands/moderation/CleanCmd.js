const { MessageEmbed, MessageAttachment} = require('discord.js')
const Command = require("../../base/Command.js");
const Settings = require("../../models/settings.js");
class CleanCmd extends Command {
  constructor (client) {
    super(client, {
      name: "clean",
      description: "delete messages",
      category: "Moderation",
      usage: "<parameters>",
      guildOnly: true,
      aliases: ['clear', 'purge'],
      botPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
    });
  }

  async run (message, args, reply) {
    const mguild = await Settings.findOne({ guildID: message.guild.id });
    const someArguments =
     "`<number>` - Delete a number from 2 to 1000 messages on the channel (default 100)\n"
    + "`@user` or `userID` - Delete all messages sent by a user\n"
    + '`"quote"` - Delete messages that contain such text\n'
    + "`/regex/` - Delete messages using regex\n"
    + "`attachments` - Delete messages that contain images\n"
    + "`embeds` - Delete messages that contain embeds\n"
    + "`links` - Delete messages that contain links (images, embeds and GIF's not included)\n"
    + "`pinned` - Delete messages pinned\n"
    + "Note: *Pinned messages will be ignored*"
    if(!args[0]) return reply(`**${this.client.config.emojis.error} There are some arguments that should be used in the command:**\n` + someArguments)
var limit = args[0];

if(isNaN(args[0]))
{
    if(!["pinned", "bots", "attachments", "embeds", "links", "pinned"].includes(args[0].toLowerCase())&&
    !(args[0].startsWith('"') && args[0].endsWith('"'))&&
    message.mentions.users.size === 0&&
    !(args[0].startsWith("/") && args[0].endsWith("/"))) return reply(`**${this.client.config.emojis.error} There are some arguments that should be used in the command:**\n` + someArguments);
};

if(isNaN(args[0]) || args[0].match(new RegExp("[0-9]{17,18}"))) {
    limit = 100
   }
   if (!args[0].match(new RegExp("[0-9]{17,18}")) && limit > 1000 || limit < 2) return reply(`**${this.client.config.emojis.error} The maximum number of messages that can be deleted is 1000 and the minimum is 2:**\n` + someArguments)

lots_of_messages_getter(message.channel, limit, this.client);

async function lots_of_messages_getter(channel, limit, client) {

    var sum_messages = [];
    let last_id;

    while (true) {
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        } else options.before = message.id

        const messages = await channel.messages.fetch(options);
        sum_messages.push(...messages.array());
        last_id = messages.last().id;

        if (messages.size != 100) {
            break;
        }
        if (sum_messages.length >= limit) {
            break;
        }
    }
    var params = ''

    if (sum_messages.length > limit) sum_messages.length = limit

    var toBeFiltered = sum_messages
    if (!isNaN(args[0]) && !args[0].match(new RegExp("[0-9]{17,18}")) && !args[1] || !isNaN(args[0]) && args[1] && !["pinned", "bots", "attachments", "embeds", "links", "pinned"].includes(args[1]) && !(args[1].startsWith("<@")  && args[1].endsWith(">")) && !(args[1].startsWith('"') && args[1].endsWith('"')) && !(args[1].startsWith("/") && args[1].endsWith("/")) && !args[1].match(new RegExp("[0-9]{17,18}"))) {
        params = params + "all "
    }
    var mentionIndex = 0
            var mentionFilterInput = ''
  message.mentions.users.forEach(u => {
                if (mentionIndex == 0) {
                    mentionFilterInput += `msg.author.id == ${u.id}`;
                    params = params + `${u.id} `
                } else {
                    mentionFilterInput += ` || msg.author.id == ${u.id}`;
                    params = params + `${u.id} `
                }
                mentionIndex++
            })
            if (message.mentions.users.size > 0) eval(`toBeFiltered = toBeFiltered.filter(msg => ${mentionFilterInput})`)
    
    var idIndex = 0
            var idFilterInput = ''
            args.filter(a => !isNaN(a) && a.match(new RegExp("[0-9]{17,18}"))).forEach(arg => {      
                        if (idIndex == 0) {
                            idFilterInput += `msg.author.id == ${arg}`;
                            params = params + `${arg} `
                        } else {
                            idFilterInput += ` || msg.author.id == ${arg}`;
                            params = params + `${arg} `
                        }
                        idIndex++
            })
    if(args.some(a => !isNaN(a) && a.match(new RegExp("[0-9]{17,18}")))) await eval(`toBeFiltered = toBeFiltered.filter(msg => ${idFilterInput})`)
    
    if (message.content.toLowerCase().includes("bots")) {
        toBeFiltered = toBeFiltered.filter(msg => msg.author.bot);
        params = params + "bots "
    }
    if (message.content.toLowerCase().includes("attachments")) {
        toBeFiltered = toBeFiltered.filter(msg => msg.attachments.array().length > 0);
        params = params + "attachments "
    }
    if (message.content.toLowerCase().includes("embeds")) {
        toBeFiltered = toBeFiltered.filter(msg => msg.embeds.length > 0);
        params = params + "embeds "
    }
    
    if (message.content.toLowerCase().includes("links")) {
        toBeFiltered = toBeFiltered.filter(msg => msg.content.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/ig));
        params = params + "links "
    }
    
    args.forEach(arg => {
    if (arg.startsWith('"') && arg.endsWith('"')) {
        toBeFiltered = toBeFiltered.filter(msg => msg.content.includes(arg.replace('"', '').replace('"', '')));
        params = params + `${arg} `
    }
    })

    args.forEach(arg => {
        if(arg.startsWith('/') && arg.endsWith('/')) {
            const regex = new RegExp(arg.replace('/', '').replace('/', ''), 'mi')
            toBeFiltered = toBeFiltered.filter(msg => regex.test(msg.content));
            params = params + `${arg} `

        }
    })

    if (!message.content.toLowerCase().includes("pinned")) {
        toBeFiltered = toBeFiltered.filter(msg => !msg.pinned);
    }

    if(message.content.toLowerCase().includes("pinned")) {
        params = params + `pinned `
        toBeFiltered = toBeFiltered.filter(msg => msg.pinned);
    }
var str = "";
if(toBeFiltered.filter(msg => msg.createdTimestamp > Date.now()-1209600000).length <= 0)
str+=`${client.config.emojis.warning} There are no messages for me to clean.`;
else str+=`${client.config.emojis.success} Cleaned **${toBeFiltered.filter(msg => msg.createdTimestamp > Date.now()-1209600000).length}** messages.`;

    if(toBeFiltered.length > toBeFiltered.filter(msg => msg.createdTimestamp > Date.now()-1209600000).length)
    {
        str+=` Note: Messages older than 2 weeks cannot be cleaned.`;
        toBeFiltered = toBeFiltered.filter(msg => msg.createdTimestamp > Date.now() - 1209600000);
    }

    var filteredMessages = toBeFiltered
    var filteredMessagesLength = filteredMessages.length

    var step = 0

    while (filteredMessages.length > 0) {
        let chunk = filteredMessages.splice(0, 100)

        if (chunk.length >= 1 && chunk.length <= 100) {
            step = step + 1
            message.channel.bulkDelete(chunk).then(async messages => {
                if(!message.guild.channels.cache.has(mguild.modLogsChannel) || message.channel.id === mguild.modLogsChannel) return;

             let str = `-- Deleted messages on the server ${messages.first().guild.name} (${messages.first().guild.id}) in channel #${messages.first().channel.name} (${messages.first().channel.id})--\r\n`;

              Promise.all(
                messages.map(msg => {
                  var content = msg.content
                  if(msg.attachments.size > 0) content = `${msg.content}\r\n${msg.attachments.first().url}`
                  if(msg.embeds.length > 0) content = `${msg.content}\r\n${msg.embeds[0].description}`

                  str += `\r\n[${msg.createdAt}] ${msg.author.tag} (${msg.author.id}) : ${content}\r\n`;
                })
              );
             
              const attachmentChannel = client.channels.cache.get(client.config.logsChannel)
                            
              let strBuffer = Buffer.from(str);

              let attachment = new MessageAttachment(
                strBuffer,
                "DeletedMessages.txt"
              );
      
              attachmentChannel.send(attachment).then(async m => {
                let webURL = `https://txt.discord.website/?txt=${attachmentChannel.id}/${
                  m.attachments.first().id
                }/DeletedMessages`;
                let downloadURL = `${m.attachments.first().url}`;

          mguild.cases++;
         await mguild.save().catch(e => client.logger.log(e, "error"));
         await message.guild.channels.cache.get(mguild.modLogsChannel).send({content: `\`[${require("moment-timezone")(Date.now()).tz(mguild.timezone).format('hh:mm:ss')}]\`\n \`[${mguild.cases}]\` 🗑️ **${message.author.username}**#${message.author.discriminator} (${message.author.id}) deleted **${filteredMessagesLength}** messages.\n**▫️ Channel:** ${message.channel}\n**▫️ Criteria:** ${params}\n**▫️ Reason:** [no reason specified]`, embed:new MessageEmbed().setDescription(`[\`📄 View\`](${webURL}) | [\`📥 Download\`](${downloadURL})`).setColor(message.guild.me.roles.highest.color||'')}).catch(e=>e)

            })
        })
                   
    }

  }
  reply(str)
    if (filteredMessagesLength > 10) {
        message.channel.setRateLimitPerUser(10)
        setTimeout(() => {
            message.channel.setRateLimitPerUser(0)
        }, filteredMessagesLength * 1000);
    }
}
}

}
module.exports = CleanCmd;