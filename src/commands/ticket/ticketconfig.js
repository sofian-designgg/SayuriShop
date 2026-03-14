import { ChannelType } from 'discord.js';
import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketconfig',
  aliases: ['ticket-config', 'tconfig'],
  description: 'Configurer les tickets (category, panel, transcript, max)',
  usage: '+ticketconfig category <id> | panel <id> | transcript <id> | max <nb>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const type = args[0]?.toLowerCase();
    const val = args[1];

    if (!type || !val) {
      return message.channel.send(
        '❌ Usage:\n' +
        '`+ticketconfig category <id>` — Catégorie où les tickets s\'affichent\n' +
        '`+ticketconfig panel <id>` — Salon du panel\n' +
        '`+ticketconfig transcript <id>` — Salon des transcripts\n' +
        '`+ticketconfig max <nb>` — Max tickets par user (1-5)'
      );
    }

    const config = await getGuildConfig(message.guild.id);
    const tickets = { ...config.tickets };

    if (type === 'category') {
      const cat = message.guild.channels.cache.get(val);
      if (!cat || cat.type !== ChannelType.GuildCategory) {
        return message.channel.send('❌ Catégorie introuvable. Vérifie l\'ID.');
      }
      tickets.categoryId = val;
      await setGuildConfig(message.guild.id, { tickets });
      return message.channel.send(`✅ Catégorie tickets : **${cat.name}** (\`${val}\`)`);
    }

    if (type === 'panel') {
      const ch = message.guild.channels.cache.get(val);
      if (!ch) return message.channel.send('❌ Salon introuvable.');
      tickets.channelId = val;
      await setGuildConfig(message.guild.id, { tickets });
      return message.channel.send(`✅ Salon panel : ${ch}`);
    }

    if (type === 'transcript') {
      const ch = message.guild.channels.cache.get(val);
      if (!ch) return message.channel.send('❌ Salon introuvable.');
      tickets.transcriptChannelId = val;
      await setGuildConfig(message.guild.id, { tickets });
      return message.channel.send(`✅ Salon transcript : ${ch}`);
    }

    if (type === 'max') {
      const n = parseInt(val, 10);
      if (isNaN(n) || n < 1 || n > 5) return message.channel.send('❌ Nombre invalide (1-5).');
      tickets.maxTickets = n;
      await setGuildConfig(message.guild.id, { tickets });
      return message.channel.send(`✅ Max tickets par user : **${n}**`);
    }

    return message.channel.send('❌ Type invalide. Utilise `+help ticketconfig`.');
  }
};
