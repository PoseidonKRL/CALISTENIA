const CACHE_NAME = 'agenda-treino-cache-v2'; // Versão incrementada para forçar a atualização
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/constants.ts',
  '/types.ts',
  '/hooks/useLocalStorage.ts',
  '/components/Icons.tsx',
  '/manifest.json',
  // Ativos de CDN estáticos são seguros para pré-cache
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  // As URLs problemáticas do aistudiocdn com '^' foram removidas. Elas serão cacheadas dinamicamente.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto para pré-cache');
        // As URLs problemáticas foram removidas, então isso deve ser seguro agora.
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Apenas manipular solicitações GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se tivermos uma resposta no cache, retorne-a.
        if (response) {
          return response;
        }

        // Se não, busque na rede.
        return fetch(event.request).then(
          networkResponse => {
            // Verifique se recebemos uma resposta válida para cachear.
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // IMPORTANTE: Clone a resposta. Uma resposta é um stream
            // e como queremos que o navegador e o cache consumam a resposta,
            // precisamos cloná-la para ter dois streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cacheia a nova resposta para uso futuro.
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          // A solicitação de rede falhou, provavelmente offline.
          // Para solicitações de navegação, servimos a página principal como fallback.
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // Para outras solicitações com falha (imagens, API), a promessa de fetch
          // será rejeitada e o navegador mostrará um erro (ícone de imagem quebrada, etc.).
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
