self.addEventListener('push', function (event) {
    clients.matchAll().then(function(c) {
        if (c.length === 0) {
            // Show notification
            const payload = event.data ? event.data.text() : 'no payload';
            let reading = JSON.parse(payload);
            let notice = 'Dev:'+ reading.deviceId + ' Temp:' + reading.temperature;
            if( reading.insideTemp != undefined){
                notice += ' Inside:' + reading.insideTemp;
            }
            event.waitUntil(
                self.registration.showNotification('Weather on Pebble', {
                    body: notice,
                    tag: reading.deviceId
                })
            );
        } else {
            // Send a message to the page to update the UI
            console.log('Application is already open!');
            const payload = event.data ? event.data.text() : 'no payload';
            let reading = JSON.parse(payload);
            c.map(client => client.postMessage(reading));
        }
    });


});