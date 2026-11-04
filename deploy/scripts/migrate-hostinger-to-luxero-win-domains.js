// After DNS cutover: rewrite phase hostnames → luxero.win in Mongo (both luxero + agro DBs).
// Run: for db in luxero agro; do mongosh "mongodb://root:PASS@localhost:27017/$db?authSource=admin" --file migrate-hostinger-to-luxero-win-domains.js; done

const replacements = [
  ["https://admin.agro.srv2011364.hstgr.cloud", "https://admin.agro.luxero.win"],
  ["https://agro.srv2011364.hstgr.cloud", "https://agro.luxero.win"],
  ["https://admin.srv2011364.hstgr.cloud", "https://admin.luxero.win"],
  ["https://shop.srv2011364.hstgr.cloud", "https://shop.luxero.win"],
  ["https://assets.srv2011364.hstgr.cloud/luxero-assets", "https://assets.luxero.win/luxero-assets"],
  ["https://assets.srv2011364.hstgr.cloud", "https://assets.luxero.win"],
  ["https://srv2011364.hstgr.cloud", "https://luxero.win"],
  ["http://assets.srv2011364.hstgr.cloud/luxero-assets", "https://assets.luxero.win/luxero-assets"],
  ["http://srv2011364.hstgr.cloud", "https://luxero.win"],
];

const target = db.getName();
print(`Rewriting phase URLs → luxero.win in database: ${target}`);

let total = 0;
for (const collName of db.getCollectionNames()) {
  if (collName.startsWith("system.")) continue;
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
    coll.replaceOne({ _id: doc._id }, EJSON.parse(serialized));
    updated++;
  }
  if (updated > 0) print(`${collName}: ${updated}`);
  total += updated;
}
print(`Done. Documents updated: ${total}`);
