import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'setcolor',
  aliases: ['set-color', 'couleur'],
  description: 'Définir la couleur principale du shop (hex)',
  usage: '+setcolor <hex>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const hex = (args[0] || '').replace('#', '');
    if (!hex) {
      return message.channel.send('❌ Usage: `+setcolor #FF5733`');
    }
    const num = parseInt(hex, 16);
    if (isNaN(num) || num < 0 || num > 0xffffff) {
      return message.channel.send('❌ Couleur hex invalide (ex: #FF5733)');
    }
    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      shop: { ...config.shop, color: num }
    });
    return message.channel.send(`✅ Couleur du shop mise à jour : \`#${hex}\``);
  }
};
