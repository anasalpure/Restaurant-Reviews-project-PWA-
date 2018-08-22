"use strict";


const cacheName ='serviceWorker-cache-V1' ;


self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {

        return cache.addAll([
          '/',
          '/restaurant.html' ,
          '/js/restaurant_info.js',
          '/js/main.js',
          '/css/styles.css' ,
          '/js/dbhelper.js' ,
          '/data/restaurants.json',
          '/js/ServiceWorkerReg.js',
          '/service-worker.js' ,
          '/img/1.jpg',
          '/img/2.jpg',
          '/img/3.jpg',
          '/img/4.jpg',
          '/img/5.jpg',
          '/img/6.jpg',
          '/img/7.jpg',
          '/img/8.jpg',
          '/img/9.jpg',
          '/img/10.jpg',
          'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png' ,
          '/manifest.json' ,
          '/logo192x192.png' ,
        ])
         
      })
      .then(function() {
        console.log ( 'install event error ' );            
      })
  );
}),


self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      console.log('i try delete old cache')
      Promise.all(
        cacheNames.map(function(name) {
          if (name.startsWith('serviceWorker-cache') && name != cacheName)
            caches.delete(name)
        })
      )
    })
  )
}),




  self.addEventListener("fetch", function(event) {
    

    if ("GET" === event.request.method) {
      const reqParts=event.request.url.split('/');
      const ditailePage= Boolean(reqParts[reqParts.length-1].match('restaurant.html')) ;
      const request = ditailePage ? '/restaurant.html'   : event.request
      event.respondWith(
        caches.match(request).then(function(cacheRes) {
          return cacheRes || fetch(event.request) ;
        })
      );
    }
    

  });
