const fs = require('fs');
const Queryset = require('./queryset');

class Table {

    constructor(tablePath){
        this.tablePath = tablePath;
        this.tableName = this.tablePath.substring(0, this.tablePath.length - 5);
        this.paginate_by = Infinity;
    }

    insert(object){
        let document =  fs.readFileSync(this.tablePath, 'utf8');
        document = JSON.parse(document);
        if(Array.isArray(document)){
            if(object.hasOwnProperty('id')){
                delete object.id;
            }
            object.id = document.length + 1;
            document.push(object);
            document = JSON.stringify(document);
            fs.truncateSync(this.tablePath, 0);
            fs.writeFileSync(this.tablePath, document);
        }
    }

    findById(id){
        return (new Queryset(this.tablePath)).findById(id);
    }

    deleteById(id){
        // if(!(typeof id != 'number') || id != id || id % 1 != 0){
        //     throw TypeError(this.tableName + '.findById: id should be a valid Integer(' + id + ' given)');
        // }
        let document = fs.readFileSync(this.tablePath, 'utf8');
        document = JSON.parse(document);
        for(var i = 0; i < document.length; i++){
            if(document[i].id === id){
                document.splice(i, 1);
            }
        }
        fs.truncateSync(this.tablePath, 0);
        fs.writeFileSync(this.tablePath, JSON.stringify(document));
    }

    filter(object){
        return (new Queryset(this.tablePath, this.paginate_by)).filter(object);
    }

    exclude(object){
        return (new Queryset(this.tablePath, this.paginate_by)).exclude(object);
    }

    all(page){
        return (new Queryset(this.tablePath, this.paginate_by)).all();
    }



}

class Djengah {

    constructor() {
        this.dbPath = null;
    }

    createDb(dbName) {
        if(fs.existsSync(dbName)) {
            throw ReferenceError('A db with this name already exists');
        }
        fs.mkdirSync(dbName);
    }

    useDb(dbName) {
        if(!fs.existsSync(dbName)) {
            throw ReferenceError(dbName + ' does not exist');
        }
        this.dbPath = dbName;
        var files = fs.readdirSync(this.dbPath);
        files.forEach(file => {
            if(file.endsWith('.json')){
                this[file.substring(0, file.length - 5)] = new Table(this.dbPath + '/' + file);
            }
        });
    }

    createTable(tableName) {
        if (this.dbPath === null) {
            throw ReferenceError('You have to use an existing database or create a new one. Use createDb and useDb commands');
        }
        if (fs.existsSync(this.dbPath + '/' + tableName)){
            throw ReferenceError('Table ' + tableName + ' already exists')
        }
        fs.writeFileSync(this.dbPath + '/' + tableName + '.json', '[\n]');
    }
}

const db = new Djengah();
db.useDb('second');
// db.cars.paginate_by = 2;
//
// for(var i = 0; i < 50; i++){
//     db.users.insert({'first_name': 'Armen', 'last_name': 'Vardanyan'});
// }

// db.cars.insert({'model': 'Jeep', 'maxSpeed': 250});

console.log(db.cars.all());

module.exports = db;



