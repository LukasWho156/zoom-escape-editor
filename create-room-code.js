const createRoomCode = (room) => {
    const id = room.id;
    const idUpper = id.charAt(0).toUpperCase() + id.slice(1);
    let fileContents = `import { Room } from './room.ts'\n`;
    fileContents += `import { SPRITES } from '../sprites/sprite-db.ts'\n\n`;
    for(let i = 0; i < 3; i++) {
        fileContents += `import ${id}${i} from '../assets/rooms/${id}-${i}.png';\n`;
    }
    fileContents += '\n'
    fileContents += `const ${idUpper} = new Room(\n`;
    fileContents += `   '${id}',\n`;
    for(let i = 0; i < 3; i++) {
        fileContents += `   ${id}${i},\n`;
    }
    fileContents += `   [`;
    for(const exit of room.exits) {
        fileContents += `{\n`;
        fileContents += `       target: '${exit.target}',\n`;
        fileContents += `       open: ${exit.open},\n`;
        fileContents += `       position: { x: ${exit.x / 8 + 1 / 16}, y: ${(7 - exit.y) / 8 + 1 / 16}},\n`;
        fileContents += `   }, `;
    }
    fileContents += '],\n   [';
    for(const sprite of room.sprites) {
        fileContents += `{\n`;
        fileContents += `       sprite: SPRITES['${sprite.id}'],\n`;
        fileContents += `       x: ${sprite.x},\n`;
        fileContents += `       y: ${sprite.y},\n`;
        fileContents += `   }, `;
    }
    fileContents += ']\n';
    fileContents += ');\n\n';
    fileContents += `export { ${idUpper} };`
    return fileContents;
}

const testRoom = {
    id: 'lobby',
    exits: [{
        target: 'mousehole',
        open: true,
        x: 5, y: 6
    }, {
        target: 'painting',
        open: false,
        x: 5, y: 2
    }],
    sprites: [{
        id: 'fishing-line',
        x: 512,
        y: 256,
    }]
};

module.exports = createRoomCode;