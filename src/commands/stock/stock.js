import * as cheerio from 'cheerio';
import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../../utils/database.js';

const TARGET_URL = process.env.STOCK_MONITOR_URL || 'https://lusive.xyz/';
const OOS_PATTERNS = /out\s*of\s*stock|sold\s*out|rupture|indisponible|épuisé|stock\s*épuisé/i;
const IN_STOCK_PATTERNS = /in\s*stock|en\s*stock|disponible|add\s*to\s*cart|ajouter|buy|acheter/i;

async function fetchPage() {
  try {
    const res = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractAllStock(html) {
  const inStock = [];
  const outOfStock = [];
  const seen = new Set();

  const $ = cheerio.load(html);

  if ($('body').text().includes('Checking your browser') || $('body').text().includes('DDos protection')) {
    return { inStock: [], outOfStock: [] };
  }

  const productSelectors = '.product, .product-card, .product-item, .item, article[class*="product"], [data-product], [class*="product-card"]';

  $(productSelectors).each((_, el) => {
    const $el = $(el);
    const text = $el.text();
    const $title = $el.find('h1, h2, h3, .title, .product-title, .name, [class*="title"], [class*="name"]').first();
    let name = $title.text().trim().slice(0, 80) || text.slice(0, 80).trim().split('\n')[0];
    if (!name || name.length < 2) return;

    const id = name.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
    if (seen.has(id)) return;
    seen.add(id);

    const isOOS = OOS_PATTERNS.test(text);
    const isInStock = IN_STOCK_PATTERNS.test(text) && !isOOS;

    if (isOOS) {
      outOfStock.push({ name });
    } else if (isInStock) {
      inStock.push({ name });
    }
  });

  if (inStock.length === 0 && outOfStock.length === 0) {
    $('*').each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (!OOS_PATTERNS.test(text)) return;

      let name = null;
      const $parent = $el.closest('[class*="product"], [class*="item"], [class*="card"], article');
      if ($parent.length) {
        const $t = $parent.find('h1, h2, h3, .title, .product-title, .name').first();
        name = $t.text().trim().slice(0, 80);
      }
      if (!name) {
        const m = text.match(/^(.{1,60})/);
        name = (m ? m[1] : 'Produit').trim();
      }
      const id = (name || 'x').toLowerCase().replace(/\s+/g, '-');
      if (name && name.length > 1 && !seen.has(id)) {
        seen.add(id);
        outOfStock.push({ name });
      }
    });
  }

  return { inStock, outOfStock };
}

export default {
  name: 'stock',
  aliases: ['stocklist', 'items', 'liststock'],
  description: 'Afficher le stock de tous les items',
  usage: '+stock',
  async execute(message, args, client) {
    try {
      const config = await getGuildConfig(message.guild.id);
      const shop = config.shop || {};

      const loading = await message.channel.send('⏳ Vérification du stock en cours...');

      const html = await fetchPage();
      if (!html) {
        await loading.edit('❌ Impossible de récupérer les données. Le site est peut-être inaccessible ou protégé (DDoS/captcha).');
        return;
      }

      const isBlocked = html.includes('Checking your browser') || html.includes('DDos protection');
      const { inStock, outOfStock } = extractAllStock(html);

      if (isBlocked || (inStock.length === 0 && outOfStock.length === 0)) {
        await loading.edit(
          '**📦 Stock des items**\n\n' +
          '❌ Le site renvoie une page de vérification (protection anti-bot) ou aucun produit n\'a été détecté.\n\n' +
          '_Pour que +stock fonctionne, le site doit être accessible sans captcha. Essaye une autre URL avec STOCK_MONITOR_URL dans .env si tu en as une._'
        );
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(shop.color ?? 0x5865f2)
        .setTitle('📦 Stock des items')
        .setDescription('Résultat de la vérification')
        .setFooter({ text: shop.name || 'Stock' })
        .setTimestamp();

      if (outOfStock.length > 0) {
        embed.addFields({
          name: `❌ Rupture (${outOfStock.length})`,
          value: outOfStock.map((p) => `• ${p.name}`).join('\n').slice(0, 1024)
        });
      }
      if (inStock.length > 0) {
        embed.addFields({
          name: `✅ En stock (${inStock.length})`,
          value: inStock.map((p) => `• ${p.name}`).join('\n').slice(0, 1024)
        });
      }

      await loading.edit({ content: null, embeds: [embed] });
    } catch (e) {
      console.error('+stock error:', e);
      await message.channel.send('❌ Erreur lors de la vérification du stock: ' + e.message).catch(() => {});
    }
  }
};
