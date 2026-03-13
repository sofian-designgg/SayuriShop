import { EmbedBuilder } from 'discord.js';
import {
  endGiveaway,
  getGiveawayByMessage,
  getGiveawaysByGuild
} from '../../utils/database.js';

function pickWinners(participants, count) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default {
  name: 'gend',
  aliases: ['giveaway-end'],
  description: 'Terminer un giveaway et désigner les gagnants',
  usage: '+gend [id_message]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.channel.send('❌ Tu dois pouvoir gérer le serveur.');
    }
    let g;
    if (args[0]) {
      g = await getGiveawayByMessage(args[0]);
    } else {
      const list = await getGiveawaysByGuild(message.guild.id);
      g = list[list.length - 1];
    }
    if (!g) {
      return message.channel.send('❌ Giveaway introuvable. Utilise `+gend <id_message>`.');
    }
    const channel = message.guild.channels.cache.get(g.channelId);
    if (!channel) {
      return message.channel.send('❌ Salon introuvable.');
    }
    let msg;
    try {
      msg = await channel.messages.fetch(g.messageId);
    } catch {
      return message.channel.send('❌ Message du giveaway introuvable.');
    }

    const participants = g.participants || [];
    const winnerCount = Math.min(g.winners || 1, participants.length);
    const winners = pickWinners(participants, winnerCount);

    await endGiveaway(g.messageId, { participants, winners });

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🎉 Giveaway terminé')
      .setDescription(
        `**${g.prize}**\n\nGagnant(s): ${winners.length > 0 ? winners.map((id) => `<@${id}>`).join(', ') : 'Aucun participant'}`
      )
      .setFooter({ text: `Organisé par ${(await client.users.fetch(g.hostId).catch(() => null))?.tag || 'Inconnu'}` })
      .setTimestamp();

    await msg.edit({ components: [] }).catch(() => {});
    await channel.send({ content: winners.length > 0 ? `Félicitations ${winners.map((id) => `<@${id}>`).join(', ')} !` : '', embeds: [embed] });

    return message.channel.send('✅ Giveaway terminé.');
  }
};
