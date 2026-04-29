const { getStore } = require('@netlify/blobs');

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint || 'nf78-nj6b.json';

  const qs = Object.entries(params)
    .filter(([k]) => k !== 'endpoint')
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const arpaUrl = `https://www.dati.lombardia.it/resource/${endpoint}${qs ? '?' + qs : ''}`;

  // Cache solo per misure (pstb-pga6), non per anagrafica stazioni
  const useCache = endpoint === 'pstb-pga6.json';
  const cacheKey = ('arpa_' + endpoint + '_' + qs).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 200);
  const CACHE_TTL = 3600; // 1 ora

  if (useCache) {
    try {
      const store = getStore('arpa-cache');
      const cached = await store.getWithMetadata(cacheKey);
      if (cached && cached.data) {
        const age = (Date.now() - cached.metadata.createdAt) / 1000;
        if (age < CACHE_TTL) {
          console.log('Cache HIT age:', Math.round(age), 's');
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'X-Cache': 'HIT'
            },
            body: cached.data
          };
        }
      }
    } catch(e){ console.warn('Cache read:', e.message); }
  }

  try {
    const response = await fetch(arpaUrl, { headers: { 'Accept': 'application/json' } });
    const data = await response.text();

    if (useCache && response.ok) {
      try {
        const store = getStore('arpa-cache');
        await store.set(cacheKey, data, { metadata: { createdAt: Date.now() } });
        console.log('Cache SET:', cacheKey.substring(0, 60));
      } catch(e){ console.warn('Cache write:', e.message); }
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS'
      },
      body: data
    };
  } catch(error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
