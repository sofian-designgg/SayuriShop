import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketpanel',
  aliases: ['ticket-panel', 'tpanel'],
  description: 'Envoyer le panel de création de tickets',
  usage: '+ticketpanel',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const config = await getGuildConfig(message.guild.id);
    const shop = config.shop || {};
    if (!config.tickets?.channelId) {
      return message.channel.send('❌ Configure d\'abord les tickets avec `+ticketsetup`.');
    }
    const embed = new EmbedBuilder()
      .setColor(shop.color || 0x5865f2)
      .setTitle(shop.name || 'Support')
      .setDescription('Cliquez sur le bouton ci-dessous pour ouvrir un ticket.')
      .setFooter({ text: shop.status || 'Sayuri Shop' })
      .setTimestamp();
    if (shop.logo) embed.setThumbnail(shop.logo);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('Ouvrir un ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫')
    );
    await message.channel.send({ embeds: [embed], components: [row] });
    if (message.deletable) await message.delete().catch(() => {});
  }
};
