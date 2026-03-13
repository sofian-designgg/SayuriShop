import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketrole',
  aliases: ['ticket-role', 'tsupport'],
  description: 'Ajouter ou retirer un rôle support pour les tickets',
  usage: '+ticketrole add @role | +ticketrole remove @role',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const action = args[0]?.toLowerCase();
    const role = message.mentions.roles.first() || (args[1] ? message.guild.roles.cache.get(args[1]) : null);
    if (!action || !role || !['add', 'remove'].includes(action)) {
      return message.channel.send('❌ Usage: `+ticketrole add @role` ou `+ticketrole remove @role`');
    }
    const config = await getGuildConfig(message.guild.id);
    const roles = config.tickets?.supportRoles || [];
    if (action === 'add') {
      if (roles.includes(role.id)) return message.channel.send('✅ Ce rôle a déjà accès aux tickets.');
      roles.push(role.id);
    } else {
      const i = roles.indexOf(role.id);
      if (i === -1) return message.channel.send('❌ Ce rôle n\'a pas accès aux tickets.');
      roles.splice(i, 1);
    }
    await setGuildConfig(message.guild.id, {
      tickets: { ...config.tickets, supportRoles: roles }
    });
    return message.channel.send(`✅ Rôle ${role.name} ${action === 'add' ? 'ajouté' : 'retiré'} des supports tickets.`);
  }
};
