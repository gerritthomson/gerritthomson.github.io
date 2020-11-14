navigator.serviceWorker.register('push-service-worker.js');

/**
 * urlBase64ToUint8Array
 *
 * @param {string} base64String a public vavid key
 */
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function saveSubscription(sub){
    localStorage.setItem('subscription', JSON.stringify(sub));
}
function getSubscription(){
    substr = localStorage.getItem('subscription');
    if( substr == null){
        return null;
    }
    sub = JSON.parse(substr);
    return sub;
}

navigator.serviceWorker.ready
    .then(function (registration) {
        return registration.pushManager.getSubscription()
            .then(async function (subscription) {
                if (subscription) {
                    console.log('got subscription!', subscription);
                    saveSubscription(subscription);
                    return subscription;
                }
                const response = await fetch('https://us-central1-digital-thermos-229002.cloudfunctions.net/tempPublicKey');
                const vapidPublicKey = await response.text();
                console.log('decoding:', vapidPublicKey)
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                console.log('got vapidPublicKey', vapidPublicKey, convertedVapidKey)

                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            });

    }).then(function (subscription) {
    console.log('register!', subscription)
    fetch('https://us-central1-digital-thermos-229002.cloudfunctions.net/pushRegister', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            subscription: subscription
        }),
    });

    document.getElementById('unsub').onclick = function () {
        var sub = getSubscription();
        if(sub != null){
            sub.unSubscribe().then(function(result){
                console.log('Unsubscribed');
            });
        }
    };

    document.getElementById('perm').onclick = function () {
        Notification.requestPermission(function(status) {
            console.log('Notification permission status:', status);
        });
    };

});

worker = navigator.serviceWorker.controller;

navigator.serviceWorker.addEventListener('message', function handler (event) {
    if (event.source !== worker) {
        return;
    }
    console.log(event.data);
    data = event.data;
    switch(data.deviceId){
        case 'kt1' :
            message = 'Temperature:' + data.temperature+'</br>';
            message += 'Reading time:' + data.readingDateTime+"</br>";
            document.getElementById('kettle').innerHTML = message;
            break;
        case 'th16-1':
            message = 'Temperature:' + data.temperature+'</br>';
            message += 'Humidity:' + data.humidity+'</br>';
            message += 'Reading time:' + data.readingDateTime+"</br>";
            document.getElementById('bedroom').innerHTML = message;
            break;
        case 'ws1':
            message = 'Outdoor Temperature:' + data.temperature+'</br>';
            message += 'Outdoor Humidity:' + data.humidity+'</br>';
            message += 'Inside Temperature:' + data.insideTemp+'</br>';
            message += 'Inside Humidity:' + data.insideHumidity+'</br>';
            message += 'Reading time:' + data.readingDateTime+"</br>";
            document.getElementById('lounge').innerHTML = message;
            break;
    }

});