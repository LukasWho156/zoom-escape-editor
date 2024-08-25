const Jimp = require('jimp');

const createImage = (width, height) => {
    return new Promise((resolve, reject) => {
        new Jimp(width, height, (err, image) => {
            if(err) {
                reject('error creating image');
            } else {
                resolve(image);
            }
        })
    })
}

const createMipmaps = async (inputFile, outputFile, target, noLevels) => {
    console.log('reading source image ...');
    const image = await Jimp.read(inputFile);
    const targetSize = image.bitmap.width / (1 << noLevels);
    let scale = 1;
    const maxOffset = (1 << noLevels)- 1;
    let offset = maxOffset;
    for(let level = 0; level < noLevels; level++) {
        console.log('generating room image at level ' + level + '...', offset);
        const dest = await createImage(targetSize, targetSize);
        await dest.blit(image, 0, 0, offset / maxOffset * scale * target.x, offset / maxOffset * scale * target.y, targetSize, targetSize);
        await dest.write(`${outputFile}-${level}.png`);
        image.scale(0.5);
        scale *= 0.5
        offset -= (1 << level);
    }
    console.log('all done!');
}

module.exports = createMipmaps;