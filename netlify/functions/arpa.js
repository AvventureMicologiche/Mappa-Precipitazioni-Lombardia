exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint || 'nf78-nj6b.json';
  
  // Costruisci URL ARPA con params decodificati e ri-encodati correttamente
  const arpaBase = `https://www.dati.lombardia.it/resource/${endpoint}`;
  const urlObj = new URL(arpaBase);
  
  Object.entries(params).forEach(([k, v]) => {
    if (k !== 'endpoint') {
      urlObj.searchParams.append(k, v);
    }
  });
  
  const url = urlObj.toString();
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
