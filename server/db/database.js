const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'agrolink.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('farmer', 'consumer')),
    delivery_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS farms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    location TEXT NOT NULL,
    bio TEXT,
    founded_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN ('vegetables','dairy','honey','meat','fruit','other')),
    price REAL NOT NULL,
    unit TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consumer_id INTEGER NOT NULL REFERENCES users(id),
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')),
    delivery_address TEXT NOT NULL,
    stripe_payment_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase REAL NOT NULL
  );
`);

function seedDatabase() {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (count > 0) return;

  console.log('🌱 Seeding database...');
  const hash = bcrypt.hashSync('password123', 10);

  const addUser = db.prepare('INSERT INTO users (email, password_hash, name, role, delivery_address) VALUES (?, ?, ?, ?, ?)');
  const addFarm = db.prepare('INSERT INTO farms (user_id, farm_name, location, bio, founded_year) VALUES (?, ?, ?, ?, ?)');
  const addProduct = db.prepare('INSERT INTO products (farm_id, name, description, category, price, unit, stock) VALUES (?, ?, ?, ?, ?, ?, ?)');

  db.exec('BEGIN');
  try {
    // Farmer 1: Marko Novak — Pomurje, vegetables & oils
    const { lastInsertRowid: markoId } = addUser.run('marko@novakfarm.si', hash, 'Marko Novak', 'farmer', null);
    const { lastInsertRowid: f1 } = addFarm.run(markoId, 'Novak Family Farm', 'Pomurje, Slovenia',
      'Three generations of organic farming in the fertile Pomurje plains. We grow heirloom varieties using no synthetic pesticides, cold-press our own oils, and deliver within 48 hours of harvest.',
      2005);
    addProduct.run(f1, 'Organic Purple Garlic',
      'Hand-harvested from mineral-rich soil and cured naturally for four weeks. Complex layered flavour — assertive raw, mellow and buttery when roasted. Grown from heirloom seed stock kept in the family since 1978.',
      'vegetables', 4.50, 'kg', 85);
    addProduct.run(f1, 'Cold-Pressed Sunflower Oil',
      'First cold-press extraction from heritage sunflower varieties. Unrefined and bottled raw to preserve Vitamin E and natural antioxidants. Deep golden colour with a distinctive nutty finish.',
      'other', 8.00, 'litre', 40);
    addProduct.run(f1, 'Heirloom Tomato Mix',
      'Six varieties in one box: Brandywine, Black Krim, Green Zebra, Cherokee Purple, Yellow Pear, and Oxheart. Each grown from seeds saved over thirty seasons.',
      'vegetables', 3.20, 'kg', 120);

    // Farmer 2: Ana Horvat — Goriška Brda, fruit & preserves
    const { lastInsertRowid: anaId } = addUser.run('ana@horvat.si', hash, 'Ana Horvat', 'farmer', null);
    const { lastInsertRowid: f2 } = addFarm.run(anaId, 'Horvat Brda Orchards', 'Goriška Brda, Slovenia',
      'Nestled on the sun-drenched hills where Alpine air meets Mediterranean warmth, our family orchard has been producing exceptional stone fruits and small berries since 1998.',
      1998);
    addProduct.run(f2, 'Royal Gala Apples',
      'Crisp, intensely sweet apples from our century-old orchard. Hand-picked at peak ripeness, unwaxed, never cold stored. Delivered within 48 hours of harvest.',
      'fruit', 2.80, 'kg', 200);
    addProduct.run(f2, 'Sour Cherry Jam',
      'Small-batch summer preserve made with our own Morello cherries. The recipe is unchanged since 1962 — just fruit, raw cane sugar, and lemon. No pectin, no preservatives.',
      'other', 6.50, 'jar', 65);
    addProduct.run(f2, 'Wild Blueberries',
      'Foraged from the hillside woodlands bordering our farm every July. Significantly smaller and more intensely flavoured than cultivated varieties, with measurably higher antioxidant content.',
      'fruit', 7.80, 'kg', 30);
    addProduct.run(f2, 'Dried Porcini Mushrooms',
      'Foraged from the old-growth forests of Brda and slow-dried at 38°C to preserve maximum flavour. Just 20g transforms a risotto or pasta completely.',
      'other', 18.50, 'kg', 20);

    // Farmer 3: Josef Mayer — Styria Austria, honey & herbs
    const { lastInsertRowid: josefId } = addUser.run('josef@mayer.at', hash, 'Josef Mayer', 'farmer', null);
    const { lastInsertRowid: f3 } = addFarm.run(josefId, 'Mayer Alpine Apiary', 'Styria, Austria',
      'High-altitude beekeeping at 900 metres in the pristine Styrian Alps. Our 42 hives are certified organic and harvested once per year. Every jar is raw, unheated, and full of living enzymes.',
      2010);
    addProduct.run(f3, 'Raw Alpine Wildflower Honey',
      'Harvested once annually from hives placed across five alpine meadow zones. Rich in live enzymes, bee pollen, and natural antibacterial compounds. Crystallises naturally over winter — a sign of purity.',
      'honey', 12.00, 'jar', 75);
    addProduct.run(f3, 'Alpine Herb Bundle',
      'Eight dried herbs from our certified-organic medicinal garden: lemon balm, thyme, rosemary, mountain sage, yarrow, elderflower, chamomile, and St. John\'s wort.',
      'other', 5.00, 'bundle', 50);
    addProduct.run(f3, 'Lavender Mountain Honey',
      'A rare single-varietal honey collected during the three-week lavender bloom in July. Pale gold with an unmistakable floral character. Only 60 jars produced per season.',
      'honey', 14.50, 'jar', 28);

    // Consumer
    addUser.run('test@consumer.com', hash, 'Test Consumer', 'consumer', JSON.stringify({
      name: 'Test Consumer', address: 'Slovenska cesta 1', city: 'Ljubljana', postalCode: '1000', country: 'Slovenia'
    }));

    db.exec('COMMIT');
    console.log('✅ Database seeded successfully.');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

seedDatabase();

module.exports = db;
