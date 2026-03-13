import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'setstatus',
  aliases: ['set-status', 'status'],
  description: 'Définir le statut du shop',
  usage: '+setstatus <statut>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const status = args.join(' ');
    if (!status) {
      return message.channel.send('❌ Usage: `+setstatus Ouvert 24/7`');
    }
    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      shop: { ...config.shop, status }
    });
    return message.channel.send(`✅ Statut du shop mis à jour : **${status}**`);
  }
};
