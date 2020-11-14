if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js')
        .then(function(registration) {
            console.log('Registration successful, scope is:', registration.scope);
        })
        .catch(function(error) {
            console.log('Service worker registration failed, error:', error);
        });
    navigator.serviceWorker.ready.then(function(swRegistration) {
        return swRegistration.sync.register('getAndStoreData');
    });

}
