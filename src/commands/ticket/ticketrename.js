import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketrename',
  aliases: ['ticket-rename', 'trename'],
  description: 'Renommer le ticket',
  usage: '+ticketrename <nouveau_nom>',
  async execute(message, args, client) {
    if (!message.channel.name.startsWith('ticket-')) {
      return message.channel.send('❌ Utilise cette commande dans un ticket.');
    }
    const config = await getGuildConfig(message.guild.id);
    const tickets = config.tickets || {};
    const isSupport = tickets.supportRoles?.some((rid) => message.member.roles.cache.has(rid));
    if (!isSupport && !message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Seuls les supports peuvent renommer le ticket.');
    }
    const name = args.join(' ').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
    if (!name) return message.channel.send('❌ Usage: `+ticketrename nouveau-nom`');
    const newName = `ticket-${name}`;
    try {
      await message.channel.setName(newName);
      return message.channel.send(`✅ Ticket renommé : **${newName}**`);
    } catch (e) {
      return message.channel.send('❌ Impossible de renommer. Vérifie les permissions du bot.');
    }
  }
};
