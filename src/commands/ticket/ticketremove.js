import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketremove',
  aliases: ['ticket-remove', 'tremove'],
  description: 'Retirer quelqu\'un du ticket',
  usage: '+ticketremove @user',
  async execute(message, args, client) {
    if (!message.channel.name.startsWith('ticket-')) {
      return message.channel.send('❌ Utilise cette commande dans un ticket.');
    }
    const config = await getGuildConfig(message.guild.id);
    const tickets = config.tickets || {};
    const isSupport = tickets.supportRoles?.some((rid) => message.member.roles.cache.has(rid));
    if (!isSupport && !message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Seuls les supports peuvent retirer des membres.');
    }
    const target = message.mentions.members?.first() || (args[0] ? message.guild.members.cache.get(args[0]) : null);
    if (!target) return message.channel.send('❌ Usage: `+ticketremove @user`');
    if (target.id === message.author.id) return message.channel.send('❌ Tu ne peux pas te retirer toi-même.');
    try {
      await message.channel.permissionOverwrites.delete(target.id);
      return message.channel.send(`✅ ${target} a été retiré du ticket.`);
    } catch (e) {
      return message.channel.send('❌ Impossible de retirer ce membre.');
    }
  }
};
