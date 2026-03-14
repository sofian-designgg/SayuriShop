import { getGuildConfig, setGuildConfig } from '../../utils/database.js';

export default {
  name: 'ticketmsg',
  aliases: ['ticket-message', 'ticketmessage'],
  description: 'Modifier les messages des tickets (panel ou créé)',
  usage: '+ticketmsg panel <texte> | +ticketmsg created <texte>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const type = args[0]?.toLowerCase();
    const text = args.slice(1).join(' ').replace(/\\n/g, '\n');

    if (type !== 'panel' && type !== 'created') {
      return message.channel.send(
        '❌ Usage:\n' +
        '`+ticketmsg panel <texte>` — Message du panel (description)\n' +
        '`+ticketmsg created <texte>` — Message quand un ticket est créé (utilise `{user}` pour mentionner)\n\n' +
        'Ex: `+ticketmsg created Bonjour {user}, décris ta demande. Notre équipe te répondra.`'
      );
    }
    if (!text) {
      return message.channel.send('❌ Entre le texte du message.');
    }

    const config = await getGuildConfig(message.guild.id);
    const updates = type === 'panel'
      ? { panelMessage: text }
      : { createdMessage: text };
    await setGuildConfig(message.guild.id, {
      tickets: { ...config.tickets, ...updates }
    });
    return message.channel.send(`✅ Message **${type}** mis à jour.`);
  }
};
