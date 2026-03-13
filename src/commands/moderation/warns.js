import { clearWarns, getWarns } from '../../utils/database.js';

export default {
  name: 'warns',
  aliases: ['listwarns', 'avertissements'],
  description: 'Voir ou effacer les warns d\'un membre',
  usage: '+warns <@user|id> [clear]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.channel.send('❌ Tu n\'as pas la permission.');
    }
    const target = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) {
      return message.channel.send('❌ Usage: `+warns @user` ou `+warns @user clear`');
    }
    if (args[1]?.toLowerCase() === 'clear') {
      await clearWarns(message.guild.id, target.id);
      return message.channel.send(`✅ Avertissements de **${target.tag}** effacés.`);
    }
    const warns = await getWarns(message.guild.id, target.id);
    if (warns.length === 0) {
      return message.channel.send(`**${target.tag}** n'a aucun avertissement.`);
    }
    const list = warns.map((w, i) => `${i + 1}. ${w.reason} - <@${w.moderator}>`).join('\n');
    return message.channel.send(`**Avertissements de ${target.tag}** (${warns.length}):\n${list}`);
  }
};
