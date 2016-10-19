// var FILE_DIR = __dirname + "/aozora"
var DB_PATH = __dirname + "/aozora.sqlite";

var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(DB_PATH);


db.each("DESC items",function(err, row){
    console.log();
});
// console.log("テスト");
// db.each("SELECT * FROM items",function(err, row){
//     console.log(row.author);
// });



db.close();