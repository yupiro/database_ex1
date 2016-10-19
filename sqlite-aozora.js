

// パスの指定など
var FILES_DIR = __dirname + "/aozora";
var DB_PATH = __dirname + "/aozora.sqlite";

// モジュールの取り込み
var sqlite3 = require('sqlite3').verbose();
var cheerio = require('cheerio');
var fs = require('fs');

// DBに入れるファイル一覧を取得
var files = fs.readdirSync(FILES_DIR);
// console.log(files);
// HTMLファイルだけを残す
files = files.filter(function(s){
    return s.match(/\.html$/);
});
console.log(files);

// データベースを開く
var db = new sqlite3.Database(DB_PATH);

// データを登録
db.serialize(function(){
    // SQLを実行してテーブルを作成
    db.run("CREATE TABLE IF NOT EXISTS items(" +
    "item_id INTEGER PRIMARY KEY," +
    "author TEXT, title TEXT, body TEXT)");
    // 挿入用プリペアードステートメントを準備
    var ins_stmt = db.prepare(
        'INSERT INTO items(author, title, body)' +
        'VALUES(?, ?, ?)');
        // 各HTMLファイルを処理
        files.forEach(function(file, i, ar){
            var html = fs.readFileSync(FILES_DIR + "/" + file);
            // HTMLファイルから情報を得る
            var $ = cheerio.load(html);
            var title = $(".title").text();
            var author = $(".author").text();
            var body = $('body').text();
            // DBに挿入
            ins_stmt.run(author, title, body);
            console.log("+" + title + " を登録");
        });
        ins_stmt.finalize();
    });

    // 作者の出現回数を調べる
    console.log("集計結果:");
    db.each("SELECT author, COUNT(author) as cnt "
    + "FROM items GROUP BY author "
    + "ORDER BY cnt DESC",
    function (err, row) {
        console.log(row.cnt + "回：" + row.author);
    });


    // console.log("テスト");
    // db.each("SELECT * FROM items",function(err, row){
    //     console.log(row.author);
    // });
    // db.close();
