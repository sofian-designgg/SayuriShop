import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketbuttons',
  aliases: ['ticket-buttons'],
  description: 'Définir les boutons du panel (séparés par |). Max 5.',
  usage: '+ticketbuttons Support|Vente|Réclamation',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const text = args.join(' ');
    if (!text) {
      return message.channel.send(
        '❌ Usage: `+ticketbuttons Support|Vente|Réclamation`\n' +
        'Sépare chaque option par | (max 5 boutons)'
      );
    }
    const buttons = text.split('|').map((b) => b.trim()).filter(Boolean).slice(0, 5);
    if (buttons.length === 0) {
      return message.channel.send('❌ Donne au moins un nom de bouton.');
    }

    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      tickets: { ...config.tickets, buttons }
    });
    return message.channel.send(`✅ Boutons configurés: ${buttons.join(', ')}`);
  }
};
