import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'stockchannel',
  aliases: ['stock-channel', 'salonstock'],
  description: 'Définir le salon des alertes rupture de stock',
  usage: '+stockchannel #salon',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const ch = message.mentions.channels.first() || (args[0] ? message.guild.channels.cache.get(args[0]) : null);
    if (!ch) {
      return message.channel.send('❌ Usage: `+stockchannel #salon`');
    }
    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      stockMonitor: { ...config.stockMonitor, channelId: ch.id }
    });
    return message.channel.send(`✅ Salon des alertes stock : ${ch}`);
  }
};
