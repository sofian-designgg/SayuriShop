import { ChannelType } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

const EMOJIS = ['🎫', '🛒', '❓', '📋', '💬'];

export default {
  name: 'setup',
  aliases: ['configserver'],
  description: 'Créer toute la structure du serveur (4 catégories + salons)',
  usage: '+setup',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }

    const loading = await message.channel.send('⏳ Configuration du serveur en cours...');

    try {
      const guild = message.guild;
      const created = [];

      const catVouch = await guild.channels.create({
        name: 'vouch',
        type: ChannelType.GuildCategory
      });
      created.push(`📁 ${catVouch.name}`);

      const chPreuve = await guild.channels.create({
        name: 'preuve',
        type: ChannelType.GuildText,
        parent: catVouch.id
      });
      created.push(`  └ #${chPreuve.name}`);

      const catShop = await guild.channels.create({
        name: 'shop',
        type: ChannelType.GuildCategory
      });
      created.push(`📁 ${catShop.name}`);

      const chTicket = await guild.channels.create({
        name: 'ticket',
        type: ChannelType.GuildText,
        parent: catShop.id
      });
      created.push(`  └ #${chTicket.name}`);

      for (let i = 1; i <= 20; i++) {
        const ch = await guild.channels.create({
          name: `shop-${i}`,
          type: ChannelType.GuildText,
          parent: catShop.id
        });
        created.push(`  └ #${ch.name}`);
      }

      const catStatut = await guild.channels.create({
        name: 'statut',
        type: ChannelType.GuildCategory
      });
      created.push(`📁 ${catStatut.name}`);

      const chStatut = await guild.channels.create({
        name: 'statut-du-shop',
        type: ChannelType.GuildText,
        parent: catStatut.id
      });
      created.push(`  └ #${chStatut.name}`);

      const catInfo = await guild.channels.create({
        name: 'info',
        type: ChannelType.GuildCategory
      });
      created.push(`📁 ${catInfo.name}`);

      const chInfo = await guild.channels.create({
        name: 'informations',
        type: ChannelType.GuildText,
        parent: catInfo.id
      });
      created.push(`  └ #${chInfo.name}`);

      const chTranscript = await guild.channels.create({
        name: 'transcripts',
        type: ChannelType.GuildText,
        parent: catInfo.id
      });
      created.push(`  └ #${chTranscript.name}`);

      const config = await getGuildConfig(guild.id);
      await setGuildConfig(guild.id, {
        tickets: {
          ...config.tickets,
          categoryId: catShop.id,
          channelId: chTicket.id,
          transcriptChannelId: chTranscript.id
        },
        announce: { ...config.announce, channelId: chInfo.id },
        moderation: { ...config.moderation, logChannelId: chInfo.id },
        giveaway: { ...config.giveaway, channelId: chInfo.id },
        stockMonitor: { ...config.stockMonitor, channelId: chStatut.id }
      });

      const panelMsg = config.tickets?.panelMessage || 'Cliquez sur un bouton ci-dessous pour ouvrir un ticket.';
      const buttons = config.tickets?.buttons?.length ? config.tickets.buttons : ['Support', 'Achat', 'Autre'];
      const shop = config.shop || {};

      const embed = new EmbedBuilder()
        .setColor(shop.color ?? 0x5865f2)
        .setTitle(shop.name || 'Support')
        .setDescription(panelMsg)
        .setFooter({ text: shop.status || 'Sayuri Shop' })
        .setTimestamp();
      if (shop.logo) embed.setThumbnail(shop.logo);

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

      await chTicket.send({ embeds: [embed], components: [row] });

      await loading.edit(
        '✅ **Configuration terminée**\n\n' +
        created.join('\n') +
        '\n\nLe panel ticket est dans **#ticket**. Tu peux renommer les salons shop-1 à shop-20.'
      );
    } catch (e) {
      console.error('Setup error:', e);
      await loading.edit('❌ Erreur: ' + e.message);
    }
  }
};
