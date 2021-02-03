const 
Command = require("../../base/Command.js");

const CANCEL = "\u274C"; // ❌
const CONFIRM = "\u2705"; // ✅

class InvitepruneCmd extends Command {
  constructor (client) {
    super(client, {
      name: "inviteprune",
      description: "deletes invites with up to a certain number of uses",
      category: "Tools",
      usage: "[max uses]",
      guildOnly: true,
      botPermissions: ["MANAGE_GUILD"],
      userPermissions: ["MANAGE_GUILD"]
    });
  }

  async run (message, args, reply) { 
    var uses;
    if(!args[0])
    uses = 1;
    else if(isNaN(args[0]))
    {
   return reply(`${this.client.config.emojis.error} Please provide a valid number!`);
    }
    else uses = parseInt(args[0]);
    if(uses<0 || uses>50)
    return reply(`${this.client.config.emojis.error} The minimum number of uses is 0 and the maximum is 50.`);
    if(uses>10)
    await waitForConfirmation(this.client, `This will delete all invites with ${uses} or fewer uses.`, uses);
    else pruneInvites(uses, this.client);

    function pruneInvites(uses, client) {
       message.guild.fetchInvites().then(list => {
       const toPrune = list.filter(i => i.inviter!=null && !i.inviter.bot && i.uses<=uses);
       toPrune.forEach(i => i.delete().catch(()=>{}));
       reply(`${client.config.emojis.success} Deleted \`${toPrune.size}\` invites with \`${uses}\` uses.`);
       })
    }

    async function waitForConfirmation(client, msg, uses){
        const ms = await reply(`${client.config.emojis.warning} `+msg);
          await ms.react(CONFIRM);
          await ms.react(CANCEL);
          const collected = await ms.awaitReactions((reaction, user) => user.id === message.author.id, {max: 1, time: 60000, errors: ["time"] });
          const res = collected.first().emoji.name;
          if(res === CONFIRM)
          {
              ms.delete();
            pruneInvites(uses, client);
          }
          else ms.delete();
    }
  }
}
module.exports = InvitepruneCmd