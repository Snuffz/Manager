class Command {
  constructor (client, {
    name = null,
    description = "No description has been provided.",
    category = "No category has been provided.",
    usage = new String(),
    enabled = true,
    guildOnly = false,
    ownerOnly = false,
    aliases = new Array(),
    botPermissions = new Array(),
    userPermissions = new Array(),
    cooldown = new Number(),
    daysToDelete = new Number()
  }) {
    this.client = client;
    this.conf = { enabled, guildOnly, ownerOnly, aliases, cooldown, botPermissions, userPermissions };
    this.help = { name, description, category, usage };
    this.mod = { daysToDelete }
  }
}

module.exports = Command;