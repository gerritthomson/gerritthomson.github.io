self.importScripts("idb.js");
self.importScripts("main.js");
self.addEventListener('activate', function(event) {
    event.waitUntil(
        idbApp.open()
    );
});
self.addEventListener('sync', function(event) {
    if (event.tag == 'getAndStoreData') {
        event.waitUntil(getAndStoreData());
    }
});

function getAndStoreData(){
    var numToGet = 10;
    var srcHref = "https://us-central1-digital-thermos-229002.cloudfunctions.net/getLastLog?dev=ws1&num=";


    fetch(srcHref + numToGet)
        .then(response =>{
            console.log(response);
            return response.json();
        } )
        .then(data => {
            idbApp.addTemps(data);
            return data.shift();
        })
        .then(data => {
            idbApp.setOption('latest', data);
        });
}
