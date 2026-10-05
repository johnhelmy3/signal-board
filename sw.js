// Bump CACHE_NAME on each release so old caches are cleared on activate.
var CACHE_NAME = 'signal-board-v3';
var ASSETS = ['./index.html', './config.js', './vendor/supabase-js-2.117.2.js', './manifest.json', './icon-192.png', './icon-512.png'];
var FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

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
  var url = new URL(req.url);

  // Fonts never change: cache first.
  if (FONT_HOSTS.indexOf(url.hostname) !== -1){
    event.respondWith(
      caches.match(req).then(function(cached){
        return cached || fetch(req).then(function(resp){ return putInCache(req, resp); }).catch(offlineResponse);
      })
    );
    return;
  }

  // Anything else off-site (the Supabase API included) goes straight to the
  // network and is never cached: board data must always be live.
  if (url.origin !== self.location.origin) return;

  // App files: network first so updates arrive, cached copy only when offline.
  event.respondWith(
    fetch(req).then(function(resp){ return putInCache(req, resp); }).catch(function(){
      return caches.match(req).then(function(cached){
        if (cached) return cached;
        return req.mode === 'navigate' ? caches.match('./index.html') : undefined;
      }).then(function(cached){ return cached || offlineResponse(); });
    })
  );
});
