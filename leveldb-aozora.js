// ダウンロードしたファイルをLevelDBに流し込む

// パスの指定など
var FILES_DIR = __dirname + "/aozora";
var DB_DIR = __dirname + "/leveldb-aozora";

var levelup = require('level');
var cheerio = require('cheerio');
var fs = require('fs');

// データベースを開く
var db = levelup(DB_DIR);

// DBに入れるファイル一覧を取得
var files = fs.readdirSync(FILES_DIR);
// HTMLファイルだけ残す
files = files.filter(function (s) {
    return s.match(/\.html$/);
});

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


// db.createReadStream()
// .on('data', function(data) {
//     console.log("key=" + data.key);
// })
// .on('error', function(err){
//     console.log('Oh my!', err);
// })
// .on('close', function(){
//     console.log('Stream closed' );
// })
// .on('end', function(){
//     console.log('Stream ended');
// })



// 処理を待つ
var wait_proc = function () {
    if (files.length == count) {
        testSearch(); return;
    }
    setTimeout(wait_proc, 100);
};
wait_proc();

// console.log("---------");
// 作者から作品一覧を検索
function testSearch() {
    console.log("\n夏目漱石の作品一覧");
    var opt = {
        start: '夏目漱石:',
        end: '夏目漱石:\uFFFF'
    };
    db.createReadStream(opt)
        .on('data', function (data) {
            console.log(" - " + data.key);
        })
        .on('end', testSearch2);
}

// 作品で検索する
function testSearch2() {
    var title = '注文の多い料理店';
    console.log("\n作品名[" + title + "]で検索:");
    var opt = {
        gte: 'idx-title'+title,
        lte: 'idx-title'+title+"\uFFFF"
    };
    db.createReadStream(opt)
        .on("data", function (data) {
            console.log(" - " + data.value);
        })
        .on("end", testSearch3);
}

// 正規表現で作品を検索
function testSearch3() {
    console.log("\nひらがなの作品を検索");
    var opt = {
        gte: 'idx-title:',
        lte: 'idx-title:\uFFFF'
    };
    var hiragana_re = /^[ぁ-ん]+$/;
    db.createReadStream(opt)
        .on("data", function (data) {
            var params = data.key.split(":");
            var title = params[1];
            if (!hiragana_re.test(title)) return;
            console.log(" - " + data.value);
        })
}