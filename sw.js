// Bump CACHE_NAME on each release so old caches are cleared on activate.
var CACHE_NAME = 'signal-board-v2';
var ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

function putInCache(request, resp){
  if (resp && (resp.ok || resp.type === 'opaque')){
    var respClone = resp.clone();
    caches.open(CACHE_NAME).then(function(cache){ cache.put(request, respClone); });
  }
  return resp;
}

function offlineResponse(){
  return new Response('Offline and not cached.', {status: 503, headers: {'Content-Type': 'text/plain'}});
}

self.addEventListener('fetch', function(event){
  var req = event.request;
  if (req.method !== 'GET') return;

  // Pages: network first so app updates arrive, cached copy when offline.
  if (req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(function(resp){ return putInCache(req, resp); }).catch(function(){
        return caches.match(req).then(function(cached){
          return cached || caches.match('./index.html');
        }).then(function(cached){ return cached || offlineResponse(); });
      })
    );
    return;
  }

  // Everything else (icons, manifest, fonts): cache first.
  event.respondWith(
    caches.match(req).then(function(cached){
      return cached || fetch(req).then(function(resp){ return putInCache(req, resp); }).catch(offlineResponse);
    })
  );
});
