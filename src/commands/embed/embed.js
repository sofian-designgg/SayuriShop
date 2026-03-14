import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'embed',
  aliases: ['say', 'annembed'],
  description: 'Envoyer un embed personnalisable (avec image possible)',
  usage: '+embed <titre> | <description> | [url_image] — utilise \\n pour passer à la ligne',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageMessages')) {
      return message.channel.send('❌ Tu dois pouvoir gérer les messages.');
    }
    const text = message.content.slice(message.content.indexOf(' ') + 1).trim();
    const parts = text.split('|').map((s) => s.trim());
    const titre = parts[0] || 'Embed';
    const desc = (parts[1] || '').replace(/\\n/g, '\n');
    const imageUrl = parts[2] || '';

    const config = await getGuildConfig(message.guild.id);
    const shop = config.shop || {};
    const embed = new EmbedBuilder()
      .setColor(shop.color ?? 0x5865f2)
      .setTitle(titre)
      .setDescription(desc)
      .setTimestamp();

    if (imageUrl && imageUrl.startsWith('https://')) {
      embed.setImage(imageUrl);
    }
    if (shop.logo) embed.setThumbnail(shop.logo);

    if (message.deletable) await message.delete().catch(() => {});
    return message.channel.send({ embeds: [embed] });
  }
};
