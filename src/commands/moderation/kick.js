import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'kick',
  aliases: ['k'],
  description: 'Expulser un membre',
  usage: '+kick <@user|id> [raison]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('KickMembers')) {
      return message.channel.send('❌ Tu n\'as pas la permission d\'expulser.');
    }
    const target = message.mentions.members?.first() || (args[0] ? message.guild.members.cache.get(args[0]) : null);
    if (!target) {
      return message.channel.send('❌ Usage: `+kick @user [raison]`');
    }
    if (target.id === message.author.id) {
      return message.channel.send('❌ Tu ne peux pas t\'expulser toi-même.');
    }
    if (target.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send('❌ Tu ne peux pas expulser ce membre.');
    }
    const reason = args.slice(1).join(' ') || 'Aucune raison';
    try {
      await target.kick(`${message.author.tag}: ${reason}`);
    } catch (e) {
      return message.channel.send('❌ Impossible d\'expulser ce membre.');
    }
    const config = await getGuildConfig(message.guild.id);
    if (config.moderation?.logChannelId) {
      const ch = message.guild.channels.cache.get(config.moderation.logChannelId);
      if (ch) {
        await ch.send({
          embeds: [{
            color: 0xfee75c,
            title: 'Kick',
            fields: [
              { name: 'Membre', value: `${target.user.tag}`, inline: true },
              { name: 'Modérateur', value: message.author.tag, inline: true },
              { name: 'Raison', value: reason }
            ],
            timestamp: new Date().toISOString()
          }]
        }).catch(() => {});
      }
    }
    return message.channel.send(`✅ **${target.user.tag}** a été expulsé. Raison: ${reason}`);
  }
};
