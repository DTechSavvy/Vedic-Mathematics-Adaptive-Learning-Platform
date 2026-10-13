const videoIds = [
  '8e7a775X4DE',
  '4vCsXaI_FEg',
  'irnf_tjGRK0',
  'MbUEIvZ6YPE',
  'DqsWA1GuAA8',
  'G-PWO2NSThQ',
  'GNuPW5L54kc',
  'yyE23Dqs8pM',
  'b6n3D90BZB8',
  'Ro4U2SXueJE',
  'pMGpBCtI09w',
  'eNYbURkoGTU',
  '8mQostYnEJE',
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
