const db = require('./src/db');
(async () => {
  for (const id of [92, 89]) {
    try {
      const r = await db.query('SELECT id, title, slug, image, images FROM products WHERE id = $1', [id]);
      console.log('ID', id, 'rows', r.rows.length);
      if (r.rows.length) console.log(JSON.stringify(r.rows[0], null, 2));
    } catch (e) {
      console.error('ERR', id, e.message);
    }
  }
  process.exit(0);
})();
