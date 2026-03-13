/**
 * DM All - Envoie un message à tous les membres
 * Rate limit: 1 DM toutes les 2 secondes pour éviter la quarantaine Discord
 */
import { getGuildConfig } from '../../utils/database.js';

const COOLDOWN_MS = 2200;
const MAX_PER_RUN = 50;

export default {
  name: 'dmall',
  aliases: ['mpall', 'dmsend'],
  description: 'Envoyer un DM à tous les membres (rate limit pour éviter la quarantaine)',
  usage: '+dmall <message>',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send('❌ Tu dois être administrateur.');
    }
    const text = args.join(' ');
    if (!text) {
      return message.channel.send('❌ Usage: `+dmall Ton message ici`');
    }
    await message.guild.members.fetch().catch(() => {});
    const members = message.guild.members.cache.filter((m) => !m.user.bot && m.user.id !== message.author.id);
    const arr = [...members.values()];
    const toSend = arr.slice(0, MAX_PER_RUN);

    const statusMsg = await message.channel.send(`⏳ Envoi en cours (${toSend.length} membres, ~${Math.ceil(toSend.length * COOLDOWN_MS / 1000)}s)...`);

    let ok = 0;
    let fail = 0;
    for (let i = 0; i < toSend.length; i++) {
      try {
        await toSend[i].send(text);
        ok++;
      } catch {
        fail++;
      }
      if (i < toSend.length - 1) {
        await new Promise((r) => setTimeout(r, COOLDOWN_MS));
      }
    }

    await statusMsg.edit(`✅ Envoi terminé. Succès: ${ok}, Échecs (DM fermés): ${fail}. Si plus de membres, relance la commande.`);
  }
};
