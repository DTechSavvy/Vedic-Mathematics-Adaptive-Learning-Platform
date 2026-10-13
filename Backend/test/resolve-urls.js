const urls = [
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHVJ3ITt_XWQ8mHFN-8h7N8snVRZD9iitr0wgrqp4fgnr_Dmfk0tgp0oa5-tFEJtWQWvmg4LuGBpzUKPFu8c3-TfW-0b4zM9bsk3BahRFLCF9V4YhH2--reQxhkIj9I98Fk',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGo7QI3zMTijKlJIMpVZN0qwZ7xyA2cT2jDO3K6L6-8XveOjcOJI3wZvRhQtoMHnvk9Udu1hrTGIZHqNbw1DlCRMCIpmcTFGooosNaYtsuqnAndtkePYki1aG-vCShQhFwn',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE_NoRaalADrihYxMrpIkVPa9SvS4ZSPBGgnpet9_BVJGAOHkRK44bAMmI_MePb3xfrMSG3UJFDFhO41N3k3Lowe942VTEM8a200_6Sgni3P7MDuDlyZdMuwHogSppPJzS7',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEX8cu0Y0apEP-EbFMMK7g4w2aBqbHMPTCr1lwObv9TPxveOoSKV6dFHY9yItcvXPtb7PMj6qsVA1wb-eeo9MmKTBiXw3ces8NaF1iZ2moaXADuHAySYKc2CzcME5I-5SCO',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQENt8_zm5xg3nREJ2cVUNDR4XnovZz91YCUxuXsHuNyytj2w9isnb4cdmur5I4_RL8-zxy5Z0qbB2i4ja44BVs_5obdGMwPwhRqjVvzSTT_sT2Z7jKuXDSP2inCZeF_qI_G',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHTjCnQQKP4S_27rrwHGxw6TJa3NniO3kUDAu-HcvDLAGvwVZVhwFQB2VdvpZIl83Qk8_khCXEyjPGoZmS0tbmzHV7YH1WhRw_xw6drwxa_MjsQ5kmSjg_BlgZivAOFxiCT',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGc3f0sYa1IDNNHDXDFVTL7WuCjj-qhr9-iBQtY1sfpjq__MhH-TpLZFReX9T-zdcjc9gGZSa6P3ziFghdjegQYD6TJsMKXsmKqeHyOSbAhpETTjHA1GK_YG5yUIiyJu_I5',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGwPE09y2UXLPE15GqTo2_mBmfZFTttImKY9b-EUi_lh1djPBYnSdBb9VXEO9Xhr_0ZKQvw3RN_nloIAe5MyWWVAV-A92jW6gS95v1VDPG8OmA8CcXmVulPskFC2xwmJYIr'
];

async function check() {
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], { redirect: 'manual' });
      const loc = res.headers.get('location');
      if (loc) {
        console.log(`[${i}] Location:`, loc);
      } else {
        const text = await res.text();
        const match = text.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
        const titleMatch = text.match(/<title>([^<]+)<\/title>/);
        console.log(`[${i}] Title:`, titleMatch ? titleMatch[1] : 'No title', 'Video:', match ? match[1] : 'No video id');
      }
    } catch (e) {
      console.log(`[${i}] Error:`, e.message);
    }
  }
}
check();
