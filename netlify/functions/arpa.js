// Netlify Function: proxy per ARPA Lombardia
// Risolve il problema CORS permettendo al browser di chiamare ARPA tramite questo server

exports.handler = async function(event) {
  const BASE = 'https://www.dati.lombardia.it/resource';
  
  // Prendi l'endpoint e i parametri dalla query string
  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint || 'nf78-nj6b.json';
  
  // Costruisci URL ARPA con tutti i parametri passati (escluso 'endpoint')
  const queryParams = Object.entries(params)
    .filter(([k]) => k !== 'endpoint')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  
  const url = `${BASE}/${endpoint}${queryParams ? '?' + queryParams : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-App-Token': '' // opzionale, aumenta rate limit se aggiunto
      }
    });
    
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=60' // cache 1 minuto
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

