import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'setlogo',
  aliases: ['set-logo'],
  description: "Définir l'URL du logo du shop",
  usage: '+setlogo <url>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const url = args[0];
    if (!url) {
      return message.channel.send('❌ Usage: `+setlogo https://...`');
    }
    if (!url.startsWith('https://')) {
      return message.channel.send("❌ L'URL doit commencer par https://");
    }
    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      shop: { ...config.shop, logo: url }
    });
    return message.channel.send('✅ Logo du shop mis à jour');
  }
};
