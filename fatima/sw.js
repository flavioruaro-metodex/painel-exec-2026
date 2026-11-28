// MEX-FATIMA - service worker simples: rede primeiro, cache como reserva (abre sem internet com os ultimos dados baixados)
const C = 'mex-fatima-v1';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.indexOf('versao.json') !== -1) return; // consulta de versao: sempre pela rede, sem guardar
  // a pagina (com ou sem ?v=) fica guardada em uma unica entrada, para nao acumular copias
  const k = e.request.mode === 'navigate' ? './' : e.request;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(k, cp)); } return r; })
    .catch(() => caches.match(k).then(m => m || caches.match('./'))));
});
