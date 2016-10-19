

var levelup = require('level');

// データベース開く
var opt = { valueEncoding: 'json' };
var db = levelup('./testdb2', opt);

// 一括で値を指定
db.batch()
    .put('fruits!apple', {
        name: 'Apple',
        price: 300,
        color: 'red'
    })
    .put('fruits!orange', {
        name: 'Orange',
        price: 180,
        color: 'orange'
    })
    .put('fruits!banana', {
        name: 'Banana',
        price: 200,
        color: 'yellow'
    })
    .put('fruits!kiwi', {
        name: 'Kiwi',
        price: 220,
        color: 'green'
    })
    .put('snack!poteto', {
        name: 'Poteto-Snack',
        price: 340,
        color: 'brown'
    })
    .put('snack!choco', {
        name: 'Choco-Snack',
        price: 220,
        color: 'black'
    })
    .write(testKeys);

    // キーの一覧を取得する
    function testKeys() {
        console.log("keys:")
        db.createKeyStream()
        .on('data', function(key){
            console.log(" - " + key);
        })
        .on('end', testKeyValues);
    }

    // キーと値の一覧を取得する
    function testKeyValues() {
        console.log('\nkey-value-list.');
        db.createReadStream()
        .on('data', function(data){
            var key = data.key;
            var o = data.value;
            console.log("+key=" + data.key);
            console.log("| color=" + o.color);
            console.log("| price=" + o.price);
        })
        .on('end', testSearch);
    }

    // 検索を行う
    function testSearch() {
        console.log('\nrange-search:');
        var opt = {
            start : "fruits!",
            end : "fruits!\xFF"
        };
        db.createReadStream(opt)
        .on('data',function(data){
            console.log("+ key=" + data.key);
        })
        .on('end',function(){
            console.log('ok')
        });
    }