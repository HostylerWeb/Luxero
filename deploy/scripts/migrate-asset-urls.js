// Run: mongosh "$DATABASE_URL" --file migrate-asset-urls.js
// Rewrites asset host strings in all documents; preserves dates/ObjectIds via EJSON.

const replacements = [
  ["https://assets.luxero.win/luxero-assets-staging", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
  ["https://assets.luxero.win/luxero-assets", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
  ["http://assets.luxero.win/luxero-assets-staging", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
  ["http://assets.luxero.win/luxero-assets", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
];

const target = db.getName();
print(`Rewriting asset URLs in database: ${target}`);

let total = 0;
for (const collName of db.getCollectionNames()) {
  const coll = db.getCollection(collName);
  const cursor = coll.find({});
  let updated = 0;
  while (cursor.hasNext()) {
    const doc = cursor.next();
    let serialized = EJSON.stringify(doc);
    let changed = false;
    for (const [from, to] of replacements) {
      if (serialized.includes(from)) {
        serialized = serialized.split(from).join(to);
        changed = true;
      }
    }
    if (!changed) continue;
    const next = EJSON.parse(serialized);
    coll.replaceOne({ _id: doc._id }, next);
    updated++;
  }
  if (updated > 0) print(`${collName}: ${updated}`);
  total += updated;
}
print(`Done. Documents updated: ${total}`);
