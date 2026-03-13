import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../../utils/database.js';

const EMOJIS = ['🎫', '🛒', '❓', '📋', '💬'];

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
    const tickets = config.tickets || {};
    if (!tickets.channelId) {
      return message.channel.send('❌ Configure d\'abord les tickets avec `+ticketsetup`.');
    }

    const panelMsg = tickets.panelMessage || 'Cliquez sur un bouton ci-dessous pour ouvrir un ticket.';
    const embed = new EmbedBuilder()
      .setColor(shop.color || 0x5865f2)
      .setTitle(shop.name || 'Support')
      .setDescription(panelMsg)
      .setFooter({ text: shop.status || 'Sayuri Shop' })
      .setTimestamp();
    if (shop.logo) embed.setThumbnail(shop.logo);

    const buttons = tickets.buttons && tickets.buttons.length > 0 ? tickets.buttons : ['Ouvrir un ticket'];
    const row = new ActionRowBuilder();
    buttons.slice(0, 5).forEach((label, i) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_create_${i}`)
          .setLabel(label.slice(0, 80))
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS[i] || '🎫')
      );
    });

    await message.channel.send({ embeds: [embed], components: [row] });
    if (message.deletable) await message.delete().catch(() => {});
  }
};
