import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'setname',
  aliases: ['set-name', 'shopname'],
  description: 'Définir le nom du shop',
  usage: '+setname <nom>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const nom = args.join(' ');
    if (!nom) {
      return message.channel.send('❌ Usage: `+setname Mon Shop`');
    }
    const config = await getGuildConfig(message.guild.id);
    await setGuildConfig(message.guild.id, {
      shop: { ...config.shop, name: nom }
    });
    return message.channel.send(`✅ Nom du shop mis à jour : **${nom}**`);
  }
};
