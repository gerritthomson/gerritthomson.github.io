/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var idbApp = (function() {
  'use strict';

  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  var dbPromise = idb.open('weather', 2, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        // a placeholder case so that the switch block will
        // execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log('Creating the temperatures object store');
        upgradeDb.createObjectStore('houseTemps',{keyPath: 'createdAt'});
        upgradeDb.createObjectStore('options',{keyPath: 'key'});
    }
  });

  function addTemps(temps) {
    dbPromise.then(function(db) {
      var tx = db.transaction('houseTemps', 'readwrite');
      var store = tx.objectStore('houseTemps');
      return Promise.all(temps.map(function(item) {
          console.log('Adding item: ', item);
          return store.put(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        console.log('All items added successfully!');
      });
    });
  }

  function setOption(key, value) {
    return dbPromise.then(function(db) {
      var tx = db.transaction('options', 'readwrite');
      var store = tx.objectStore('options');
      var option = { key:key, value:value };
      return store.put(option);
    });
  }
  function getOption(key) {
    return dbPromise.then(function(db) {
      var tx = db.transaction('options', 'readonly');
      var store = tx.objectStore('options');
//      var index = store.index('key');
      return store.get(key);
    });
  }

  function displayByName() {
    var key = document.getElementById('name').value;
    if (key === '') {return;}
    var s = '';
    getByName(key).then(function(object) {
      if (!object) {return;}

      s += '<h2>' + object.name + '</h2><p>';
      for (var field in object) {
        s += field + ' = ' + object[field] + '<br/>';
      }
      s += '</p>';

    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByPrice() {
    var lower = document.getElementById('priceLower').value;
    var upper = document.getElementById('priceUpper').value;
    var lowerNum = Number(document.getElementById('priceLower').value);
    var upperNum = Number(document.getElementById('priceUpper').value);

    if (lower === '' && upper === '') {return;}
    var range;
    if (lower !== '' && upper !== '') {
      range = IDBKeyRange.bound(lowerNum, upperNum);
    } else if (lower === '') {
      range = IDBKeyRange.upperBound(upperNum);
    } else {
      range = IDBKeyRange.lowerBound(lowerNum);
    }
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('price');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);
      s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
      for (var field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';
      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByDesc() {
    var key = document.getElementById('desc').value;
    if (key === '') {return;}
    var range = IDBKeyRange.only(key);
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('description');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);
      s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
      for (var field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';
      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }


  function getAllTemps() {
    return dbPromise.then(function(db) {
      var tx = db.transaction('houseTemps', 'readonly');
      var store = tx.objectStore('houseTemps');
      return store.getAll();
    });
  }
  function getLastTemp(element) {
    return dbPromise.then(function(db) {
      var tx = db.transaction('houseTemps', 'readonly');
      var store = tx.objectStore('houseTemps');
      var index = store.index('');

      return store.getAll();
    });
  }

  return {
    dbPromise: (dbPromise),
    addTemps: (addTemps),
    getAllTemps: (getAllTemps),
    getOption: (getOption),
    setOption: (setOption)
  };
})();
