/**
 * Sayuri Shop Bot - Prefix +
 * MongoDB Railway | Modération | Tickets | Embeds | Annonces | DM All | Giveaways
 */
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import { startStockMonitor } from './services/stockMonitor.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PREFIX = '+';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.commands = new Collection();
client.prefix = PREFIX;

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
    return;
  }
  const cats = fs.readdirSync(commandsPath);
  for (const cat of cats) {
    const catPath = path.join(commandsPath, cat);
    const stat = fs.statSync(catPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(catPath).filter((f) => f.endsWith('.js'));
      for (const f of files) {
        try {
          const mod = await import(`file://${path.join(catPath, f).replace(/\\/g, '/')}`);
          const cmd = mod.default || mod;
          if (cmd && cmd.name && typeof cmd.execute === 'function') {
            client.commands.set(cmd.name, cmd);
            if (cmd.aliases && Array.isArray(cmd.aliases)) {
              for (const a of cmd.aliases) client.commands.set(a, cmd);
            }
          }
        } catch (e) {
          console.error(`Erreur chargement ${cat}/${f}:`, e.message);
        }
      }
    } else if (cat.endsWith('.js')) {
      try {
        const mod = await import(`file://${path.join(commandsPath, cat).replace(/\\/g, '/')}`);
        const cmd = mod.default || mod;
        if (cmd && cmd.name && typeof cmd.execute === 'function') {
          client.commands.set(cmd.name, cmd);
          if (cmd.aliases) for (const a of cmd.aliases) client.commands.set(a, cmd);
        }
      } catch (e) {
        console.error(`Erreur chargement ${cat}:`, e.message);
      }
    }
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const parts = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmdName = (parts[0] || '').toLowerCase();
  const args = parts.slice(1);

  const cmd = client.commands.get(cmdName);
  if (!cmd) return;

  try {
    await cmd.execute(message, args, client);
  } catch (e) {
    console.error(`Commande ${cmdName}:`, e);
    await message.channel.send('❌ Une erreur est survenue.').catch(() => {});
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    try {
      if (interaction.customId === 'ticket_create') {
        const { default: ticketHandler } = await import('./handlers/ticket.js');
        await ticketHandler.create(interaction);
      } else if (interaction.customId.startsWith('ticket_close_')) {
        const { default: ticketHandler } = await import('./handlers/ticket.js');
        await ticketHandler.close(interaction);
      } else if (interaction.customId.startsWith('giveaway_join_')) {
        const { default: gwHandler } = await import('./handlers/giveaway.js');
        await gwHandler.join(interaction);
      }
    } catch (e) {
      console.error('Button handler:', e);
    }
  }
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
    try {
      const { default: ticketHandler } = await import('./handlers/ticket.js');
      await ticketHandler.selectCategory(interaction);
    } catch (e) {
      console.error('Select handler:', e);
    }
  }
});

client.once('ready', async () => {
  await loadCommands();
  console.log(`✓ ${client.user.tag} | Préfixe: ${PREFIX} | ${client.commands.size} commandes`);
  startStockMonitor(client);
});

async function start() {
  try {
    await connectDB();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (e) {
    console.error('Démarrage:', e.message);
    process.exit(1);
  }
}

start();
