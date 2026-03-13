import { getGuildConfig } from '../../utils/database.js';

export default {
  name: 'mute',
  aliases: ['m'],
  description: 'Rendre muet un membre (timeout 10 min par défaut)',
  usage: '+mute <@user> [durée en minutes] [raison]',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.channel.send('❌ Tu n\'as pas la permission de timeout.');
    }
    const target = message.mentions.members?.first() || (args[0] ? message.guild.members.cache.get(args[0]) : null);
    if (!target) {
      return message.channel.send('❌ Usage: `+mute @user [minutes] [raison]`');
    }
    if (target.id === message.author.id) {
      return message.channel.send('❌ Tu ne peux pas te mute toi-même.');
    }
    if (target.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send('❌ Tu ne peux pas mute ce membre.');
    }
    let mins = 10;
    let reasonStart = 1;
    const num = parseInt(args[1], 10);
    if (!isNaN(num) && num > 0) {
      mins = Math.min(num, 40320);
      reasonStart = 2;
    }
    const reason = args.slice(reasonStart).join(' ') || 'Aucune raison';
    const ms = mins * 60 * 1000;
    try {
      await target.timeout(ms, `${message.author.tag}: ${reason}`);
    } catch (e) {
      return message.channel.send('❌ Impossible de timeout ce membre.');
    }
    const config = await getGuildConfig(message.guild.id);
    if (config.moderation?.logChannelId) {
      const ch = message.guild.channels.cache.get(config.moderation.logChannelId);
      if (ch) {
        await ch.send({
          embeds: [{
            color: 0x95a5a6,
            title: 'Mute (Timeout)',
            fields: [
              { name: 'Membre', value: target.user.tag, inline: true },
              { name: 'Modérateur', value: message.author.tag, inline: true },
              { name: 'Durée', value: `${mins} min`, inline: true },
              { name: 'Raison', value: reason }
            ],
            timestamp: new Date().toISOString()
          }]
        }).catch(() => {});
      }
    }
    return message.channel.send(`✅ **${target.user.tag}** a été muté pendant ${mins} min.`);
  }
};
