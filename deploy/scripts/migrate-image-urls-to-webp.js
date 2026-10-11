// Rewrites luxero-assets URLs: .png / .jpg / .jpeg → .webp (after media-converter bulk).
// Run on Hostinger:
//   mongosh "$DATABASE_URL" --file deploy/scripts/migrate-image-urls-to-webp.js
// Or from luxero_admin container (see ssh.txt).

const RASTER_RE = /(\/luxero-assets\/[^"'\\\s]+?)\.(png|jpe?g)(?=["'\\\s]|$|\?)/gi;

function rewriteText(text) {
  if (typeof text !== "string" || !text) return text;
  return text.replace(RASTER_RE, "$1.webp");
}

function deepRewrite(value) {
  if (typeof value === "string") {
    const next = rewriteText(value);
    return { value: next, changed: next !== value };
  }
  if (value === null || value === undefined) return { value, changed: false };
  if (value instanceof Date || (value._bsontype === "ObjectID" || value._bsontype === "ObjectId")) {
    return { value, changed: false };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const r = deepRewrite(item);
      if (r.changed) changed = true;
      return r.value;
    });
    return { value: next, changed };
  }
  if (typeof value === "object") {
    let changed = false;
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const newKey = rewriteText(k);
      if (newKey !== k) changed = true;
      const r = deepRewrite(v);
      out[newKey] = r.value;
      if (r.changed) changed = true;
    }
    return { value: out, changed };
  }
  return { value, changed: false };
}

const target = db.getName();
print(`Rewriting raster luxero-assets URLs → .webp in database: ${target}`);

let total = 0;
for (const collName of db.getCollectionNames()) {
  if (collName.startsWith("system.")) continue;
  const coll = db.getCollection(collName);
  const cursor = coll.find({});
  let updated = 0;
  while (cursor.hasNext()) {
    const doc = cursor.next();
    const { value: next, changed } = deepRewrite(doc);
    if (!changed) continue;
    coll.replaceOne({ _id: doc._id }, next);
    updated++;
  }
  if (updated > 0) print(`${collName}: ${updated}`);
  total += updated;
}
print(`Done. Documents updated: ${total}`);
