const fs = require('fs');

function match(document, query) {
    let matches = true;
    for(var option in query){
        if(query.hasOwnProperty(option)){
            let like = false;
            let gt = false;
            let nothingSpecial = true;
            if(option.endsWith('__contains')){
                like = true;
                option = option.substring(0, option.length - 10);
                nothingSpecial = false;
            }
            if(option.endsWith('__gt')){
                gt = true;
                option = option.substring(0, option.length - 4);
                nothingSpecial = false;
            }
            if(nothingSpecial){
                console.log('aaaa', document[option], query[option])
                if(document[option] != query[option]){
                    matches = false;
                    break;
                }
            } else {
                if(like){
                    if(typeof document[option] != 'string'){
                        throw TypeError('You can only search for substrings if the db value is a string');
                    }
                    if(!document[option].includes(query[option + '__contains'])){
                        matches = false;
                        break;
                    }
                }
                if(gt){
                    if(typeof document[option] != 'number'){
                        throw TypeError('You can only search for greater than number if the db value is a number')
                    }
                    if(!document[option] > query[option + '__gt']){
                        matches = false;
                        break;
                    }
                }
            }

        }
    }
    console.log(matches)
    return matches;
}

class Queryset {

    constructor(tablePath, paginate_by){
        this.tablePath = tablePath;
        this.queryset = null;
        this.filterOptions = {};
        this.excludeOptions = {};
        this.paginate_by = paginate_by || Infinity;
    }

    findById(id){
        // if(!(typeof id != 'number') || id != id || id % 1 != 0){
        //     throw TypeError(this.tableName + '.findById: id should be a valid Integer(' + id + ' given)');
        // }
        let document = fs.readFileSync(this.tablePath, 'utf8');
        document = JSON.parse(document);
        for(var i = 0; i < document.length; i++){
            if(document[i].id === id){
                return document[i];
            }
        }
    }

    filter(options){
        for(var option in options){
            if(options.hasOwnProperty(option)){
                this.filterOptions[option] = options[option];
            }
        }

        return this;
    }

    exclude(options){
        for(var option in options){
            if(options.hasOwnProperty(option)){
                this.excludeOptions[option] = options[option];
            }
        }

        return this;
    }

    remove(){
        let document = JSON.parse(fs.readFileSync(this.tablePath));
        if(Array.isArray(document)){
            for(var i = 0; i < document.length; i++){
                if(document[i] == null){
                    continue;
                }
                if(match(document[i], this.filterOptions) && !match(document[i], this.excludeOptions)){
                    document[i] = null;
                }
            }

            fs.truncateSync(this.tablePath, 0);
            fs.writeFileSync(this.tablePath, JSON.stringify(document));
        }
    }

    update(object){
        let document = JSON.parse(fs.readFileSync(this.tablePath));
        if(Array.isArray(document)){
            for(var i = 0; i < document.length; i++){
                if(document[i] == null){
                    continue;
                }
                console.log(object)
                if(match(document[i], this.filterOptions) && match(document[i], this.excludeOptions)){

                    for(var prop in object){
                        if(object.hasOwnProperty(prop)){
                            document[i][prop] = object[prop];
                        }
                    }
                }
            }

            fs.truncateSync(this.tablePath, 0);
            fs.writeFileSync(this.tablePath, JSON.stringify(document));
        }
    }

    first(){
        let document =  fs.readFileSync(this.tablePath, 'utf8');
        document = JSON.parse(document);

        if(Array.isArray(document)){
            let returnable = [];
            for(var i = 0; i < document.length; i++){
                if(document[i] == null){
                    continue;
                }
                if(match(document[i], this.filterOptions) && !match(document[i], this.excludeOptions)){
                    return document[i];
                }
            }
        }
        return {};
    }

    all(page){
        page = page || 1;
        let document =  fs.readFileSync(this.tablePath, 'utf8');
        document = JSON.parse(document);
        let count = 0;

        if(Array.isArray(document)){
            let returnable = [];
            for(var i = 0; i < document.length; i++){
                if(document[i] == null){
                    continue;
                }
                if(match(document[i], this.filterOptions) && !match(document[i], this.excludeOptions)){
                    returnable.push(document[i]);
                    count++;
                }
                if(count == this.paginate_by){
                    break;
                }
            }
            this.queryset = returnable;
        }
        return this.queryset;
    }


}

module.exports = Queryset;