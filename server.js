/**
 * Don Café — Full-Stack Server
 * Works on Node.js 14+ — zero npm dependencies
 * Data stored in doncafe-data.json
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT     = process.env.PORT || 3000;
const LOCAL_IP = process.env.HOST_IP || 'localhost';
const DATA_FILE = path.join(__dirname, 'doncafe-data.json');
const JWT_SECRET = 'doncafe-secret-key-change-in-production';
const FRONT    = path.join(__dirname, 'frontend', 'public');

// ─── DATA STORE (JSON file, acts as DB) ────────────────────────────────────
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return null; }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function initData() {
  const hash = crypto.createHash('sha256').update('doncafe2025').digest('hex');
  return {
    _nextId: { categories: 10, items: 100 },
    admins: [{ id: 1, username: 'admin', password_hash: hash }],
    settings: {
      cafe_name: 'Don Café',
      cafe_tagline: "L'art du café, le goût de chez nous",
      cafe_address: 'Tunis, Tunisie',
      cafe_phone: '+216 71 000 000'
    },
    categories: [
      { id: 1, name: 'Hot Drinks',    name_fr: 'Boissons Chaudes',       icon: '☕', sort_order: 1 },
      { id: 2, name: 'Cold Drinks',   name_fr: 'Boissons Froides',       icon: '🧊', sort_order: 2 },
      { id: 3, name: 'Breakfast',     name_fr: 'Petit-Déjeuner',         icon: '🥐', sort_order: 3 },
      { id: 4, name: 'Tunisian Food', name_fr: 'Spécialités Tunisiennes', icon: '🍽', sort_order: 4 },
      { id: 5, name: 'Desserts',      name_fr: 'Desserts',               icon: '🍰', sort_order: 5 }
    ],
    items: [
      // Hot Drinks
      { id:1,  category_id:1, name:'Espresso',               name_fr:'Espresso',           name_ar:'إسبريسو',      description:'Shot pur, corsé & intense',                           price:3.5,  badge:'Popular',   available:1, sort_order:1 },
      { id:2,  category_id:1, name:'Café Express',            name_fr:'Café Express',       name_ar:'كافيه إكسبريس', description:'Espresso allongé, eau chaude',                         price:4.0,  badge:null,        available:1, sort_order:2 },
      { id:3,  category_id:1, name:'Cappuccino',              name_fr:'Cappuccino',         name_ar:'كابتشينو',     description:'Espresso, lait vapeur & mousse veloutée',             price:6.5,  badge:'Popular',   available:1, sort_order:3 },
      { id:4,  category_id:1, name:'Latte',                   name_fr:'Latte',              name_ar:'لاتيه',        description:'Espresso doux noyé dans le lait crémeux',             price:7.0,  badge:null,        available:1, sort_order:4 },
      { id:5,  category_id:1, name:'Turkish Coffee',          name_fr:'Café Turc',          name_ar:'قهوة تركية',   description:'Préparé à la turque, servi à l\'orientale',           price:4.5,  badge:null,        available:1, sort_order:5 },
      { id:6,  category_id:1, name:'Hot Chocolate',           name_fr:'Chocolat Chaud',     name_ar:'شوكولاتة ساخنة', description:'Chocolat noir onctueux, légèrement sucré',           price:7.5,  badge:null,        available:1, sort_order:6 },
      { id:7,  category_id:1, name:'Mint Tea',                name_fr:'Thé à la Menthe',    name_ar:'أتاي بالنعناع', description:'Thé vert, menthe fraîche & sucre',                    price:4.0,  badge:null,        available:1, sort_order:7 },
      // Cold Drinks
      { id:8,  category_id:2, name:'Iced Coffee',             name_fr:'Café Glacé',         name_ar:'كافيه بارد',   description:'Espresso refroidi sur glaçons',                       price:7.0,  badge:null,        available:1, sort_order:1 },
      { id:9,  category_id:2, name:'Iced Latte',              name_fr:'Latte Glacé',        name_ar:'لاتيه بارد',   description:'Latte glacé, doux & rafraîchissant',                  price:8.5,  badge:'Popular',   available:1, sort_order:2 },
      { id:10, category_id:2, name:'Fresh Orange Juice',      name_fr:"Jus d'Orange Frais", name_ar:'عصير برتقال طازج', description:"100% oranges pressées du jour",                    price:6.5,  badge:null,        available:1, sort_order:3 },
      { id:11, category_id:2, name:'Lemon Mint Juice',        name_fr:'Citronnade Menthe',  name_ar:'عصير ليمون بالنعناع', description:'Citron, menthe fraîche & eau pétillante',        price:6.0,  badge:null,        available:1, sort_order:4 },
      { id:12, category_id:2, name:'Soda',                    name_fr:'Soda',               name_ar:'صودا',         description:'Coca-Cola, Sprite, Boga — au choix',                  price:4.0,  badge:null,        available:1, sort_order:5 },
      // Breakfast
      { id:13, category_id:3, name:'Croissant',               name_fr:'Croissant',          name_ar:'كروسان',       description:'Beurré, feuilleté & doré au four',                    price:3.5,  badge:null,        available:1, sort_order:1 },
      { id:14, category_id:3, name:'Baguette Butter & Jam',   name_fr:'Baguette Beurre & Confiture', name_ar:'باقيت بالزبدة والمربى', description:'Baguette croustillante, beurre, confiture maison', price:5.5, badge:null, available:1, sort_order:2 },
      { id:15, category_id:3, name:'Omelette',                name_fr:'Omelette',           name_ar:'أوملات',       description:'Oeufs frais, herbes, fromage fondu',                  price:8.0,  badge:null,        available:1, sort_order:3 },
      { id:16, category_id:3, name:'Tunisian Breakfast Plate',name_fr:'Petit-Déj Tunisien', name_ar:'فطور تونسي',   description:'Oeuf, fromage, olive, beurre, pain maison, citron confit', price:14.0, badge:'Maison', available:1, sort_order:4 },
      // Tunisian Food
      { id:17, category_id:4, name:'Lablabi',                 name_fr:'Lablabi',            name_ar:'لبلابي',       description:'Pois chiches, pain rassis, harissa, cumin & oeuf',    price:12.0, badge:'Signature', available:1, sort_order:1 },
      { id:18, category_id:4, name:'Shakshouka',              name_fr:'Chakchouka',         name_ar:'شكشوكة',       description:'Tomates, poivrons, oeufs pochés, épices du terroir',  price:10.0, badge:null,        available:1, sort_order:2 },
      { id:19, category_id:4, name:'Ojja',                    name_fr:'Ojja',               name_ar:'عجة',          description:'Merguez, oeufs, sauce tomate pimentée',               price:13.0, badge:null,        available:1, sort_order:3 },
      { id:20, category_id:4, name:'Sandwich Escalope',       name_fr:'Sandwich Escalope',  name_ar:'ساندويتش إسكالوب', description:'Escalope panée, fromage fondu, frites, sauce Don', price:14.0, badge:null,        available:1, sort_order:4 },
      { id:21, category_id:4, name:'Chapati Mahdia',          name_fr:'Chapati Mahdia',     name_ar:'شاباتي المهدية', description:'Chapati moelleux garni, façon mahdoise',             price:13.0, badge:'Spécial',   available:1, sort_order:5 },
      // Desserts
      { id:22, category_id:5, name:'Mille-feuille',           name_fr:'Mille-Feuille',      name_ar:'ميل فوي',      description:'Feuilletage caramélisé, crème pâtissière vanille',    price:9.0,  badge:'Popular',   available:1, sort_order:1 },
      { id:23, category_id:5, name:'Tiramisu',                name_fr:'Tiramisu',           name_ar:'تيراميسو',     description:'Mascarpone léger, biscuits imbibés, cacao',           price:10.5, badge:null,        available:1, sort_order:2 },
      { id:24, category_id:5, name:'Chocolate Cake',          name_fr:'Gâteau au Chocolat', name_ar:'كيك الشوكولاتة', description:'Fondant coeur coulant, ganache intense',             price:9.5,  badge:null,        available:1, sort_order:3 },
      { id:25, category_id:5, name:'Bambalouni',              name_fr:'Bambalouni',         name_ar:'بمبالوني',     description:'Beignet tunisien frit, sucre glace & miel',           price:5.5,  badge:null,        available:1, sort_order:4 }
    ]
  };
}

let DB = loadData() || initData();
if (!loadData()) saveData(DB);

// Auto-increment helper
function nextId(table) {
  DB._nextId[table] = (DB._nextId[table] || 1) + 1;
  return DB._nextId[table];
}

// ─── JWT ───────────────────────────────────────────────────────────────────
function signJWT(payload) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const b = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 3600000 })).toString('base64url');
  const s = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest('base64url');
  return `${h}.${b}.${s}`;
}

function verifyJWT(token) {
  try {
    const [h, b, s] = (token || '').split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest('base64url');
    if (s !== expected) return null;
    const p = JSON.parse(Buffer.from(b, 'base64url').toString());
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}

// ─── QR CODE GENERATOR (pure JS, no deps) ─────────────────────────────────
function generateQRSVG(text) {
  const bytes = Buffer.from(text, 'utf8');
  const len   = bytes.length;

  // Pick version
  const caps = [17,32,53,78,106,134,154,192,230,271,321,367,425,458,520,586,644,718,792,858];
  let version = 10;
  for (let v = 0; v < caps.length; v++) { if (len <= caps[v]) { version = v + 1; break; } }

  const size = version * 4 + 17;
  const M = Array.from({ length: size }, () => new Array(size).fill(null));

  // Finder pattern
  function finder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const ri = row + r, ci = col + c;
        if (ri < 0 || ri >= size || ci < 0 || ci >= size) continue;
        const dark = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        M[ri][ci] = (r === -1 || r === 7 || c === -1 || c === 7) ? 0 : (dark ? 1 : 0);
      }
    }
  }
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

  // Timing
  for (let i = 8; i < size - 8; i++) {
    if (M[6][i] === null) M[6][i] = i % 2 === 0 ? 1 : 0;
    if (M[i][6] === null) M[i][6] = i % 2 === 0 ? 1 : 0;
  }
  M[size - 8][8] = 1; // dark module

  // Alignment patterns
  const alignTbl = { 2:[18],3:[22],4:[26],5:[30],6:[34],7:[22,38],8:[24,42],9:[26,46],10:[28,50] };
  const apos = alignTbl[version] || [];
  const allApos = version >= 2 ? [6, ...apos] : [];
  for (const r of allApos) {
    for (const c of allApos) {
      if ((r === 6 && c === 6) || (r === 6 && c === apos[apos.length-1]) || (c === 6 && r === apos[apos.length-1])) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        if (r+dr<0||r+dr>=size||c+dc<0||c+dc>=size||M[r+dr][c+dc]!==null) continue;
        M[r+dr][c+dc] = (Math.abs(dr)===2||Math.abs(dc)===2||dr===0&&dc===0) ? 1 : 0;
      }
    }
  }

  // Format placeholders
  const fp1 = [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]];
  const fp2 = Array.from({length:7},(_,i)=>[size-1-i,8]).concat(Array.from({length:8},(_,i)=>[8,size-8+i]));
  [...fp1,...fp2].forEach(([r,c]) => { if (M[r][c]===null) M[r][c] = 0; });

  // Data bits
  const bits = [];
  bits.push(0,1,0,0); // byte mode
  for (let i = 7; i >= 0; i--) bits.push((len >> i) & 1);
  for (const byte of bytes) for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  for (let i = 0; i < 4 && bits.length < 9999; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const totalBits = [72,128,208,288,368,480,528,688,800,976][version-1] || 976;
  let pi = 0;
  while (bits.length < totalBits) { const pb = pi++ % 2 === 0 ? 0xEC : 0x11; for (let i=7;i>=0;i--) bits.push((pb>>i)&1); }

  // Place bits (zigzag, mask 0)
  let bi = 0, up = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    const cols = [col, col - 1];
    const rows = up ? Array.from({length:size},(_,i)=>size-1-i) : Array.from({length:size},(_,i)=>i);
    for (const row of rows) for (const c of cols) {
      if (M[row][c] === null) {
        const bit = bi < bits.length ? bits[bi++] : 0;
        M[row][c] = ((row + c) % 2 === 0) ? bit ^ 1 : bit;
      }
    }
    up = !up;
  }

  // Format info (mask 0, ECC M)
  const fmt = '101010000010010';
  fp1.forEach(([r,c],i) => { if (i<fmt.length) M[r][c] = parseInt(fmt[i]); });
  fp2.forEach(([r,c],i) => { if (i<fmt.length) M[r][c] = parseInt(fmt[i]); });

  // Fill nulls
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) if (M[r][c]===null) M[r][c]=0;

  // Render SVG
  const PX = 4, QUIET = 4 * PX;
  const total = size * PX + QUIET * 2;
  let rects = '';
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
    if (M[r][c]===1) rects += `<rect x="${c*PX+QUIET}" y="${r*PX+QUIET}" width="${PX}" height="${PX}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}"><rect width="${total}" height="${total}" fill="#fff"/><g fill="#1a0a00">${rects}</g></svg>`;
}

// ─── REQUEST HELPERS ───────────────────────────────────────────────────────
function readBody(req) {
  return new Promise(resolve => {
    const chunks = [];
    req.on('data', d => chunks.push(d));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { resolve({}); }
    });
  });
}

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function auth(req) {
  return verifyJWT((req.headers['authorization'] || '').replace('Bearer ', ''));
}

// ─── ROUTE HANDLER ─────────────────────────────────────────────────────────
async function handleRequest(req, res) {
  const method = req.method;
  const url    = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p      = url.pathname.replace(/\/$/, '') || '/';

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    return res.end();
  }

  // ── PUBLIC API ──────────────────────────────────────────────────────────
  if (p === '/api/menu' && method === 'GET') {
    const categories = [...DB.categories].sort((a,b) => a.sort_order - b.sort_order);
    const items      = DB.items.filter(i => i.available).sort((a,b) => a.sort_order - b.sort_order);
    return json(res, 200, { categories, items, settings: DB.settings });
  }

  if (p === '/api/qr' && method === 'GET') {
    const menuUrl = 'https://doncafe-production.up.railway.app/';
    const svg = generateQRSVG(menuUrl);
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Access-Control-Allow-Origin': '*' });
    return res.end(svg);
  }

  // ── AUTH ────────────────────────────────────────────────────────────────
  if (p === '/api/auth/login' && method === 'POST') {
    const { username, password } = await readBody(req);
    const hash = crypto.createHash('sha256').update(password || '').digest('hex');
    const admin = DB.admins.find(a => a.username === username && a.password_hash === hash);
    if (!admin) return json(res, 401, { error: 'Invalid credentials' });
    return json(res, 200, { token: signJWT({ id: admin.id, username: admin.username }), username: admin.username });
  }

  // ── ADMIN API ────────────────────────────────────────────────────────────
  if (p.startsWith('/api/admin')) {
    const user = auth(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    const body = ['POST','PUT'].includes(method) ? await readBody(req) : {};
    const idMatch = p.match(/\/(\d+)$/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    // Categories
    if (p === '/api/admin/categories') {
      if (method === 'GET') return json(res, 200, [...DB.categories].sort((a,b)=>a.sort_order-b.sort_order));
      if (method === 'POST') {
        const cat = { id: nextId('categories'), name: body.name, name_fr: body.name_fr||'', icon: body.icon||'🍽', sort_order: body.sort_order||0 };
        DB.categories.push(cat); saveData(DB);
        return json(res, 201, { id: cat.id });
      }
    }
    if (p.match(/^\/api\/admin\/categories\/\d+$/)) {
      if (method === 'PUT') {
        const i = DB.categories.findIndex(c=>c.id===id);
        if (i>=0) { DB.categories[i] = {...DB.categories[i], name:body.name, name_fr:body.name_fr||'', icon:body.icon||'🍽', sort_order:body.sort_order||0}; saveData(DB); }
        return json(res, 200, { ok: true });
      }
      if (method === 'DELETE') {
        DB.items = DB.items.filter(it=>it.category_id!==id);
        DB.categories = DB.categories.filter(c=>c.id!==id);
        saveData(DB);
        return json(res, 200, { ok: true });
      }
    }

    // Items
    if (p === '/api/admin/items') {
      if (method === 'GET') return json(res, 200, [...DB.items].sort((a,b)=>a.category_id-b.category_id||a.sort_order-b.sort_order));
      if (method === 'POST') {
        const item = {
          id: nextId('items'), category_id: body.category_id, name: body.name,
          name_fr: body.name_fr||'', name_ar: body.name_ar||'', description: body.description||'',
          price: body.price||0, badge: body.badge||null, available: body.available??1, sort_order: body.sort_order||0
        };
        DB.items.push(item); saveData(DB);
        return json(res, 201, { id: item.id });
      }
    }
    if (p.match(/^\/api\/admin\/items\/\d+$/)) {
      if (method === 'PUT') {
        const i = DB.items.findIndex(it=>it.id===id);
        if (i>=0) {
          DB.items[i] = { id, category_id:body.category_id, name:body.name, name_fr:body.name_fr||'',
            name_ar:body.name_ar||'', description:body.description||'', price:body.price||0,
            badge:body.badge||null, available:body.available??1, sort_order:body.sort_order||0 };
          saveData(DB);
        }
        return json(res, 200, { ok: true });
      }
      if (method === 'DELETE') {
        DB.items = DB.items.filter(it=>it.id!==id); saveData(DB);
        return json(res, 200, { ok: true });
      }
    }

    // Settings
    if (p === '/api/admin/settings') {
      if (method === 'GET') return json(res, 200, DB.settings);
      if (method === 'PUT') { Object.assign(DB.settings, body); saveData(DB); return json(res, 200, { ok: true }); }
    }

    // Change password
    if (p === '/api/admin/change-password' && method === 'POST') {
      const hash = crypto.createHash('sha256').update(body.password||'').digest('hex');
      const i = DB.admins.findIndex(a=>a.id===user.id);
      if (i>=0) { DB.admins[i].password_hash = hash; saveData(DB); }
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: 'Not found' });
  }

  // ── STATIC FILES ─────────────────────────────────────────────────────────
  const MIME = { '.html':'text/html;charset=utf-8', '.css':'text/css', '.js':'application/javascript', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.json':'application/json' };
  let file;
  if (p === '/' || p === '/menu') file = path.join(FRONT, 'index.html');
  else if (p === '/admin')         file = path.join(FRONT, 'admin.html');
  else                             file = path.join(FRONT, p);

  // Security: prevent path traversal
  if (!file.startsWith(FRONT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('404 – Not Found'); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain', 'Content-Length': data.length });
    res.end(data);
  });
}

// ─── START ──────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  handleRequest(req, res).catch(err => {
    console.error('Request error:', err);
    if (!res.headersSent) { res.writeHead(500); res.end('Internal Server Error'); }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ☕  Don Café is running!');
  console.log('  ─────────────────────────────────────────');
  console.log(`  🍽  Menu  →  http://localhost:${PORT}/`);
  console.log(`  📲  Phone →  http://${LOCAL_IP}:${PORT}/`);
  console.log(`  🔧  Admin →  http://localhost:${PORT}/admin`);
  console.log(`  📱  QR    →  http://localhost:${PORT}/api/qr`);
  console.log('  ─────────────────────────────────────────');
  console.log('  Login: admin / doncafe2025');
  console.log('');
});
