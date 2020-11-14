  import { openDB, deleteDB, wrap, unwrap } from 'https://unpkg.com/idb?module';
  export { storeData, getDataFromStore };
/*  async function doDatabaseStuff() {
    const db = await openDB(…);
  }
  */
  async function storeData(data){
	const db = await openDB('temps',1, {
		upgrade(db, oldVersion, newVersion, transaction ){
			var objectStore = db.createObjectStore('houseTemps',{keyPath: 'id', autoIncrement: true});
		}
	});
	const tx = db.transaction('houseTemps','readwrite');
	
	var putp = [];
	data.forEach(item =>{
		putp.push( tx.store.add(item) );
	});
	putp.push(tx.done);
	await Promise.all(putp);
  }
  
  async function getDataFromStore(){
  }
