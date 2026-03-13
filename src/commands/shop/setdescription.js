import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'setdescription',
  aliases: ['set-desc'],
  description: 'Définir la description du shop',
  usage: '+setdescription <texte>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const desc = args.join(' ');
    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      shop: { ...config.shop, description: desc || null }
    });
    return message.channel.send(desc ? `✅ Description mise à jour.` : '✅ Description effacée.');
  }
};
