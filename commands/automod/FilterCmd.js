const
FilterManager = require("../../models/managers/FilterManager"),
Command = require("../../base/Command.js"),
{ MessageEmbed } = require("discord.js");

const FILTER_TITLE = "\uD83D\uDEB7 Filters"; // 🚷

class FilterCmd extends Command {
  constructor (client) {
    super(client, {
      name: "filter",
      description: "add words to filter",
      category: "Automod",
      usage: "<add | remove> <category> <strikes> <words...>",
      guildOnly: true,
      aliases: ['filters'],
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) {
    if(!args[0] || !["add","create","remove","delete","list","show"].includes(args[0].toLowerCase())) return reply(`${this.client.config.emojis.error} **You need to provide what you want to do:**
\`add\` - add a filter word
\`remove\` - remove a category
\`list\` - list all categories`);
const option = args[0].toLowerCase();
      if (["add", "create"].includes(option)) {
        if(!args[1] && !args[2] && !args[3] || isNaN(args[2])) return reply(`${this.client.config.emojis.error} **You need to supply all arguments correctly:**
\`category\` - The category the word fits into. It will be used in Moderation Logs
\`strikes\` - How many strikes the member will receive to speak any of the words
\`words\` - The words to be filtered, they are administered separately. You must put \`"\` (quote) or \`/\` (regex) at the end of each one`)
      const name = args[1];
      const warns = parseInt(args[2]);
      let words = args.slice(3).join(' ').toLowerCase().split(' ');
      if(warns > 100 || warns < 0) return reply( `${this.client.config.emojis.error} The number of strikes cannot be less than 0 or greater than 100!`);
      if(words.filter(a => a.endsWith("/") && a.startsWith("/") || a.startsWith('"') && a.endsWith('"')).length==0) return reply(`${this.client.config.emojis.error} You need to put \`"\` or \`/\` at the end of each word!\n\nThe words that have \`"\` at the beginning and at the end will be checked if included in any message.\nThe words you have \`/\` at the beginning and at the end, filtered the messages using regex.`)
   if(message.guild.settings.filterWords.find(w => w.category.toLowerCase() === name.toLowerCase())) return reply(`${this.client.config.emojis.error} There is already a filter with that name!`)
      words = [... new Set(words)];
      words.forEach(async word => {
   const exists = message.guild.settings.filterWords.find(w => w.word === word);
  if(exists) return;
const wordAll = word.split(""); wordAll.shift(); wordAll.pop();
  const j = {
word: wordAll.join(""),
regex: word.startsWith("/") && word.endsWith("/"),
strike: warns,
category: name
  };
  if(FilterManager.addFilter(message.guild, j)){
    message.channel.send({content: `${this.client.config.emojis.success} Filter *${name}* (\`${warns} ${this.client.getEmoji("strike")}\`) successfully created with filtered terms:\n${words.join(" ").replace("*", "\\*").replace("`", "\\`")}`, disableMentions: "all"});
  }
  else 
  {
    reply(`${this.client.config.emojis.error} Your filter name must contain only letters or numbers.`)
  }
});
} else if(["remove", "delete"].includes(option)) {
  if(!args[1]) 
  {
    reply(`${this.client.config.emojis.error} Provide the filter name.`);
    return;
  }
  const name = args[1].toLowerCase();
  if(FilterManager.deleteFilter(message.guild, name)==null)
  {
    return message.channel.send({content: `${this.client.config.emojis.error} There is no filter with the name \`${args[1]}\``, disableMentions: "all"});
  }
  else 
  {
    message.channel.send({content: `${this.client.config.emojis.success} All to the words included in the category \`${args[1].substr(0,1).toUpperCase()+args[1].substr(1).toLowerCase()}\` have been removed.`, disableMentions: "all"});
  }
} else if(["list", "show"].includes(option)) {
  const field = FilterManager.getFiltersDisplay(message.guild);
  if(field == null)
  {
    reply(`${this.client.config.emojis.error} There is no filter on this server.`);
    return;
  }
  reply("",new MessageEmbed()
  .addField(FILTER_TITLE, FilterManager.getFiltersDisplay(message.guild))
  .setColor(message.guild.me.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||"")
)
}
  }
}
module.exports = FilterCmd;