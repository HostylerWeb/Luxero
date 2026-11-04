// Hostinger: rewrite any remaining luxero.win URLs to *.srv2011364.hstgr.cloud phase hosts.
// Run: mongosh "$DATABASE_URL" --file migrate-hostinger-domains.js

const replacements = [
  ["https://admin.agro.luxero.win", "https://admin.agro.srv2011364.hstgr.cloud"],
  ["https://agro.luxero.win", "https://agro.srv2011364.hstgr.cloud"],
  ["https://admin.luxero.win", "https://admin.srv2011364.hstgr.cloud"],
  ["https://www.admin.luxero.win", "https://admin.srv2011364.hstgr.cloud"],
  ["https://shop.luxero.win", "https://shop.srv2011364.hstgr.cloud"],
  ["https://www.shop.luxero.win", "https://shop.srv2011364.hstgr.cloud"],
  ["https://assets.luxero.win/luxero-assets-staging", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
  ["https://assets.luxero.win/luxero-assets", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
  ["http://assets.luxero.win/luxero-assets-staging", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
  ["http://assets.luxero.win/luxero-assets", "https://assets.srv2011364.hstgr.cloud/luxero-assets"],
  ["https://www.luxero.win", "https://srv2011364.hstgr.cloud"],
  ["https://luxero.win", "https://srv2011364.hstgr.cloud"],
  ["http://luxero.win", "https://srv2011364.hstgr.cloud"],
  ["http://www.luxero.win", "https://srv2011364.hstgr.cloud"],
];

const target = db.getName();
print(`Rewriting luxero.win → Hostinger hosts in database: ${target}`);

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
    const next = EJSON.parse(serialized);
    coll.replaceOne({ _id: doc._id }, next);
    updated++;
  }
  if (updated > 0) print(`${collName}: ${updated}`);
  total += updated;
}
print(`Done. Documents updated: ${total}`);
