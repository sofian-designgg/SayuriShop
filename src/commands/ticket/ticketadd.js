import { PermissionFlagsBits } from 'discord.js';
import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketadd',
  aliases: ['ticket-add', 'tadd'],
  description: 'Ajouter quelqu\'un au ticket (dans un salon ticket)',
  usage: '+ticketadd @user',
  async execute(message, args, client) {
    if (!message.channel.name.startsWith('ticket-')) {
      return message.channel.send('❌ Utilise cette commande dans un ticket.');
    }
    const config = await getGuildConfig(message.guild.id);
    const tickets = config.tickets || {};
    const isSupport = tickets.supportRoles?.some((rid) => message.member.roles.cache.has(rid));
    if (!isSupport && !message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Seuls les supports peuvent ajouter des membres.');
    }
    const target = message.mentions.members?.first() || (args[0] ? message.guild.members.cache.get(args[0]) : null);
    if (!target) return message.channel.send('❌ Usage: `+ticketadd @user`');
    if (target.user.bot) return message.channel.send('❌ Tu ne peux pas ajouter un bot.');
    try {
      await message.channel.permissionOverwrites.create(target.id, {
        type: 1,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      });
      return message.channel.send(`✅ ${target} a été ajouté au ticket.`);
    } catch (e) {
      return message.channel.send('❌ Impossible d\'ajouter ce membre.');
    }
  }
};
