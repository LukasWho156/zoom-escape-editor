const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const createRoomCode = require('./create-room-code');
const createMipmaps = require('./create-mipmaps');

const app = express();
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('input'));

app.get('/api/availableRooms/', async (req, res) => {
    const dir = await fs.readdir('./input/rooms');
    res.json(dir.map(f => f.split('-')[0]));
})

app.post('/api/loadRoom/', async(req, res) => {
    try {
        const file = await fs.readFile(`./input/definitions/${req.body}.json`);
        res.json(JSON.parse(file));
    } catch(e) {
        res.json({exits: [], sprites: []})
    }
})

app.post('/api/saveRoom/', async(req, res) => {
    const room = req.body;
    let existing = [];
    room.sprites = room.sprites.filter(s => {
        if(existing.find(e => e === s.id)) {
            return false;
        }
        existing.push(s.id);
        return true;
    })
    const code = createRoomCode(room);
    const promises = [
        fs.writeFile(`./output/rooms/${room.id}.js`, code),
        fs.writeFile(`./input/definitions/${room.id}.json`, JSON.stringify(room)),
    ];
    await Promise.all(promises);
    res.send('OK');
})

app.post('/api/saveMipmaps/', async(req, res) => {
    const room = req.body;
    const promises = room.exits.map(exit => {
        return createMipmaps(
            `./input/rooms/${room.id}-full.png`,
            `./output/images/${exit.target}`,
            {x: exit.x * 1024, y: exit.y * 1024},
            3
        );
    });
    await Promise.all(promises);
    res.send('OK');
})

app.listen(3000, () => console.log('Listening!'));