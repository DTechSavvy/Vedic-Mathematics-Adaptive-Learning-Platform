const videoIds = [
  'yG8MHRBE9do',
  'JX1PA4S95ho',
  'EIdNCzkSQWA',
  'IPrJABfzZqw',
];

async function validate() {
  for (const id of videoIds) {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [${id}] "${data.title}" by "${data.author_name}"`);
      } else {
        console.log(`❌ [${id}] Status: ${res.status}`);
      }
    } catch (e) {
      console.log(`❌ [${id}] Error: ${e.message}`);
    }
  }
}
validate();
