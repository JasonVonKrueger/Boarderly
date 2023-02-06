const fs = require('fs');
const Jimp = require('jimp');

module.exports = class ImageWorker {
  constructor() {
    this.path = './.stores/albums';

    // initialize thumbnails
    //this.createThumbs();
  }

//   createThumbs = async function() {
//     // loop through the albums and create a thumbs directory
//     //const albums = fs.readdirSync(this.path);
//     const { readdir } = require('fs').promises;

//     let items = await readdir(this.path);
//     for (const item of items) {
//         if (!item.startsWith('.')) {
//             const thumb_path = `${this.path}/${dir}/@thumbs`;

//         }

//         fs.readFile(this.path + item, 'utf8', function(err, message) {
//             if (err) console.log(err);

//             results.push(JSON.parse(message));
//         });
//     }

//     albums.forEach(function(dir) {
//       if (!dir.startsWith('.')) {
//         const thumb_path = `${this.path}/${dir}/@thumbs`;
//         if (!fs.existsSync(thumb_path)) {
//           fs.mkdirSync(thumb_path);
//         }

//         // make the thumbnails
        
//       }
//     });

//   }

  shrink = function(image, path, w, h) {
    Jimp.read(image)
      .then(function (result) {
        return result
          .resize(w, h)
          .quality(90)
          .write(path);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
}