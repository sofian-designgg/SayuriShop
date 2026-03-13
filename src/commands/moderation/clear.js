export default {
  name: 'clear',
  aliases: ['purge', 'suppr'],
  description: 'Supprimer des messages',
  usage: '+clear <nombre>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageMessages')) {
      return message.channel.send('❌ Tu n\'as pas la permission de gérer les messages.');
    }
    const n = parseInt(args[0], 10);
    if (isNaN(n) || n < 1 || n > 100) {
      return message.channel.send('❌ Usage: `+clear 1-100`');
    }
    const deleted = await message.channel.bulkDelete(n + 1, true).catch(() => null);
    const count = deleted ? Math.max(0, deleted.size - 1) : 0;
    const msg = await message.channel.send(`✅ ${count} message(s) supprimé(s).`);
    setTimeout(() => msg.delete().catch(() => {}), 3000);
  }
};
