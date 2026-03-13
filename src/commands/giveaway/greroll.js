import { EmbedBuilder } from 'discord.js';
import { getGiveawayByMessage } from '../../utils/database.js';

function pickWinners(participants, count) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default {
  name: 'greroll',
  aliases: ['giveaway-reroll'],
  description: 'Re-tirer un gagnant (giveaway déjà terminé)',
  usage: '+greroll <id_message> [nombre]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.channel.send('❌ Tu dois pouvoir gérer le serveur.');
    }
    const msgId = args[0];
    if (!msgId) {
      return message.channel.send('❌ Usage: `+greroll <id_message> [nombre]`');
    }
    const g = await getGiveawayByMessage(msgId);
    if (!g) {
      const { getEndedGiveaway } = await import('../../utils/database.js');
      const ended = await getEndedGiveaway(msgId);
      if (!ended) return message.channel.send('❌ Giveaway introuvable ou non terminé.');
      const n = parseInt(args[1], 10) || 1;
      const participants = ended.participants || [];
      const winners = pickWinners(participants, n);
      const ch = message.guild.channels.cache.get(ended.channelId);
      if (ch) {
        await ch.send({
          content: `Re-tirage: **${ended.prize}** - Gagnant(s): ${winners.map((id) => `<@${id}>`).join(', ')}`
        });
      }
      return message.channel.send('✅ Re-tirage effectué.');
    }
    return message.channel.send('❌ Ce giveaway est encore actif. Utilise `+gend` pour le terminer.');
  }
};
