import { EmbedBuilder } from 'discord.js';

export default {
  name: 'help',
  aliases: ['h', 'aide'],
  description: 'Liste des commandes',
  usage: '+help [commande]',
  async execute(message, args, client) {
    const prefix = client.prefix || '+';
    const cmdName = args[0]?.toLowerCase();

    if (cmdName) {
      const cmd = client.commands.get(cmdName);
      if (!cmd) {
        return message.channel.send(`❌ Commande \`${cmdName}\` introuvable.`);
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${prefix}${cmd.name}`)
        .setDescription(cmd.description || 'Sans description')
        .addFields({ name: 'Usage', value: `\`${cmd.usage || prefix + cmd.name}\`` });
      if (cmd.aliases?.length) {
        embed.addFields({ name: 'Aliases', value: cmd.aliases.join(', ') });
      }
      return message.channel.send({ embeds: [embed] });
    }

    const cats = {};
    const seen = new Set();
    for (const [name, cmd] of client.commands) {
      if (seen.has(cmd.name)) continue;
      seen.add(cmd.name);
      let folder = 'Autres';
      if (['ban', 'kick', 'mute', 'warn', 'warns', 'clear', 'setlogs'].includes(cmd.name)) folder = 'Modération';
      else if (['ticketsetup', 'ticketpanel'].includes(cmd.name)) folder = 'Tickets';
      else if (['setcolor', 'setname', 'setstatus', 'setlogo', 'setdescription'].includes(cmd.name)) folder = 'Shop';
      else if (['embed'].includes(cmd.name)) folder = 'Embed';
      else if (['annonce'].includes(cmd.name)) folder = 'Annonces';
      else if (['dmall'].includes(cmd.name)) folder = 'DM';
      else if (['gstart', 'gend', 'greroll', 'gsetchannel'].includes(cmd.name)) folder = 'Giveaway';
      else if (['stockchannel', 'stockmonitor'].includes(cmd.name)) folder = 'Stock';
      else if (['help'].includes(cmd.name)) folder = 'Config';
      if (!cats[folder]) cats[folder] = [];
      cats[folder].push(`\`${prefix}${cmd.name}\` - ${cmd.description || ''}`);
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Sayuri Shop - Commandes')
      .setDescription(`Préfixe: **${prefix}**\nUtilise \`${prefix}help <commande>\` pour plus d'infos.`)
      .setTimestamp();

    for (const [cat, list] of Object.entries(cats)) {
      embed.addFields({ name: cat, value: [...new Set(list)].join('\n') });
    }

    return message.channel.send({ embeds: [embed] });
  }
};
