import { EmbedBuilder } from 'discord.js';
import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'annonce',
  aliases: ['announce', 'annonce-set', 'annonce-send'],
  description: 'Définir le salon des annonces ou envoyer une annonce',
  usage: '+annonce set #salon | +annonce [titre] | [description] | [url_image]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    if (args[0]?.toLowerCase() === 'set') {
      const ch = message.mentions.channels.first() || (args[1] ? message.guild.channels.cache.get(args[1]) : null);
      if (!ch) return message.channel.send('❌ Usage: `+annonce set #salon`');
      const config = await getGuildConfig(message.guild.id);
      await setGuildConfig(message.guild.id, {
        announce: { ...config.announce, channelId: ch.id }
      });
      return message.channel.send(`✅ Salon des annonces: ${ch}`);
    }
    const config = await getGuildConfig(message.guild.id);
    const channelId = config.announce?.channelId;
    if (!channelId) {
      return message.channel.send('❌ Configure le salon des annonces avec `+annonce set #salon`');
    }
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel) {
      return message.channel.send('❌ Salon des annonces introuvable.');
    }
    const text = args.join(' ');
    const parts = text.split('|').map((s) => s.trim());
    const titre = parts[0] || 'Annonce';
    const desc = parts[1] || '';
    const imageUrl = parts[2] || '';

    const shop = config.shop || {};
    const embed = new EmbedBuilder()
      .setColor(shop.color ?? 0x5865f2)
      .setTitle(titre)
      .setDescription(desc)
      .setFooter({ text: shop.name || 'Sayuri Shop' })
      .setTimestamp();
    if (imageUrl && imageUrl.startsWith('https://')) embed.setImage(imageUrl);
    if (shop.logo) embed.setThumbnail(shop.logo);

    await channel.send({ embeds: [embed] });
    if (message.deletable) await message.delete().catch(() => {});
    return message.channel.send('✅ Annonce envoyée.').then((m) => setTimeout(() => m.delete().catch(() => {}), 3000));
  }
};
