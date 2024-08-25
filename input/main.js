const SPRITES = {
    'bucket': 'bucket',
    'cat-sleeping': 'cat-sleeping',
    'cat-awake': 'cat-awake',
    'code': 'code',
    'crowbar': 'crowbar',
    'darkness': 'darkness',
    'door': 'door',
    'fire': 'fire',
    'fishing-line': 'fishing-line',
    'fishing-rod': 'fishing-rod',
    'flag': 'flag',
    'flowerpot': 'flowerpot',
    'girl': 'girl',
    'goop': 'goop',
    'keyboard': 'keyboard',
    'lid': 'lid',
    'matches': 'matches',
    'painted-three': 'painted-three',
    'seed': 'seed',
    'water': 'water',
    'well-rope': 'well-rope',
    'woodboards': 'woodboards',
    'worm': 'worm',
}

const room = {
    id: 'none',
    exits: [],
    sprites: [],
};

let curExit = {};

const fillGrid = () => {
    const grid = document.getElementById('imageGrid');
    for(let y = 0; y < 8; y++) {
        for(let x = 0; x < 8; x++) {
            const item = document.createElement('div');
            item.className = 'gridItem'
            item.id = `gi${x}${y}`;
            item.addEventListener('click', () => {
                item.classList.add('exit');
                showEditDialog(x, y);
            })
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                removeExit(x, y);
            })
            grid?.appendChild(item);
        }
    }
}

const fillRoomSelection = () => {
    fetch('http://localhost:3000/api/availableRooms').then(res => {
        return res.json();
    }).then(rooms => {
        const roomSelect = document.getElementById('roomSelect');
        const eedSelect = document.getElementById('eedTarget');
        for(const r of rooms) {
            const item = document.createElement('option');
            item.value = r;
            item.selected = (r === room.id);
            item.textContent = r;
            roomSelect.append(item);
            eedSelect.append(item.cloneNode(true));
        }
    })
}

const showEditDialog = (x, y) => {
    curExit = room.exits.find(e => e.x === x && e.y === y);
    console.log(curExit);
    if(!curExit) {
        curExit = {target: '', open: true, x: x, y: y};
        room.exits.push(curExit);
    }
    document.getElementById('editExitDialog').showModal();
    document.getElementById('eedTarget').value = curExit.target;
    document.getElementById('eedOpen').checked = curExit.open;
}

const editExit = () => {
    curExit.target = document.getElementById('eedTarget').value;
    curExit.open = document.getElementById('eedOpen').checked;
    if(curExit.target === '') {
        removeExit(curExit.x, curExit.y);
    }
}

const removeExit = (x, y) => {
    room.exits = room.exits.filter(e => e.x !== x || e.y !== y);
    document.getElementById(`gi${x}${y}`).classList.remove('exit');
}

const loadRoom = (id) => {
    room.id = id;
    for(const e of room.exits) {
        document.getElementById(`gi${e.x}${e.y}`).classList.remove('exit');
    }
    document.getElementById('spriteOverlay').innerHTML = '';
    room.exits.length = 0;
    room.sprites.length = 0;
    curExit = {};
    document.getElementById('mainImage').src = `./rooms/${id}-full.png`;
    fetch('http://localhost:3000/api/loadRoom/', {
        method: 'POST',
        body: id,
    }).then(res => {
        return res.json();
    }).then(def => {
        for(const exit of def.exits) {
            room.exits.push(exit);
            document.getElementById(`gi${exit.x}${exit.y}`).classList.add('exit');
        }
        for(const sprite of def.sprites) {
            room.sprites.push(sprite);
            addSprite(sprite)
        }
    });
}

const saveRoom = () => {
    document.getElementById('workingDialog').showModal();
    fetch('http://localhost:3000/api/saveRoom/', {
        method: 'POST',
        body: JSON.stringify(room),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(() => document.getElementById('workingDialog').close());
}

const saveMipmaps = () => {
    document.getElementById('workingDialog').showModal();
    fetch('http://localhost:3000/api/saveMipmaps/', {
        method: 'POST',
        body: JSON.stringify(room),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(() => document.getElementById('workingDialog').close());
}

const spriteSelect = document.getElementById('addSpriteSelect');
for(const sprite in SPRITES) {
    const item = document.createElement('option');
    item.value = sprite;
    item.textContent = sprite;
    spriteSelect.append(item);
}

const addSprite = (sprite) => {
    const img = document.createElement('img');
    img.src =`./sprites/${SPRITES[sprite.id]}.png`;
    img.className = 'sprite';
    img.style.left = `${sprite.x}px`;
    img.style.bottom = `${sprite.y}px`;
    document.getElementById('spriteOverlay').appendChild(img);
    room.sprites.push(sprite);
    let [startX, startY] = [0, 0];
    img.addEventListener('dragstart', (e) => {
        [startX, startY] = [e.x, e.y];
    });
    img.addEventListener('dragend', (e) => {
        const [dX, dY] = [e.x - startX, e.y - startY];
        sprite.x += dX;
        sprite.y -= dY;
        img.style.left = `${sprite.x}px`;
        img.style.bottom = `${sprite.y}px`;
    });
    img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        document.getElementById('spriteOverlay').removeChild(img);
        room.sprites = room.sprites.filter(s => s !== sprite);
    })
}

fillGrid();
loadRoom('lobby');
fillRoomSelection();

document.getElementById('eedForm').addEventListener('submit', editExit);
document.getElementById('roomSelect').addEventListener('change', (e) => {
    loadRoom(e.target.value);
});
document.getElementById('saveButton').addEventListener('click', saveRoom);
document.getElementById('mipmapButton').addEventListener('click', saveMipmaps);
document.getElementById('spriteLayerCheckbox').addEventListener('change', (e) => {
    document.getElementById('spriteOverlay').style.display = e.target.checked ? 'block' : 'none';
    document.getElementById('addSpriteDiv').style.display = e.target.checked ? 'block' : 'none';
})
document.getElementById('addSpriteButton').addEventListener('click', () => {
    const sprite = document.getElementById('addSpriteSelect').value;
    if(!SPRITES[sprite]) return;
    addSprite({
        id: sprite,
        x: 0,
        y: 0,
    });
})