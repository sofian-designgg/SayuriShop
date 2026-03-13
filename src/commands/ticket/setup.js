import { ChannelType } from 'discord.js';
import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketsetup',
  aliases: ['ticket-setup', 'tsetup'],
  description: 'Configurer le système de tickets',
  usage: '+ticketsetup [catégorie_id] [salon_panel_id] [salon_transcript_id]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const config = await getGuildConfig(message.guild.id);
    const catId = args[0] || config.tickets?.categoryId;
    const panelId = args[1] || config.tickets?.channelId;
    const transcriptId = args[2] || config.tickets?.transcriptChannelId;

    if (!catId || !panelId) {
      return message.channel.send(
        '❌ Usage: `+ticketsetup <id_catégorie> <id_salon_panel>` ou configurer les deux d\'abord.'
      );
    }
    const cat = message.guild.channels.cache.get(catId);
    const panel = message.guild.channels.cache.get(panelId);
    if (!cat || cat.type !== ChannelType.GuildCategory) {
      return message.channel.send('❌ Catégorie invalide.');
    }
    if (!panel) {
      return message.channel.send('❌ Salon panel invalide.');
    }
    await setGuildConfig(message.guild.id, {
      tickets: {
        ...config.tickets,
        categoryId: catId,
        channelId: panelId,
        transcriptChannelId: transcriptId || config.tickets?.transcriptChannelId
      }
    });
    return message.channel.send(
      `✅ Tickets configurés.\nCatégorie: ${cat.name}\nPanel: ${panel}\nTranscript: ${transcriptId ? `<#${transcriptId}>` : 'Non défini'}`
    );
  }
};
