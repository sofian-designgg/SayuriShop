/**
 * Moniteur de stock - surveille une URL et alerte quand des produits sont "out of stock"
 * Ne mentionne jamais le nom du site dans les alertes
 */
import * as cheerio from 'cheerio';
import { EmbedBuilder } from 'discord.js';
import { getGuildConfig, getGuildsWithStockMonitor, updateStockLastOOS } from '../utils/database.js';

const TARGET_URL = process.env.STOCK_MONITOR_URL || 'https://lusive.xyz/';
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const OOS_PATTERNS = /out\s*of\s*stock|sold\s*out|rupture|indisponible|épuisé|stock\s*épuisé/i;

async function fetchPage() {
  try {
    const res = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

function extractOOSProducts(html) {
  const products = [];
  const $ = cheerio.load(html);

  // Ignore la page de vérification DDoS
  if ($('body').text().includes('Checking your browser') || $('body').text().includes('DDos protection')) {
    return [];
  }

  // Chercher les éléments contenant "out of stock" ou variantes
  $('*').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (!OOS_PATTERNS.test(text)) return;

    // Essayer d'extraire le nom du produit (parent avec titre, ou texte avant "out of stock")
    let productName = null;
    const $parent = $el.closest('[class*="product"], [class*="item"], [class*="card"], article, .product-card');
    if ($parent.length) {
      const $title = $parent.find('h1, h2, h3, .title, .product-title, .name, [class*="title"], [class*="name"]').first();
      if ($title.length) productName = $title.text().trim().slice(0, 100);
    }
    if (!productName) {
      const match = text.match(/^(.{1,80})[\s\S]*?(?:out\s*of\s*stock|sold\s*out|rupture)/i);
      productName = match ? match[1].trim().slice(0, 80) : 'Produit';
    }
    if (productName && productName.length > 2) {
      const id = productName.toLowerCase().replace(/\s+/g, '-');
      if (!products.some((p) => p.id === id)) {
        products.push({ id, name: productName });
      }
    }
  });

  // Fallback: regex sur le HTML brut si cheerio ne trouve rien de structuré
  if (products.length === 0) {
    const matches = html.matchAll(/<[^>]*>([^<]*(?:out\s*of\s*stock|sold\s*out|rupture|indisponible)[^<]*)</gi);
    for (const m of matches) {
      const chunk = m[1].replace(/(?:out\s*of\s*stock|sold\s*out|rupture|indisponible)/gi, '').trim().slice(0, 80);
      if (chunk.length > 2) {
        const id = chunk.toLowerCase().replace(/\s+/g, '-');
        if (!products.some((p) => p.id === id)) {
          products.push({ id, name: chunk || 'Produit' });
        }
      }
    }
  }

  return products;
}

export function startStockMonitor(client) {
  let running = false;

  async function check() {
    if (running || !client.isReady()) return;
    running = true;

    try {
      const html = await fetchPage();
      if (!html) {
        running = false;
        return;
      }

      const oosProducts = extractOOSProducts(html);
      if (oosProducts.length === 0) {
        running = false;
        return;
      }

      const guilds = await getGuildsWithStockMonitor();
      for (const g of guilds) {
        const channel = client.channels.cache.get(g.stockMonitor?.channelId);
        if (!channel) continue;

        const lastOOS = g.stockMonitor?.lastOOS || [];
        const newOOS = oosProducts.filter((p) => !lastOOS.includes(p.id));

        if (newOOS.length === 0) continue;

        const config = await getGuildConfig(g.guildId);
        const shop = config.shop || {};
        const embed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('⚠️ Rupture de stock')
          .setDescription(
            newOOS.map((p) => `• **${p.name}**`).join('\n')
          )
          .setFooter({ text: shop.name || 'Stock' })
          .setTimestamp();

        try {
          await channel.send({ embeds: [embed] });
          await updateStockLastOOS(g.guildId, oosProducts.map((p) => p.id));
        } catch (err) {
          console.error('Stock alert send error:', err.message);
        }
      }
    } catch (e) {
      console.error('Stock monitor:', e.message);
    }
    running = false;
  }

  setInterval(check, INTERVAL_MS);
  setTimeout(check, 10000); // Premier check après 10s
  console.log('✓ Moniteur de stock actif (intervalle 5 min)');
}
