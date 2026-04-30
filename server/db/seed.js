require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const db = require('./database');
const bcrypt = require('bcryptjs');

const force = process.argv.includes('--force');

if (!force) {
  console.log('ℹ️  Run with --force to wipe and re-seed: npm run reseed');
  process.exit(0);
}

console.log('💥 Wiping all data...');
db.exec('PRAGMA foreign_keys = OFF');
db.exec('DELETE FROM order_items');
db.exec('DELETE FROM orders');
db.exec('DELETE FROM products');
db.exec('DELETE FROM farms');
db.exec('DELETE FROM users');
try {
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','farms','products','orders','order_items')");
} catch {}
db.exec('PRAGMA foreign_keys = ON');

const hash = bcrypt.hashSync('password123', 10);
db.prepare('INSERT INTO users (email, password_hash, name, role, delivery_address) VALUES (?, ?, ?, ?, ?)')
  .run('test@consumer.com', hash, 'Test Consumer', 'consumer', JSON.stringify({
    name: 'Test Consumer', address: 'Slovenska cesta 1', city: 'Ljubljana', postalCode: '1000', country: 'Slovenia'
  }));

console.log('✅ Reseed complete.');
console.log('   Login: test@consumer.com / password123');
console.log('   No farmers or products — ready for real sign-ups.');
process.exit(0);
