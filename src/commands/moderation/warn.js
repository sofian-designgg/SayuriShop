import { addWarn, getGuildConfig } from '../../utils/database.js';

export default {
  name: 'warn',
  aliases: ['w'],
  description: 'Avertir un membre',
  usage: '+warn <@user|id> [raison]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.channel.send('❌ Tu n\'as pas la permission de warn.');
    }
    const target = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) {
      return message.channel.send('❌ Usage: `+warn @user [raison]`');
    }
    const reason = args.slice(1).join(' ') || 'Aucune raison';
    const count = await addWarn(message.guild.id, target.id, message.author.id, reason);
    return message.channel.send(`✅ **${target.tag}** a reçu un avertissement (${count}/3). Raison: ${reason}`);
  }
};
