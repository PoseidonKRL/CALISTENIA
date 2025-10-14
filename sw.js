const CACHE_NAME = 'agenda-treino-cache-v4';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/constants.ts',
  '/types.ts',
  '/hooks/useLocalStorage.ts',
  '/components/Icons.tsx'
];

// Instalação: Cacheia o app shell e os recursos críticos locais.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto para pré-cache do app shell');
        // Adiciona todos os recursos essenciais de uma vez.
        // Recursos externos (CDN, fontes) serão cacheados dinamicamente.
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(error => {
        console.error('Falha ao pré-cachear o app shell:', error);
      })
  );
});

// Ativação: Limpa caches antigos.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Implementa a estratégia de cache e rede.
self.addEventListener('fetch', event => {
  // Ignora solicitações que não sejam GET.
  if (event.request.method !== 'GET') {
    return;
  }

  // Estratégia para solicitações de navegação (HTML).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      // Sempre serve a "casca" do aplicativo.
      caches.match('/index.html')
        .then(response => {
          return response || fetch(event.request);
        })
    );
    return;
  }

  // Estratégia para todos os outros recursos (JS, CSS, fontes, imagens, etc.).
  // Cache-first: Tenta servir do cache, se falhar, vai para a rede.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se não estiver no cache, busca na rede.
        return fetch(event.request).then(networkResponse => {
          // Clona a resposta para poder armazená-la no cache e retorná-la.
          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // Armazena a nova resposta no cache.
              cache.put(event.request, responseToCache);
            });
            
          return networkResponse;
        });
      })
  );
});
