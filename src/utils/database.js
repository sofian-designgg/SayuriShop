/**
 * Base de données MongoDB (Railway) pour la config du serveur
 * Connexion via MONGO_URL
 */
import mongoose from 'mongoose';

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  shop: {
    name: { type: String, default: 'Sayuri Shop' },
    color: { type: Number, default: 0x5865F2 },
    status: { type: String, default: 'Ouvert 24/7' },
    logo: { type: String, default: null },
    description: { type: String, default: null }
  },
  tickets: {
    categoryId: { type: String, default: null },
    channelId: { type: String, default: null },
    transcriptChannelId: { type: String, default: null },
    supportRoles: [{ type: String }],
    maxTickets: { type: Number, default: 3 }
  },
  moderation: {
    logChannelId: { type: String, default: null },
    muteRoleId: { type: String, default: null }
  },
  announce: {
    channelId: { type: String, default: null }
  },
  giveaway: {
    channelId: { type: String, default: null },
    hostRole: { type: String, default: null }
  },
  stockMonitor: {
    channelId: { type: String, default: null },
    enabled: { type: Boolean, default: false },
    lastOOS: { type: [String], default: [] }
  },
  warns: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { strict: false });

const giveawaySchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
  hostId: { type: String, required: true },
  prize: { type: String, required: true },
  endAt: { type: Date, required: true },
  winners: { type: Number, default: 1 },
  participants: [{ type: String }],
  ended: { type: Boolean, default: false }
});
const Giveaway = mongoose.models.Giveaway || mongoose.model('Giveaway', giveawaySchema);

const GuildConfig = mongoose.models.GuildConfig || mongoose.model('GuildConfig', guildConfigSchema);

export { Giveaway };

export async function connectDB() {
  const uri = process.env.MONGO_URL;
  if (!uri || typeof uri !== 'string') {
    throw new Error('MONGO_URL manquant dans .env');
  }
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB déconnecté'));
}

function getDefaultConfig() {
  return {
    shop: { name: 'Sayuri Shop', color: 0x5865F2, status: 'Ouvert 24/7', logo: null, description: null },
    tickets: { categoryId: null, channelId: null, transcriptChannelId: null, supportRoles: [], maxTickets: 3 },
    moderation: { logChannelId: null, muteRoleId: null },
    announce: { channelId: null },
    giveaway: { channelId: null, hostRole: null },
    stockMonitor: { channelId: null, enabled: false, lastOOS: [] },
    warns: {}
  };
}

export async function getGuildConfig(guildId) {
  const doc = await GuildConfig.findOne({ guildId }).lean();
  if (!doc) return getDefaultConfig();
  const c = doc;
  return {
    shop: { ...getDefaultConfig().shop, ...(c.shop || {}) },
    tickets: { ...getDefaultConfig().tickets, ...(c.tickets || {}) },
    moderation: { ...getDefaultConfig().moderation, ...(c.moderation || {}) },
    announce: { ...getDefaultConfig().announce, ...(c.announce || {}) },
    giveaway: { ...getDefaultConfig().giveaway, ...(c.giveaway || {}) },
    stockMonitor: { ...getDefaultConfig().stockMonitor, ...(c.stockMonitor || {}) },
    warns: c.warns ? (c.warns instanceof Map ? Object.fromEntries(c.warns) : c.warns) : {}
  };
}

export async function setGuildConfig(guildId, updates) {
  const current = await getGuildConfig(guildId);
  const merged = deepMerge(current, updates);
  await GuildConfig.findOneAndUpdate(
    { guildId },
    { $set: merged },
    { upsert: true, new: true }
  );
  return merged;
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const k of Object.keys(source)) {
    if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k]) && source[k].constructor === Object) {
      out[k] = deepMerge(out[k] || {}, source[k]);
    } else {
      out[k] = source[k];
    }
  }
  return out;
}

export async function addWarn(guildId, userId, moderatorId, reason) {
  const config = await getGuildConfig(guildId);
  const warns = config.warns || {};
  const list = warns[userId] || [];
  list.push({ moderator: moderatorId, reason, date: Date.now() });
  warns[userId] = list;
  await setGuildConfig(guildId, { warns });
  return list.length;
}

export async function getWarns(guildId, userId) {
  const config = await getGuildConfig(guildId);
  return (config.warns || {})[userId] || [];
}

export async function clearWarns(guildId, userId) {
  const config = await getGuildConfig(guildId);
  const warns = { ...(config.warns || {}) };
  delete warns[userId];
  await setGuildConfig(guildId, { warns });
}

export async function saveGiveaway(data) {
  const g = new Giveaway(data);
  await g.save();
  return g;
}

export async function getGiveawayByMessage(messageId) {
  return Giveaway.findOne({ messageId, ended: false }).lean();
}

export async function getGiveawaysByGuild(guildId) {
  return Giveaway.find({ guildId, ended: false }).lean();
}

export async function endGiveaway(messageId, updates) {
  return Giveaway.findOneAndUpdate({ messageId }, { $set: { ...updates, ended: true } }, { new: true }).lean();
}

export async function addParticipant(messageId, userId) {
  return Giveaway.findOneAndUpdate(
    { messageId },
    { $addToSet: { participants: userId } },
    { new: true }
  ).lean();
}

export async function removeParticipant(messageId, userId) {
  return Giveaway.findOneAndUpdate(
    { messageId },
    { $pull: { participants: userId } },
    { new: true }
  ).lean();
}

export async function getEndedGiveaway(messageId) {
  return Giveaway.findOne({ messageId, ended: true }).lean();
}

export async function getGuildsWithStockMonitor() {
  const docs = await GuildConfig.find({
    'stockMonitor.enabled': true,
    'stockMonitor.channelId': { $ne: null }
  }).lean();
  return docs;
}

export async function updateStockLastOOS(guildId, productIds) {
  await GuildConfig.findOneAndUpdate(
    { guildId },
    { $set: { 'stockMonitor.lastOOS': productIds } },
    { upsert: false }
  );
}
