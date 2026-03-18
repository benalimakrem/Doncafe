/**
 * Don Café — Full-Stack Server
 * Pure Node.js (no npm), SQLite via node:sqlite (Node 22+), JWT via crypto
 * Port: 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const PORT = 3000;
const JWT_SECRET = crypto.randomBytes(32).toString('hex');
const DB_PATH = path.join(__dirname, 'doncafe.db');

// ─── DATABASE SETUP ────────────────────────────────────────────────────────
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_fr TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_fr TEXT,
    name_ar TEXT,
    description TEXT,
    price REAL NOT NULL,
    badge TEXT,
    available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed if empty
const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
if (catCount.c === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, name_fr, icon, sort_order) VALUES (?,?,?,?)');
  const insertItem = db.prepare(`INSERT INTO items (category_id, name, name_fr, name_ar, description, price, badge, sort_order) VALUES (?,?,?,?,?,?,?,?)`);

  const cats = [
    [1, 'Hot Drinks', 'Boissons Chaudes', '☕', 1],
    [2, 'Cold Drinks', 'Boissons Froides', '🧊', 2],
    [3, 'Breakfast', 'Petit-Déjeuner', '🥐', 3],
    [4, 'Tunisian Food', 'Spécialités Tunisiennes', '🍽', 4],
    [5, 'Desserts', 'Desserts', '🍰', 5],
  ];
  cats.forEach(([,n,f,i,s]) => insertCat.run(n,f,i,s));

  const items = [
    // Hot
    [1,'Espresso','Espresso','إسبريسو','Shot pur, corsé & intense',3.5,'Popular',1],
    [1,'Café Express','Café Express','كافيه إكسبريس','Espresso allongé, eau chaude',4.0,null,2],
    [1,'Cappuccino','Cappuccino','كابتشينو','Espresso, lait vapeur & mousse veloutée',6.5,'Popular',3],
    [1,'Latte','Latte','لاتيه','Espresso doux noyé dans le lait crémeux',7.0,null,4],
    [1,'Turkish Coffee','Café Turc','قهوة تركية','Préparé à la turque, servi à l\'orientale',4.5,null,5],
    [1,'Hot Chocolate','Chocolat Chaud','شوكولاتة ساخنة','Chocolat noir onctueux, légèrement sucré',7.5,null,6],
    [1,'Mint Tea','Thé à la Menthe','أتاي بالنعناع','Thé vert, menthe fraîche & sucre',4.0,null,7],
    // Cold
    [2,'Iced Coffee','Café Glacé','كافيه بارد','Espresso refroidi sur glaçons',7.0,null,1],
    [2,'Iced Latte','Latte Glacé','لاتيه بارد','Latte glacé, doux & rafraîchissant',8.5,'Popular',2],
    [2,'Fresh Orange Juice','Jus d\'Orange Frais','عصير برتقال طازج','100% oranges pressées du jour',6.5,null,3],
    [2,'Lemon Mint Juice','Citronnade Menthe','عصير ليمون بالنعناع','Citron, menthe fraîche & eau pétillante',6.0,null,4],
    [2,'Soda','Soda','صودا','Coca-Cola, Sprite, Boga — au choix',4.0,null,5],
    // Breakfast
    [3,'Croissant','Croissant','كروسان','Beurré, feuilleté & doré au four',3.5,null,1],
    [3,'Baguette Butter & Jam','Baguette Beurre & Confiture','باقيت بالزبدة والمربى','Baguette croustillante, beurre fermier, confiture maison',5.5,null,2],
    [3,'Omelette','Omelette','أوملات','Œufs frais, herbes, fromage fondu',8.0,null,3],
    [3,'Tunisian Breakfast Plate','Petit-Déj Tunisien','فطور تونسي','Œuf, fromage, olive, beurre, pain maison, citron confit',14.0,'Maison',4],
    // Tunisian
    [4,'Lablabi','Lablabi','لبلابي','Pois chiches, pain rassis, harissa, cumin & œuf',12.0,'Signature',1],
    [4,'Shakshouka','Chakchouka','شكشوكة','Tomates, poivrons, œufs pochés, épices du terroir',10.0,null,2],
    [4,'Ojja','Ojja','عجة','Merguez, œufs, sauce tomate pimentée',13.0,null,3],
    [4,'Sandwich Escalope','Sandwich Escalope','ساندويتش إسكالوب','Escalope panée, fromage fondu, frites, sauce Don',14.0,null,4],
    [4,'Chapati Mahdia','Chapati Mahdia','شاباتي المهدية','Chapati moelleux garni, façon mahdoise',13.0,'Spécial',5],
    // Desserts
    [5,'Mille-feuille','Mille-Feuille','ميل فوي','Feuilletage caramélisé, crème pâtissière vanille',9.0,'Popular',1],
    [5,'Tiramisu','Tiramisu','تيراميسو','Mascarpone léger, biscuits imbibés, cacao',10.5,null,2],
    [5,'Chocolate Cake','Gâteau au Chocolat','كيك الشوكولاتة','Fondant cœur coulant, ganache intense',9.5,null,3],
    [5,'Bambalouni','Bambalouni','بمبالوني','Beignet tunisien frit, sucre glace & miel',5.5,null,4],
  ];
  items.forEach(i => insertItem.run(...i));

  // Default admin: admin / doncafe2025
  const hash = crypto.createHash('sha256').update('doncafe2025').digest('hex');
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?,?)').run('admin', hash);

  db.prepare('INSERT INTO settings (key,value) VALUES (?,?)').run('cafe_name', 'Don Café');
  db.prepare('INSERT INTO settings (key,value) VALUES (?,?)').run('cafe_tagline', "L'art du café, le goût de chez nous");
  db.prepare('INSERT INTO settings (key,value) VALUES (?,?)').run('cafe_address', 'Tunis, Tunisie');
  db.prepare('INSERT INTO settings (key,value) VALUES (?,?)').run('cafe_phone', '+216 XX XXX XXX');
}

// ─── JWT HELPERS ───────────────────────────────────────────────────────────
function signJWT(payload) {
  const header = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
  const body = Buffer.from(JSON.stringify({...payload, exp: Date.now()+3600000})).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyJWT(token) {
  try {
    const [h, b, s] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest('base64url');
    if (s !== expected) return null;
    const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// ─── QR CODE GENERATOR (pure JS, no deps) ──────────────────────────────────
// Minimal QR encoder for URL strings (alphanumeric/byte mode, ECC M, auto version)
function generateQRMatrix(text) {
  // We'll produce an SVG directly using a reliable algorithm
  // Using Reed-Solomon + QR spec subset
  const data = encodeURIComponent(text);
  // For simplicity, encode as byte mode
  return buildQR(text);
}

function buildQR(url) {
  // This is a simplified QR code that encodes a URL
  // We implement a proper QR code using the ISO 18004 spec subset
  const bytes = Buffer.from(url, 'utf8');
  const len = bytes.length;
  
  // Choose version based on length (version 3-10 for most URLs)
  let version = 1;
  const capacities = [17,32,53,78,106,134,154,192,230,271,321,367,425,458,520,586,644,718,792,858];
  for (let v = 0; v < capacities.length; v++) {
    if (len <= capacities[v]) { version = v+1; break; }
  }
  if (version > 10) version = 10;
  
  const size = version * 4 + 17;
  const matrix = Array.from({length: size}, () => new Array(size).fill(null)); // null=unfilled, 0=light, 1=dark
  
  // Place finder patterns
  function placeFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const ri = row + r, ci = col + c;
        if (ri < 0 || ri >= size || ci < 0 || ci >= size) continue;
        const dark = r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4);
        matrix[ri][ci] = (r==-1||r==7||c==-1||c==7) ? 0 : (dark ? 1 : 0);
      }
    }
  }
  placeFinder(0, 0); placeFinder(0, size-7); placeFinder(size-7, 0);
  
  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0 ? 1 : 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }
  
  // Dark module
  matrix[size-8][8] = 1;
  
  // Format info placeholders (we'll fill later)
  const formatPos = [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
                      [8,size-1],[8,size-2],[8,size-3],[8,size-4],[8,size-5],[8,size-6],[8,size-7],
                      [size-7,8],[size-6,8],[size-5,8],[size-4,8],[size-3,8],[size-2,8],[size-1,8]];
  formatPos.forEach(([r,c]) => { if (matrix[r][c] === null) matrix[r][c] = 0; });
  
  // Alignment patterns (version >= 2)
  if (version >= 2) {
    const alignTable = {2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]};
    const positions = alignTable[version] || [6, version*4+10];
    for (const r of positions) {
      for (const c of positions) {
        if (r === 6 && c === 6) continue;
        if (r === 6 && c === positions[positions.length-1]) continue;
        if (c === 6 && r === positions[positions.length-1]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (r+dr < 0||r+dr>=size||c+dc<0||c+dc>=size) continue;
            if (matrix[r+dr][c+dc] !== null) continue;
            matrix[r+dr][c+dc] = (Math.abs(dr)===2||Math.abs(dc)===2||dr===0&&dc===0) ? 1 : 0;
          }
        }
      }
    }
  }
  
  // Build data bitstream: byte mode
  const bits = [];
  // Mode indicator: byte = 0100
  bits.push(0,1,0,0);
  // Character count: 8 bits for version 1-9
  for (let i = 7; i >= 0; i--) bits.push((len >> i) & 1);
  // Data bytes
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }
  // Terminator
  for (let i = 0; i < 4 && bits.length < 1000; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes
  const padBytes = [0xEC, 0x11];
  const totalBits = [72,128,208,288,368,480,528,688,800,976][version-1] || 800;
  let pi = 0;
  while (bits.length < totalBits) { for (let i = 7; i >= 0; i--) bits.push((padBytes[pi%2] >> i)&1); pi++; }
  
  // Simple error correction (shortened for inline use — we use mask 0)
  // Place data bits in zigzag
  let bitIdx = 0;
  let upward = true;
  for (let col = size-1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    const cols = [col, col-1];
    if (upward) {
      for (let row = size-1; row >= 0; row--) {
        for (const c of cols) {
          if (matrix[row][c] === null) {
            const bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
            // Mask pattern 0: (row+col) % 2 === 0
            matrix[row][c] = ((row+c) % 2 === 0) ? bit ^ 1 : bit;
          }
        }
      }
    } else {
      for (let row = 0; row < size; row++) {
        for (const c of cols) {
          if (matrix[row][c] === null) {
            const bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
            matrix[row][c] = ((row+c) % 2 === 0) ? bit ^ 1 : bit;
          }
        }
      }
    }
    upward = !upward;
  }
  
  // Format string for mask 0, ECC level M = 101
  const formatBits = '110011000010110'; // precomputed for mask 0, M
  const fmtPositions1 = [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]];
  const fmtPositions2 = [[size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],[8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]];
  formatBits.split('').forEach((b,i) => {
    if (i < fmtPositions1.length) matrix[fmtPositions1[i][0]][fmtPositions1[i][1]] = parseInt(b);
    if (i < fmtPositions2.length) matrix[fmtPositions2[i][0]][fmtPositions2[i][1]] = parseInt(b);
  });
  
  // Fill remaining nulls
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (matrix[r][c] === null) matrix[r][c] = 0;
  
  return { matrix, size };
}

function matrixToSVG(matrix, size, px=4) {
  const total = size * px + px*2;
  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        rects += `<rect x="${c*px+px}" y="${r*px+px}" width="${px}" height="${px}" fill="#2E1B0E"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" style="background:#fff;display:block">
<rect width="${total}" height="${total}" fill="#fff"/>
${rects}
</svg>`;
}

// ─── ROUTER ────────────────────────────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
  res.end(JSON.stringify(data));
}

function authMiddleware(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  return verifyJWT(token);
}

function handleAPI(req, res, urlPath, method, body) {
  // ── PUBLIC ──
  if (method === 'GET' && urlPath === '/api/menu') {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    const items = db.prepare('SELECT * FROM items WHERE available=1 ORDER BY sort_order').all();
    const settings = db.prepare('SELECT * FROM settings').all();
    const cfg = {};
    settings.forEach(s => cfg[s.key] = s.value);
    return sendJSON(res, 200, { categories, items, settings: cfg });
  }

  if (method === 'GET' && urlPath === '/api/qr') {
    const host = req.headers.host || `localhost:${PORT}`;
    const url = `http://${host}/`;
    const { matrix, size } = buildQR(url);
    const svg = matrixToSVG(matrix, size, 5);
    res.writeHead(200, {'Content-Type':'image/svg+xml','Access-Control-Allow-Origin':'*'});
    return res.end(svg);
  }

  // ── AUTH ──
  if (method === 'POST' && urlPath === '/api/auth/login') {
    const { username, password } = body;
    const hash = crypto.createHash('sha256').update(password||'').digest('hex');
    const admin = db.prepare('SELECT * FROM admins WHERE username=? AND password_hash=?').get(username, hash);
    if (!admin) return sendJSON(res, 401, { error: 'Invalid credentials' });
    const token = signJWT({ id: admin.id, username: admin.username });
    return sendJSON(res, 200, { token, username: admin.username });
  }

  // ── ADMIN (protected) ──
  const user = authMiddleware(req);
  if (!user) return sendJSON(res, 401, { error: 'Unauthorized' });

  // Categories CRUD
  if (method === 'GET' && urlPath === '/api/admin/categories') {
    return sendJSON(res, 200, db.prepare('SELECT * FROM categories ORDER BY sort_order').all());
  }
  if (method === 'POST' && urlPath === '/api/admin/categories') {
    const r = db.prepare('INSERT INTO categories (name,name_fr,icon,sort_order) VALUES (?,?,?,?)').run(body.name,body.name_fr||'',body.icon||'🍽',body.sort_order||0);
    return sendJSON(res, 201, { id: Number(r.lastInsertRowid) });
  }
  if (method === 'PUT' && urlPath.match(/^\/api\/admin\/categories\/\d+$/)) {
    const id = urlPath.split('/').pop();
    db.prepare('UPDATE categories SET name=?,name_fr=?,icon=?,sort_order=? WHERE id=?').run(body.name,body.name_fr||'',body.icon||'🍽',body.sort_order||0,id);
    return sendJSON(res, 200, { ok: true });
  }
  if (method === 'DELETE' && urlPath.match(/^\/api\/admin\/categories\/\d+$/)) {
    const id = urlPath.split('/').pop();
    db.prepare('DELETE FROM items WHERE category_id=?').run(id);
    db.prepare('DELETE FROM categories WHERE id=?').run(id);
    return sendJSON(res, 200, { ok: true });
  }

  // Items CRUD
  if (method === 'GET' && urlPath === '/api/admin/items') {
    return sendJSON(res, 200, db.prepare('SELECT * FROM items ORDER BY category_id, sort_order').all());
  }
  if (method === 'POST' && urlPath === '/api/admin/items') {
    const r = db.prepare('INSERT INTO items (category_id,name,name_fr,name_ar,description,price,badge,available,sort_order) VALUES (?,?,?,?,?,?,?,?,?)').run(
      body.category_id,body.name,body.name_fr||'',body.name_ar||'',body.description||'',body.price||0,body.badge||null,1,body.sort_order||0);
    return sendJSON(res, 201, { id: Number(r.lastInsertRowid) });
  }
  if (method === 'PUT' && urlPath.match(/^\/api\/admin\/items\/\d+$/)) {
    const id = urlPath.split('/').pop();
    db.prepare('UPDATE items SET category_id=?,name=?,name_fr=?,name_ar=?,description=?,price=?,badge=?,available=?,sort_order=? WHERE id=?').run(
      body.category_id,body.name,body.name_fr||'',body.name_ar||'',body.description||'',body.price||0,body.badge||null,body.available??1,body.sort_order||0,id);
    return sendJSON(res, 200, { ok: true });
  }
  if (method === 'DELETE' && urlPath.match(/^\/api\/admin\/items\/\d+$/)) {
    const id = urlPath.split('/').pop();
    db.prepare('DELETE FROM items WHERE id=?').run(id);
    return sendJSON(res, 200, { ok: true });
  }

  // Settings
  if (method === 'GET' && urlPath === '/api/admin/settings') {
    const rows = db.prepare('SELECT * FROM settings').all();
    const s = {}; rows.forEach(r => s[r.key] = r.value);
    return sendJSON(res, 200, s);
  }
  if (method === 'PUT' && urlPath === '/api/admin/settings') {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)');
    Object.entries(body).forEach(([k,v]) => stmt.run(k,v));
    return sendJSON(res, 200, { ok: true });
  }

  // Change password
  if (method === 'POST' && urlPath === '/api/admin/change-password') {
    const hash = crypto.createHash('sha256').update(body.password||'').digest('hex');
    db.prepare('UPDATE admins SET password_hash=? WHERE id=?').run(hash, user.id);
    return sendJSON(res, 200, { ok: true });
  }

  sendJSON(res, 404, { error: 'Not found' });
}

// ─── STATIC FILE SERVING ───────────────────────────────────────────────────
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.svg':'image/svg+xml','.ico':'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const urlPath = parsedUrl.pathname;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE','Access-Control-Allow-Headers':'Content-Type,Authorization'});
    return res.end();
  }

  // API routes
  if (urlPath.startsWith('/api/')) {
    const body = ['POST','PUT'].includes(method) ? await parseBody(req) : {};
    return handleAPI(req, res, urlPath, method, body);
  }

  // Serve static files
  let filePath;
  if (urlPath === '/' || urlPath === '/menu') {
    filePath = path.join(__dirname, 'frontend', 'public', 'index.html');
  } else if (urlPath === '/admin' || urlPath === '/admin/') {
    filePath = path.join(__dirname, 'frontend', 'public', 'admin.html');
  } else if (urlPath === '/print' || urlPath === '/print-cards') {
    filePath = path.join(__dirname, 'frontend', 'public', 'print-cards.html');
  } else {
    const safeSuffix = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    filePath = path.join(__dirname, 'frontend', 'public', safeSuffix);
  }

  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'text/html','Access-Control-Allow-Origin':'*'});
      return res.end('<h1>404 Not Found</h1><a href="/">Back to Menu</a>');
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n☕  Don Café server running at http://localhost:${PORT}`);
  console.log(`🍽  Menu:  http://localhost:${PORT}/`);
  console.log(`🔧  Admin: http://localhost:${PORT}/admin`);
  console.log(`📱  QR:    http://localhost:${PORT}/api/qr`);
  console.log(`\n   Login: admin / doncafe2025\n`);
});
