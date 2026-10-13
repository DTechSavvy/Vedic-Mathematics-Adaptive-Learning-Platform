const urls = [
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHfw3VAkWKyGcxJi6iWPATfYBtuY57akN5KWSky2GFpkGUqLUiOmuVn8FjeTP8v_9zXZxz6PMYYQYNvyn3wCt0MbRm1gtfE71DCMQU43U376DJF-IJGgOFoSRpOwrLgsf7_',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFKiFYXzvRRYlCWhT_ljC5NaIwfXq54DIqwsF57EUICoaYY5ZAaoCo8CVX9v8IrMaK9rhPyWyDrB4Ef5wSEAjwBCdbc55Bmre9LZgb3fWNyJ2JYdr0hULA_GNI_B5HEt2CR',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFWhaTQv2c9BWjKulbwS0wcMnXKKyWbUMLFmig1-mbWQvvsWeW9ggAxdVmUcioDZ6dFLaoaiVtRSq4dfy08Q-do7bW1dDYzdewCC8IkAhOi4UibbpEQtvAUHYaA0lnZMU50',
  'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHC3N2gC6SxTKXgXny-UiOcK2fhRY5YHFpGHs2LXWfBLovghrFxZZnbLTcAXHnZoKCXGHPM-5nQ24VZWWW9RRFHJ97oLJTTNnLNzHwHm8CHBnpv1wrBSlgAWW-ZoHfwS9o='
];

async function check() {
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], { redirect: 'manual' });
      const loc = res.headers.get('location');
      console.log(`[${i}] Location:`, loc);
    } catch (e) {
      console.log(`[${i}] Error:`, e.message);
    }
  }
}
check();
