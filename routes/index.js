const express = require('express');
const router = express.Router();
const request = require('request');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql')
const bodyParser = require('body-parser');
let absolutePath = './musicSource';

let db = mysql.createPool({
	host: 'localhost',
	port: '3306',
	user: 'cloudMusic',
	password: 'chen7349058',
	database: 'cloudMusic'
})
// let db = mysql.createPool({
// 	host: 'localhost',
// 	port: '3306',
// 	user: 'root',
// 	password: 'chen7349058',
// 	database: 'cloudMusic'
// })
router.post('/getList.api', bodyParser.json(), (req, res) => {
		let idx = 0;
		fs.readdir('./musicSource', (err, songDir) => {
			if (err) {
				throw err;
			} else {
				for (let i = 0; i < songDir.length; i++) {
					let singleDirName = songDir[i];
					var stat = fs.lstatSync("./musicSource/" + singleDirName);
					if (singleDirName != '.DS_Store') {
						idx++;
						let isDirectory_c = stat.isDirectory();
						if (isDirectory_c) { //如果是文件夹
							let songList = fs.readdirSync(absolutePath + '/' + singleDirName);
							console.log(songList);
							for (let i = 0; i < songList.length; i++) {
								let songName = songList[i];
								if (songName != '.DS_Store') {
									db.query(`INSERT INTO songsList (
										songName,
										directory,
										dirindex
									)
									VALUES
									(
										'${songName}',
										'${absolutePath}/${singleDirName}/${songName}',
										'${idx}'
									)`, function (err, data) {
										if (err) {
											console.log('--------插入时候发生错误--------')
											console.log(err);
										} else {
											console.log('----插入成功-------')
										}
									})
								}
							}
						}
					}
				}
			}
		});
		res.send({
			status: 200,
			msg: 'success'
		})
	}),
	router.post('/getSongList.api', bodyParser.json(), (req, res) => {
		db.query(`SELECT * FROM songsList`, (err, data) => {
			if (err) console.log(err)
			res.send({
				status: 200,
				msg: data
			});
		})
	})


router.get('/getSource.api', function (req, res) {
	let url = (req.query.url);
	console.log(url);
	res.writeHead(200, {
		'Content-Type': 'audio/mpeg'
	});
	var rs = fs.createReadStream('.' + url);
	rs.pipe(res);
	rs.on('end', function () {
		res.end();
		console.log('end call');
	});
});


// router.get('/', bodyParser.json(), function (req, res, next) {
// 	res.render('index', {
// 		title: 'Express'
// 	});
// });
// router.post('/list.api', bodyParser.json(), (req, res, next) => {
// 	let newList = [];
// 	// 递归创建目录 同步方法
// 	for (let i = 0; i < req.body.list.length; i++) {
// 		let cell = req.body.list[i];
// 		newList.push(encodeURI(cell));
// 	};

// 	// 同步创建文件夹
// 	function mkdirsSync(dirname) {
// 		if (fs.existsSync(dirname)) {
// 			return true;
// 		} else {
// 			if (mkdirsSync(path.dirname(dirname))) {
// 				fs.mkdirSync(dirname);
// 				return true;
// 			}
// 		}
// 	}

// 	function getSource(url) {
// 		return new Promise(function (resolve, reject) {
// 			let readStream = request(url);
// 			let urlMsg = url.split('/');
// 			let albumName = urlMsg[urlMsg.length - 2];
// 			let songName = urlMsg[urlMsg.length - 1];
// 			mkdirsSync(decodeURI(albumName));
// 			let writeStream = fs.createWriteStream(`./${decodeURI(albumName)}/` + decodeURI(songName));
// 			readStream.pipe(writeStream);
// 			readStream.on('finish',
// 				function (res) {
// 					resolve(decodeURI(songName));
// 					writeStream.end();
// 				})
// 			readStream.on('error',
// 				function (err) {
// 					console.log(`${decodeURI(songName)}文件写入失败`);
// 					reject(url);
// 					writeStream.end();
// 				})
// 		})
// 	}
// 	getSource(encodeURI('http://yoerking.com/static/b/music/自由科学民主/李志 - 这个世界会好吗 (相信未来版).mp3')).then(res => {
// 		console.log(res);
// 	}).catch(err => {
// 		console.log(err);
// 	})
// 	res.send({
// 		status: 200,
// 		msg: 'success'
// 	});
// });
module.exports = router;