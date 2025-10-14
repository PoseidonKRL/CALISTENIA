const CACHE_NAME = 'agenda-treino-cache-v3'; // Versão incrementada para forçar a atualização

// Apenas os arquivos essenciais do "app shell" são pré-cacheados para garantir uma instalação robusta.
// Outros ativos (JS, CSS, fontes, imagens) serão cacheados dinamicamente na primeira visita.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto para pré-cache do app shell');
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
        // Estratégia "Cache falling back to Network" (Offline-first)
        // Se tivermos uma resposta no cache, retorne-a imediatamente.
        if (response) {
          return response;
        }

        // Se não, busque na rede.
        return fetch(event.request).then(
          networkResponse => {
            // Verifique se recebemos uma resposta válida para cachear.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
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
          // Para solicitações de navegação (ex: recarregar a página),
          // servimos a página principal como fallback para que o SPA carregue.
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
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
