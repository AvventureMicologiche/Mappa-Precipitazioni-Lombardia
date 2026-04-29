exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint || 'nf78-nj6b.json';
  
  // Ricostruisci query string passando i valori così come arrivano (già encodati dal browser)
  const qs = Object.entries(params)
    .filter(([k]) => k !== 'endpoint')
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  
  const url = `https://www.dati.lombardia.it/resource/${endpoint}${qs ? '?' + qs : ''}`;
  console.log('Proxy URL:', url);
  
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
