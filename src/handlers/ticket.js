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
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}-${interaction.user.id.slice(-4)}`,
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
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Ticket créé')
      .setDescription(`Bonjour ${interaction.user}, décris ta demande. Le support te répondra rapidement.`)
      .setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_close_${channel.id}`)
        .setLabel('Fermer le ticket')
        .setStyle(ButtonStyle.Danger)
    );
    await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
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

  async selectCategory(interaction) {
    await interaction.deferUpdate();
  }
};
