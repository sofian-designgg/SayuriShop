import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionOverwriteType,
  PermissionFlagsBits
} from 'discord.js';
import { getGuildConfig } from '../utils/database.js';

export default {
  async create(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const config = await getGuildConfig(interaction.guild.id);
    const tickets = config.tickets || {};
    if (!tickets.channelId || !tickets.categoryId) {
      return interaction.editReply('❌ Les tickets ne sont pas configurés. Utilise `+ticketsetup`.');
    }
    const category = interaction.guild.channels.cache.get(tickets.categoryId);
    if (!category) {
      return interaction.editReply('❌ Catégorie tickets introuvable.');
    }
    const existing = interaction.guild.channels.cache.filter(
      (c) => c.parentId === tickets.categoryId && c.name.startsWith('ticket-')
    );
    const userTickets = existing.filter((c) => c.name.includes(interaction.user.id));
    if (userTickets.size >= (tickets.maxTickets || 3)) {
      return interaction.editReply('❌ Tu as atteint le nombre maximum de tickets ouverts.');
    }

    const btnIdx = interaction.customId.replace('ticket_create_', '');
    const btnLabels = tickets.buttons && tickets.buttons.length > 0 ? tickets.buttons : ['Ouvrir un ticket'];
    const typeLabel = btnLabels[parseInt(btnIdx, 10)] || 'ticket';
    const safeName = typeLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'ticket';

    const channel = await interaction.guild.channels.create({
      name: `ticket-${safeName}-${interaction.user.id.toString().slice(-4)}`,
      type: ChannelType.GuildText,
      parent: tickets.categoryId,
      permissionOverwrites: [
        { id: interaction.guild.id, type: PermissionOverwriteType.Role, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, type: PermissionOverwriteType.Member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ...(tickets.supportRoles || []).map((rid) => ({
          id: rid,
          type: PermissionOverwriteType.Role,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }))
      ]
    });

    const createdMsg = (tickets.createdMessage || 'Bonjour {user}, décris ta demande. Le support te répondra rapidement.')
      .replace(/{user}/g, interaction.user.toString());

    const shop = config.shop || {};
    const embed = new EmbedBuilder()
      .setColor(shop.color || 0x5865f2)
      .setTitle(`Ticket — ${typeLabel}`)
      .setDescription(createdMsg)
      .setFooter({ text: shop.name || 'Support' })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_claim_${channel.id}`)
        .setLabel('Prendre en charge')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✋'),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${channel.id}`)
        .setLabel('Fermer le ticket')
        .setStyle(ButtonStyle.Danger)
    );
    await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row1] });
    await interaction.editReply(`✅ Ticket créé : ${channel}`);
  },

  async close(interaction) {
    const channelId = interaction.customId.replace('ticket_close_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
    }
    const config = await getGuildConfig(interaction.guild.id);
    const transcriptId = config.tickets?.transcriptChannelId;
    if (transcriptId) {
      const transcriptChannel = interaction.guild.channels.cache.get(transcriptId);
      if (transcriptChannel) {
        const messages = await channel.messages.fetch({ limit: 100 });
        const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        const text = sorted
          .map((m) => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content || '(pièce jointe)'}`)
          .join('\n');
        const embed = new EmbedBuilder()
          .setTitle(`Transcript: ${channel.name}`)
          .setDescription(text.slice(0, 4000) || 'Aucun message')
          .setColor(0x5865f2)
          .setTimestamp();
        await transcriptChannel.send({ embeds: [embed] });
      }
    }
    await channel.delete().catch(() => {});
    if (!interaction.replied) {
      await interaction.reply({ content: 'Ticket fermé.', ephemeral: true }).catch(() => {});
    }
  },

  async claim(interaction) {
    const channelId = interaction.customId.replace('ticket_claim_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
    }
    const config = await getGuildConfig(interaction.guild.id);
    const tickets = config.tickets || {};
    const isSupport = tickets.supportRoles?.some((rid) => interaction.member.roles.cache.has(rid));
    if (!isSupport && !interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Seuls les supports peuvent faire ça.', ephemeral: true });
    }
    const msg = await channel.messages.fetch({ limit: 5 }).then((msgs) => msgs.find((m) => m.author.bot && m.embeds.length));
    if (msg && msg.components?.length) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_close_${channelId}`)
          .setLabel('Fermer le ticket')
          .setStyle(ButtonStyle.Danger)
      );
      await msg.edit({ components: [row] }).catch(() => {});
    }
    await channel.send({
      embeds: [{
        color: 0x57f287,
        description: `✋ **Pris en charge par** ${interaction.user}`,
        timestamp: new Date().toISOString()
      }]
    });
    await interaction.reply({ content: '✅ Ticket pris en charge.', ephemeral: true });
  },

  async selectCategory(interaction) {
    await interaction.deferUpdate();
  }
};
