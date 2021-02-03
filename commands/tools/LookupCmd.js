const 
Command = require("../../base/Command.js"),
{ MessageEmbed } = require("discord.js"),
OtherUtil = require("../../utils/OtherUtil"),
FormatUtil = require("../../utils/FormatUtil");

const
BOT_EMOJI = "<:bot:686626014411096186>",
LINESTART = "\u25AB"; // ▫

class LookupCmd extends Command {
  constructor (client) {
    super(client, {
      name: "lookup",
      description: "search for a user or guild using the ID or invite",
      category: "Tools",
      usage: "<ID | invite>",
      guildOnly: false,
      botPermissions: ['EMBED_LINKS']
    });
  }

  async run (message, args, reply) { 
const id = args[0];
if(!id)
return reply(`${this.client.config.emojis.error} Provide a user id or server invite or id.`);
if(!isNaN(id) && (await lookupUser(id, this.client)))
return;
if(!isNaN(id))
await lookupGuildId(id, this.client);
else
await lookupGuildInvite(id, this.client);

async function lookupUser(userId, client)
{
let u = client.users.cache.get(userId);
if(u==undefined) try
{
  u = await client.users.fetch(userId);
} 
catch(e)
{
  return false
}
const text = `${u.bot ? BOT_EMOJI : ""} **${u.username}**#${u.discriminator} user information:`;
const eb = new MessageEmbed();
eb.setThumbnail(u.displayAvatarURL({format: 'png', dynamic: true}));
var str = new String(`${LINESTART} Discord ID: **${u.id}** `);
str+=OtherUtil.getEmoji(u.flags);
if(u.avatar != null && u.avatar.startsWith("a_"))
            str+="<:nitro:688880424205680644>";
str+=`\n${LINESTART} Account Creation: **${u.createdAt.toUTCString()()}**`;
eb.setDescription(str.toString());
message.channel.send({ content: text, embed: eb, disableMentions: "all" });
return true;
}

async function lookupGuildId(guildId, client)
 {
   var invite = null;
  var widget = null;
  try 
  {
    widget = await client.api
    .guilds(guildId)['widget.json']
    .get()
    } catch (e) {
      if(e.code === 50004) {
       reply(`${client.config.emojis.success} I checked the server ID \`${guildId}\` but he doesn't have a standard invite.`);
       return false;
      }
    }
    if(widget != null)
    {
      try
      {
        invite = await client.fetchInvite(widget.instant_invite)
      }
      catch(e){}
    }
    constructMessage(invite, client);
}

async function lookupGuildInvite(inviteCode, client)
{
  var invite = null;
try
{
invite = await client.fetchInvite(inviteCode);
}
catch(e){}
constructMessage(invite, client);
}

function constructMessage(invite, client) 
{
  if(invite == null)
  {
      reply(`${client.config.emojis.error} No users or servers found.`);
      return;
  }
  const g = invite.guild;
  const text = `**${g.name}** server information:`;
  const eb = new MessageEmbed();
  eb.setThumbnail(g.iconURL({format:'png', dynamic: true}));
  eb.setDescription(`${LINESTART} ID: **${g.id}**
${LINESTART} Creation: **${g.createdAt.toUTCString()()}**
${LINESTART} Members: **${g.memberCount}**`)
eb.setImage(g.splashURL() == null ? null : g.splashURL({ format: 'png', size: 1024, dynamic: true }));
eb.addField("Information About Invite", `${LINESTART} Invite: **${invite.code}**
${LINESTART} Channel: **${invite.channel.type === "text" ? "#" : ""}${invite.channel.name}** (${invite.channel.id})
${LINESTART} Inviter: ${invite.inviter == null ? "N/A" : FormatUtil.formatUser(invite.inviter)}
${g.splashURL() != null ? `${LINESTART} Splash:` : ""}`)
message.channel.send({ content: text, embed: eb, disableMentions: "all" })
}
}
}

module.exports = LookupCmd;