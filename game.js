// ========================================
// OFFICE ESCAPE
// GAME ENGINE - VERSION 1
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const startButton = document.getElementById("startButton");

const objectiveText = document.getElementById("objectiveText");


// ========================================
// GAME STATE
// ========================================

let gameStarted = false;
let paused = false;

const keys = {};


// ========================================
// PLAYER
// ========================================

const player = {

    x: 80,
    y: 440,

    width: 30,
    height: 36,

    normalSpeed: 3,
    sprintSpeed: 5,

    color: "#4da6ff"
};

const manager = {
    x: 820,
    y: 240,

    width: 32,
    height: 38,

    speed: 1.6,
    chaseSpeed: 2.5,

    detectionRange: 180,

    color: "#ff4d4d",

    health: 100,

    state: "patrol",

    patrolTargetX: 820,
    patrolTargetY: 240
};

let playerHealth = 100;
let managerDamageCooldown = false;

function distanceBetween(a, b) {

    const ax = a.x + a.width / 2;
    const ay = a.y + a.height / 2;

    const bx = b.x + b.width / 2;
    const by = b.y + b.height / 2;

    const dx = bx - ax;
    const dy = by - ay;

    return Math.sqrt(dx * dx + dy * dy);
}


// ========================================
// EXIT
// ========================================

const exitDoor = {

    x: 870,
    y: 60,

    width: 45,
    height: 70
};


// ========================================
// OFFICE WALLS
// ========================================

const walls = [

    // outer office furniture

    {
        x: 140,
        y: 80,
        width: 210,
        height: 28
    },

    {
        x: 140,
        y: 80,
        width: 28,
        height: 150
    },


    // cubicle 2

    {
        x: 430,
        y: 80,
        width: 210,
        height: 28
    },

    {
        x: 612,
        y: 80,
        width: 28,
        height: 150
    },


    // middle divider

    {
        x: 260,
        y: 270,
        width: 440,
        height: 28
    },


    // bottom left cubicle

    {
        x: 140,
        y: 360,
        width: 230,
        height: 28
    },

    {
        x: 342,
        y: 360,
        width: 28,
        height: 110
    },


    // bottom right cubicle

    {
        x: 540,
        y: 370,
        width: 230,
        height: 28
    },

    {
        x: 540,
        y: 370,
        width: 28,
        height: 110
    },


    // manager office wall

    {
        x: 760,
        y: 180,
        width: 150,
        height: 28
    },

    {
        x: 760,
        y: 180,
        width: 28,
        height: 130
    }

];


// ========================================
// OFFICE DESKS
// ========================================

const desks = [

    {
        x: 190,
        y: 130,
        width: 110,
        height: 48
    },

    {
        x: 470,
        y: 130,
        width: 110,
        height: 48
    },

    {
        x: 190,
        y: 410,
        width: 110,
        height: 48
    },

    {
        x: 600,
        y: 420,
        width: 110,
        height: 48
    },

    {
        x: 810,
        y: 235,
        width: 75,
        height: 40
    }

];


// ========================================
// KEYBOARD
// ========================================

window.addEventListener("keydown", (event) => {

    const key = event.key.toLowerCase();

    keys[key] = true;


    if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
    ) {

        event.preventDefault();

    }


    if (
        event.key === "Escape" &&
        gameStarted
    ) {

        togglePause();

    }

});


window.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


// ========================================
// START
// ========================================

startButton.addEventListener("click", () => {

    gameStarted = true;

    startScreen.classList.add("hidden");

});


// ========================================
// PAUSE
// ========================================

function togglePause() {

    paused = !paused;

    if (paused) {

        pauseScreen.classList.remove("hidden");

    } else {

        pauseScreen.classList.add("hidden");

    }

}


// ========================================
// COLLISION
// ========================================

function rectanglesTouch(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );

}


function collidesWithOffice(testPlayer) {

    const allObstacles = [
        ...walls,
        ...desks
    ];

    for (const obstacle of allObstacles) {

        if (
            rectanglesTouch(
                testPlayer,
                obstacle
            )
        ) {

            return true;

        }

    }

    return false;

}


// ========================================
// MOVEMENT
// ========================================

function updatePlayer() {

    if (
        !gameStarted ||
        paused
    ) {

        return;

    }


    const sprinting =
        keys["shift"];


    const speed =
        sprinting
            ? player.sprintSpeed
            : player.normalSpeed;


    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy -= speed;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy += speed;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx -= speed;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx += speed;

    }


    // normalize diagonal movement

    if (
        dx !== 0 &&
        dy !== 0
    ) {

        dx *= 0.707;
        dy *= 0.707;

    }


    // test horizontal movement

    const horizontalTest = {

        x: player.x + dx,
        y: player.y,

        width: player.width,
        height: player.height

    };


    if (
        !collidesWithOffice(
            horizontalTest
        )
    ) {

        player.x += dx;

    }


    // test vertical movement

    const verticalTest = {

        x: player.x,
        y: player.y + dy,

        width: player.width,
        height: player.height

    };


    if (
        !collidesWithOffice(
            verticalTest
        )
    ) {

        player.y += dy;

    }


    // canvas boundaries

    player.x = Math.max(
        10,
        Math.min(
            canvas.width - player.width - 10,
            player.x
        )
    );


    player.y = Math.max(
        10,
        Math.min(
            canvas.height - player.height - 10,
            player.y
        )
    );


    checkExit();

}


// ========================================
// EXIT
// ========================================

