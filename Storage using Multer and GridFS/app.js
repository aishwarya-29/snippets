var express = require("express"),
	app = express(),
	path = require("path"),
	crypto = require("crypto"),
	mongoose = require("mongoose"),
	multer = require("multer"),
	GridFsStorage = require("multer-gridfs-storage"),
	Grid = require("gridfs-stream"),
	methodOverride = require("method-override"),
	bodyParser = require("body-parser");

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(methodOverride("_method"));

//MONGO URI
var mongoURI = "YOUR-MONGO-URI";

//create mongo connection
const conn = mongoose.createConnection(mongoURI);

//initialise gfs
let gfs;

conn.once('open', function(){
	// initialised stream
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection("uploads");
});

//create storage engine

var storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

app.get("/", function(req,res){
	gfs.files.find().toArray(function(err,images){
		if(err) {
			console.log(err);
		} else {
			if(!images || images.length === 0 ) {
				res.render("index", {files:false});
			} 
			else {
				images.map(file => {
				if(file.contentType === 'image/png' || file.contentType === 'image/jpeg' || file.contentType === 'image/jpg') {
					file.isImage = true;
				} else {
					file.isImage = false;
				}
				});
				res.render("index", {files: images});
	
		}
		}
	});
});

app.post("/upload", upload.single('file'), function(req,res){
	//res.json({file: req.file});
	res.redirect("/");
});

app.get("/images", function(req,res) {
	gfs.files.find().toArray(function(err,images){
		if(err) {
			console.log(err);
		} else {
			if(!images || images.length === 0 ) {
				return res.status(404).json({
					err: "No files exist"
				});
			} 
			
			return res.json(images);
		}
	});
});

app.get("/images/:filename", function(req,res){
	gfs.files.findOne({filename: req.params.filename}, function(err, image){
		if(err) {
			console.log(err);
		} else {
			if(!image || image.length === 0) {
				console.log("some error");
				return res.redirect("/");
			} 
			
			// check if image 
			if(image.contentType === 'image/png' || image.contentType === 'image/jpeg' || image.contentType === 'image/jpg') {
				//Read output to browser
				var readStream = gfs.createReadStream(image.filename);
				readStream.pipe(res);
			}
			else {
				res.status(404).json({err: "Not an image"});
			}
		}
	});
});

const port = 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));