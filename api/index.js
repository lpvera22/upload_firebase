require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
var fs = require('fs');
var archiver = require('archiver');
const port = process.env.API_PORT || 8080;
var path = require('path')
var admin = require("firebase-admin");
const uuid = require('uuid-v4');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => res.send('Welcome to this file upload API :)'));
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "fir-react-upload-c784e.appspot.com"
});

// Create new storage instance with Firebase project credentials
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_APPLICATION_CREDENTIALS,
});

// // Create a bucket associated to Firebase storage bucket
// const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET_URL);

var bucket = admin.storage().bucket();
// Initiating a memory storage engine to store files as Buffer objects


var storageM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) 
  }
})

var uploader = multer({ storage: storageM });

// Upload endpoint to send file to Firebase storage bucket
app.post('/api/upload', uploader.array('image'), async (req, res, next) => {
  
  
  try {
    if (!req.files) {
      res.status(400).send('Error, could not upload the files');
      
      return;
    }
    if (req.files.length==1){
      console.log(req.files[0])
      var filename = req.files[0].path
      const metadata = {
        metadata: {
          // This line is very important. It's to create a download token.
          firebaseStorageDownloadTokens: uuid()
        },
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      };
      // Uploads a local file to the bucket
      await bucket.upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        metadata: metadata,

      });

      console.log(`${filename} uploaded.`);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURI(req.files[0].filename)}?alt=media`;
        
        
        
      
      res
        .status(200)
        .send({ fileName: req.files[0].originalname, fileLocation: publicUrl });
      
      
    }else if(req.files.length>1){
      var name=Date.now()
      var output = fs.createWriteStream('./uploads/'+name+'.zip');
      var archive = archiver('zip', {
          gzip: true,
          zlib: { level: 9 } // Sets the compression level.
      });
      archive.on('error', function(err) {
        throw err;
      });
      
      // pipe archive data to the output file
      archive.pipe(output);
      for (i = 0; i < req.files.length; i++) {
        archive.file(req.files[i].path, {name: req.files[i].filename});
        
        
      }
      
      archive.finalize();
      var filename = 'uploads/'+name+'.zip'
      const metadata = {
        metadata: {
          // This line is very important. It's to create a download token.
          firebaseStorageDownloadTokens: uuid()
        },
        contentType: 'application/zip'
       
      };
      await bucket.upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        // gzip: true,
        metadata: metadata,

      });
      console.log(`${filename} uploaded.`);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURI(name+'.zip')}?alt=media`;
        
        
        
      
      res
        .status(200)
        .send({ fileName: name, fileLocation: publicUrl });
      // // Create new blob in the bucket referencing the file
      // const blob = bucket.file(name+'.zip');
      // console.log(blob.name)
      // // Create writable stream and specifying file mimetype
      // const blobWriter = blob.createWriteStream({
      //   metadata: {
      //     contentType: 'application/zip',
      //   },
      // });
    
    
      // blobWriter.on('error', (err) => next(err));
      
      
      // blobWriter.on('finish', () => {
        
      //   // Assembling public URL for accessing the file via HTTP
      //   const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
      //     bucket.name
      //   }/o/${encodeURI(blob.name)}?alt=media`;
        
      //   // Return the file name and its public URL
        
      
      //   res
      //     .status(200)
      //     .send({ fileName: blob.name, fileLocation: publicUrl });
      // });
      // var buffer = fs.readFileSync('./uploads/'+name+'.zip');
      // // When there is no more data to be consumed from the stream
      // blobWriter.end(buffer);
      

    
    
          
      
    


    }

    
    
    
  } catch (error) {
    res.status(400).send(`Error, could not upload file: ${error}`);
    return;
  }
});

app.listen(port, () =>
  console.log(`File uploader API listening on port ${port}`)
);
