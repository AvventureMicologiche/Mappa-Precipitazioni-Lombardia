// Netlify Function: proxy per ARPA Lombardia
exports.handler = async function(event) {
  // Passa tutti i query parameters direttamente ad ARPA, tranne 'endpoint'
  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint || 'nf78-nj6b.json';
  
  // Rimuovi 'endpoint' dai params e ricostruisci la query string
  const arpaParams = Object.entries(params)
    .filter(([k]) => k !== 'endpoint')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  
  const url = `https://www.dati.lombardia.it/resource/${endpoint}${arpaParams ? '?' + arpaParams : ''}`;
  console.log('Proxying to:', url);
  
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
