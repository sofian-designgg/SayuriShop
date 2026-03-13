import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'stockmonitor',
  aliases: ['stock-monitor', 'monitorstock'],
  description: 'Activer/désactiver la surveillance des ruptures de stock',
  usage: '+stockmonitor on | +stockmonitor off',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const arg = args[0]?.toLowerCase();
    if (arg !== 'on' && arg !== 'off') {
      return message.channel.send('❌ Usage: `+stockmonitor on` ou `+stockmonitor off`');
    }
    const config = await getGuildConfig(message.guild.id);
    if (arg === 'on' && !config.stockMonitor?.channelId) {
      return message.channel.send('❌ Configure d\'abord le salon avec `+stockchannel #salon`');
    }
    await setGuildConfig(message.guild.id, {
      stockMonitor: { ...config.stockMonitor, enabled: arg === 'on' }
    });
    return message.channel.send(`✅ Surveillance stock ${arg === 'on' ? 'activée' : 'désactivée'}.`);
  }
};
