import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getGuildConfig, saveGiveaway } from '../../utils/database.js';

export default {
  name: 'gstart',
  aliases: ['giveaway'],
  description: 'Lancer un giveaway',
  usage: '+gstart <durée_min> <gagnants> <prize>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.channel.send('❌ Tu dois pouvoir gérer le serveur.');
    }
    const d = parseInt(args[0], 10);
    const w = parseInt(args[1], 10);
    const prize = args.slice(2).join(' ');

    if (isNaN(d) || d < 1 || d > 10080) {
      return message.channel.send('❌ Durée invalide (1-10080 min). Usage: `+gstart 60 1 Nitro 1 mois`');
    }
    if (isNaN(w) || w < 1 || w > 20) {
      return message.channel.send('❌ Nombre de gagnants invalide (1-20).');
    }
    if (!prize) {
      return message.channel.send('❌ Précise le prize. Usage: `+gstart 60 1 Nitro 1 mois`');
    }

    const config = await getGuildConfig(message.guild.id);
    const chId = config.giveaway?.channelId || message.channel.id;
    const channel = message.guild.channels.cache.get(chId);
    if (!channel) {
      return message.channel.send('❌ Salon des giveaways introuvable. Configure avec `+gsetchannel #salon`');
    }

    const endAt = new Date(Date.now() + d * 60 * 1000);
    const shop = config.shop || {};

    const embed = new EmbedBuilder()
      .setColor(shop.color ?? 0x5865f2)
      .setTitle('🎉 Giveaway')
      .setDescription(`**${prize}**\n\nFin: <t:${Math.floor(endAt.getTime() / 1000)}:R>\nGagnants: **${w}**\nParticipants: **0**`)
      .setFooter({ text: `Organisé par ${message.author.tag}` })
      .setTimestamp(endAt);

    const msg = await channel.send({ embeds: [embed] });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_join_${msg.id}`)
        .setLabel('Participation')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎉')
    );
    await msg.edit({ components: [row] }).catch(() => {});

    await saveGiveaway({
      messageId: msg.id,
      channelId: channel.id,
      guildId: message.guild.id,
      hostId: message.author.id,
      prize,
      endAt,
      winners: w,
      participants: []
    });

    return message.channel.send(`✅ Giveaway créé dans ${channel}`);
  }
};
