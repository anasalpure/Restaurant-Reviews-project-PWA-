
function register() {

  if ( 'serviceWorker' in navigator) {
    const PUBLIC_URL =window.location.origin 

    window.addEventListener('load', () => {
      const swUrl = `${PUBLIC_URL}/service-worker.js`; 
        registerValidSW(swUrl);
    });
  }

}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              alert ('New content is available; please refresh.')
              console.log('New content is available; please refresh.');
            } else {
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}

register();