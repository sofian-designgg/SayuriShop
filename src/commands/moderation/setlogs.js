import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'setlogs',
  aliases: ['logchannel'],
  description: 'Définir le salon des logs de modération',
  usage: '+setlogs #salon',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const ch = message.mentions.channels.first() || (args[0] ? message.guild.channels.cache.get(args[0]) : null);
    if (!ch) {
      return message.channel.send('❌ Usage: `+setlogs #salon`');
    }
    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      moderation: { ...config.moderation, logChannelId: ch.id }
    });
    return message.channel.send(`✅ Salon des logs: ${ch}`);
  }
};