function checkExit() {

    if (
        rectanglesTouch(
            player,
            exitDoor
        )
    ) {

        objectiveText.textContent =
            "LEVEL COMPLETE";

        gameStarted = false;

        setTimeout(() => {

            alert(
                "🎉 LEVEL 1 COMPLETE!\n\nYou escaped the office.\n\nUnfortunately, your manager is waiting upstairs."
            );

        }, 100);

    }

}


// ========================================
// DRAW FLOOR
// ========================================

function drawFloor() {

    ctx.fillStyle = "#151922";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // floor grid

    ctx.strokeStyle = "#1d222c";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }

}


// ========================================
// DRAW WALLS
// ========================================

function drawWalls() {

    for (const wall of walls) {

        ctx.fillStyle =
            "#343a47";

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        ctx.strokeStyle =
            "#515969";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );

    }

}


// ========================================
// DRAW DESKS
// ========================================

function drawDesks() {

    for (const desk of desks) {

        ctx.fillStyle =
            "#584531";

        ctx.fillRect(
            desk.x,
            desk.y,
            desk.width,
            desk.height
        );


        ctx.strokeStyle =
            "#806549";

        ctx.strokeRect(
            desk.x,
            desk.y,
            desk.width,
            desk.height
        );


        // monitor

        ctx.fillStyle =
            "#11151c";

        ctx.fillRect(
            desk.x + desk.width / 2 - 17,
            desk.y + 9,
            34,
            20
        );


        ctx.fillStyle =
            "#4da6ff";

        ctx.fillRect(
            desk.x + desk.width / 2 - 13,
            desk.y + 12,
            26,
            13
        );

    }

}


// ========================================
// DRAW EXIT
// ========================================

function drawExit() {

    ctx.fillStyle =
        "#17965a";

    ctx.fillRect(
        exitDoor.x,
        exitDoor.y,
        exitDoor.width,
        exitDoor.height
    );


    ctx.strokeStyle =
        "#55e099";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        exitDoor.x,
        exitDoor.y,
        exitDoor.width,
        exitDoor.height
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "EXIT",
        exitDoor.x +
        exitDoor.width / 2,
        exitDoor.y - 10
    );


    ctx.fillStyle =
        "#ffcf54";

    ctx.beginPath();

    ctx.arc(
        exitDoor.x + 8,
        exitDoor.y + 36,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ========================================
// DRAW OFFICE LABELS
// ========================================

function drawLabels() {

    ctx.font =
        "bold 11px Arial";

    ctx.textAlign =
        "left";


    ctx.fillStyle =
        "#687386";


    ctx.fillText(
        "SALES",
        190,
        70
    );


    ctx.fillText(
        "ACCOUNTING",
        470,
        70
    );


    ctx.fillStyle =
        "#ff6060";


    ctx.fillText(
        "MANAGER",
        805,
        165
    );


    ctx.fillStyle =
        "#687386";


    ctx.fillText(
        "WHY ARE WE STILL HERE?",
        380,
        525
    );

}


// ========================================
// DRAW PLAYER
// ========================================

function drawPlayer() {

    // shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        player.x +
        player.width / 2,
        player.y +
        player.height,
        18,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // body

    ctx.fillStyle =
        player.color;

    ctx.fillRect(
        player.x + 6,
        player.y + 12,
        18,
        24
    );


    // head

    ctx.fillStyle =
        "#e7b98a";

    ctx.beginPath();

    ctx.arc(
        player.x + 15,
        player.y + 9,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // tie

    ctx.fillStyle =
        "#ff4d4d";

    ctx.beginPath();

    ctx.moveTo(
        player.x + 15,
        player.y + 17
    );

    ctx.lineTo(
        player.x + 11,
        player.y + 27
    );

    ctx.lineTo(
        player.x + 15,
        player.y + 31
    );

    ctx.lineTo(
        player.x + 19,
        player.y + 27
    );

    ctx.closePath();

    ctx.fill();

}


// ========================================
// DRAW OBJECTIVE ARROW
// ========================================

function drawExitArrow() {

    const centerX =
        exitDoor.x +
        exitDoor.width / 2;


    ctx.fillStyle =
        "#55e099";

    ctx.font =
        "22px Arial";

    ctx.textAlign =
        "center";


    const bounce =
        Math.sin(
            Date.now() / 250
        ) * 5;


    ctx.fillText(
        "▼",
        centerX,
        exitDoor.y -
        30 +
        bounce
    );

}

function drawManager() {

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";

    ctx.beginPath();

    ctx.ellipse(
        manager.x + manager.width / 2,
        manager.y + manager.height,
        18,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // body
    ctx.fillStyle = "#1b1b1b";

    ctx.fillRect(
        manager.x + 6,
        manager.y + 13,
        20,
        25
    );


    // head
    ctx.fillStyle = "#dca878";

    ctx.beginPath();

    ctx.arc(
        manager.x + 16,
        manager.y + 9,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // tie
    ctx.fillStyle = "#ff4d4d";

    ctx.fillRect(
        manager.x + 14,
        manager.y + 17,
        4,
        15
    );


    // alert symbol when chasing
    if (manager.state === "chase") {

        ctx.fillStyle = "#ff4d4d";

        ctx.font = "bold 18px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "!",
            manager.x + 16,
            manager.y - 10
        );
    }
}


// ========================================
// RENDER
// ========================================

function render() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawFloor();

    drawLabels();

    drawWalls();

    drawDesks();

    drawExit();

    drawExitArrow();

    drawManager();

    drawPlayer();

}


// ========================================
// GAME LOOP
// ========================================

function gameLoop() {

    updatePlayer();
   
    updateManager();

    render();

    requestAnimationFrame(
        gameLoop
    );

}


gameLoop();
