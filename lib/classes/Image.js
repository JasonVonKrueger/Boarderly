const fs = require('fs');
const Jimp = require('jimp');

module.exports = class Image {
  constructor() {
    // initialize thumbnails
    this.createThumbs();
  }

  createThumbs = function() {
    // loop through the albums and create a thumbs directory
    const base_path = './_ALBUMS_';
    const albums = fs.readdirSync(base_path);

    albums.forEach(function(dir) {
      if (!dir.startsWith('.')) {
        const thumb_path = `${base_path}/${dir}/@thumbs`;
        if (!fs.existsSync(thumb_path)) {
          fs.mkdirSync(thumb_path);
        }

        // make the thumbnails
        
      }
    });

  }

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