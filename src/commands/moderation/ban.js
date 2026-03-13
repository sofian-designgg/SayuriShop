import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'ban',
  aliases: ['b'],
  description: 'Bannir un membre',
  usage: '+ban <@user|id> [raison]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.channel.send('❌ Tu n\'as pas la permission de bannir.');
    }
    const target = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) {
      return message.channel.send('❌ Usage: `+ban @user [raison]`');
    }
    if (target.id === message.author.id) {
      return message.channel.send('❌ Tu ne peux pas te bannir toi-même.');
    }
    const member = message.guild.members.cache.get(target.id);
    if (member && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send('❌ Tu ne peux pas bannir ce membre (rôle plus élevé).');
    }
    const reason = args.slice(1).join(' ') || 'Aucune raison';
    try {
      await message.guild.members.ban(target.id, { reason: `${message.author.tag}: ${reason}` });
    } catch (e) {
      return message.channel.send('❌ Impossible de bannir ce membre.');
    }
    const config = await getGuildConfig(message.guild.id);
    if (config.moderation?.logChannelId) {
      const ch = message.guild.channels.cache.get(config.moderation.logChannelId);
      if (ch) {
        await ch.send({
          embeds: [{
            color: 0xed4245,
            title: 'Ban',
            fields: [
              { name: 'Membre', value: `${target.tag} (${target.id})`, inline: true },
              { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
              { name: 'Raison', value: reason }
            ],
            timestamp: new Date().toISOString()
          }]
        }).catch(() => {});
      }
    }
    return message.channel.send(`✅ **${target.tag}** a été banni. Raison: ${reason}`);
  }
};
