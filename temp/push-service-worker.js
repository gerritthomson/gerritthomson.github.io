self.addEventListener('push', function (event) {
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
});