import { EmbedBuilder } from 'discord.js';
import { addParticipant, getGiveawayByMessage, removeParticipant } from '../utils/database.js';

export default {
  async join(interaction) {
    const messageId = interaction.customId.replace('giveaway_join_', '');
    const g = await getGiveawayByMessage(messageId);
    if (!g) {
      return interaction.reply({ content: 'Ce giveaway est terminé ou introuvable.', ephemeral: true });
    }
    if (g.participants.includes(interaction.user.id)) {
      await removeParticipant(messageId, interaction.user.id);
      return interaction.reply({ content: 'Tu as quitté le giveaway.', ephemeral: true });
    }
    await addParticipant(messageId, interaction.user.id);
    return interaction.reply({ content: 'Tu participes au giveaway !', ephemeral: true });
  }
};
