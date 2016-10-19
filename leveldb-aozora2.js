// ダウンロードしたファイルをLevelDBに流し込む

// パスの指定など
var FILES_DIR = __dirname + "/aozora";
var DB_DIR = __dirname + "/leveldb-aozora";

var levelup = require('level');
var cheerio = require('cheerio');
var fs = require('fs');

// データベースを開く
// var opt = { valueEncording: 'json' };
// var db = levelup(DB_DIR, opt);
var db = levelup(DB_DIR);



// DBに入れるファイル一覧を取得
var files = fs.readdirSync(FILES_DIR);
// HTMLファイルだけ残す
files = files.filter(function (s) {
    return s.match(/\.html$/);
});

// console.log(files);

// 各ファイルのデータをDBに入れる
var count = 0;
files.forEach(function (file, i, ar) {
    // ファイルを開く
    var html = fs.readFileSync(FILES_DIR + "/" + file);
    // HTMLファイルから情報を得る
    var $ = cheerio.load(html);
    var title = $(".title").text();
    var author = $(".author").text();
    var body = $('body').text();
    // データベースに入れる
    // 「作者：作品名」で入れる
    var key = author + ":" + title;
    db.put(key, body, function() { count++; });
    // 作品名で検索できるようにも配慮
    var key2 = "idx-title" + title + ":" + author;
    db.put(key2, key);
    // console.log(key);
});

db.createReadStream()
.on('data', function(data) {
    // console.log(data.key , '=', data.value);
     console.log("key: " +data.key);
})
.on('error', function(err){
    console.log('Oh my!', err);
})
.on('close', function(){
    console.log('Stream closed' );
})
.on('end', function(){
    console.log('Stream ended');
})
