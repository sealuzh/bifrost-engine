import Datastore from 'nedb'

//var db = new Datastore({ filename: 'releases.db', autoload: true });
var db = new Datastore(); // in-memory

export default {
    releases: db
}