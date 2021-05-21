const bg = 220;
let layer;
let mode = "pen";
let last = null;
let erSize;
let penSize;
let txtSize;
let penC;
let socket;
let poiC;
let poiLayer;
let poiSize;
let cnv;
let controlZone;
let isInside = false;
let myaud;
let txtLayer;
let currTxt = "";
let txtPos = null;
let texts = [];
let bannedKeys = [
  "Shift",
  "Control",
  "CapsLock",
  "Tab",
  "Escape",
  "Alt",
  "ContextMenu",
  "Home",
  "Insert",
  "End",
  "PageUp",
  "PageDown",
  "Delete",
  "NumLock",
  "ArrowUp",
  "ArrowDown",
  "ArrowRight",
  "ArrowLeft",
  "ScrollLock",
  "Clear",
  "F1",
  "F2",
  "F3",
  "f4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "�",
];
let emojis = "🙂🙁😐😉😕🤪👿";
let otherTxt = [];
let poiPos = [];
let lazy = null;
let otherPos = [];
let lastKeys = [];
let willUpdate = false;
let idHeader;
let myId = "";
let isActive = false;
let wasActive = false;

function setup() {
  console.log(`Currently available Emojis: ${emojis}`);
  window.lazyBrush = LazyBrush;
  socket = io.connect("https://drawwithmedarling.herokuapp.com/");
  // socket = io.connect("http://localhost:8080");
  colorMode(HSB);

	
	
  socket.on('create', function (room) {
  socket.join(room);
});
	// client side code
var socket = io.connect();
socket.emit('create', 'room1');

// server side code
io.sockets.on('connection', function(socket) {
  socket.on('create', function(room) {
    socket.join(room);
  });
});
	
	
	

socket.on("connection", socket => {
	socket.on("join-room", (room) => {
		socket.join(room);
		socket.roomId = room;
		socket.emit("joined");
	});
  
  
  
  
	socket.on("drawing", (data) => {
		socket.to(socket.roomId).broadcast.emit("drawing", data);
	});
});
  
  
  
  
  
  
  
  
  
  idHeader = createElement("h3", "ID: ");
  poiC = color(random(255), 100, 100, 150);
  penC = color(0);
  colorMode(RGB);
  cnv = createCanvas(window.innerWidth, window.innerHeight - 120);
  idHeader.position(10, height + 50);
  controlZone = document.getElementById("defaultCanvas0");
  layer = createGraphics(width, height);
  txtLayer = createGraphics(width, height);
  poiLayer = createGraphics(width, height);
  txtLayer = createGraphics(width, height);
  background(bg);
  erSize = width / 20;
  penSize = width / 500;
  poiSize = width / 20;
  txtSize = parseInt(24000 / width);
  if (poiSize > 30) poiSize = 30;
  socket.on("connection", (data) => {
    let showImg = createImg(data.prevData.img, "");
    myCls();
    otherTxt = data.prevData.txt;
    showImg.hide();
    layer.clear();
    setTimeout(() => {
      layer.image(showImg, 0, 0, width, height);
    }, 5);
    myId = data.id;
    idHeader.elt.innerText = "ID: " + data.id;
  });

  socket.on("undo", (data) => {
    let prevImg = createImg(data.img, "");
    myCls();
    texts = [...data.txt];
    otherTxt = texts;
    if (data.txt.length > 0) {
      currTxt = data.txt[data.txt.length - 1].txt;
    }
    prevImg.hide();
    setTimeout(() => {
      layer.clear();
      layer.image(prevImg, 0, 0, width, height);
    }, 10);
  });

  socket.on("redo", (data) => {
    let prevImg = createImg(data.img, "");
    myCls();
    otherTxt = data.txt;
    prevImg.hide();
    setTimeout(() => {
      layer.clear();
      layer.image(prevImg, 0, 0, width, height);
    }, 10);
  });

  socket.on("newTxt", (data) => {
    otherTxt.push(data);
    console.log(data);
  });

  socket.on("txtData", (data) => {
    console.log("oT:", data);
    otherTxt[otherTxt.length - 1] = {
      ...otherTxt[otherTxt.length - 1],
      txt: data,
    };
  });

  socket.on("pen", (data) => {
    colorMode(HSB);
    let pcol = color(data.color.h, 100, data.color.b, 1);
    colorMode(RGB);
    layer.stroke(pcol);
    layer.strokeWeight(data.size);
    layer.line(
      data.last.x * width,
      data.last.y * height,
      data.curr.x * width,
      data.curr.y * height
    );
  });
  socket.on("userData", (data) => {
    poiLayer.clear();
    poiLayer.fill(
      data.poiC.levels[0],
      data.poiC.levels[1],
      data.poiC.levels[2],
      125
    );
    poiLayer.stroke(0);
    poiLayer.circle(data.curr.x * width, data.curr.y * height, 10);
    poiLayer.stroke("#fff");
    poiLayer.strokeWeight(1);
    poiLayer.fill("#000");
    poiLayer.textSize(16);
    poiLayer.text(
      data.id,
      data.curr.x * width - 75,
      data.curr.y * height - 35,
      width,
      height
    );
  });
  socket.on("cls", () => {
    myCls();
  });
  socket.on("erase", (data) => {
    layer.stroke(bg);
    layer.strokeWeight(data.size);
    layer.line(
      data.last.x * width,
      data.last.y * height,
      data.curr.x * width,
      data.curr.y * height
    );
  });

  socket.on("poi", (data) => {
    poiLayer.stroke(
      data.color.levels[0],
      data.color.levels[1],
      data.color.levels[2],
      150
    );
    poiLayer.clear();
    poiLayer.strokeWeight(4);
    poiLayer.beginShape();
    for (pos of data.arr) {
      poiLayer.vertex(pos.x * width, pos.y * height);
    }
    poiLayer.endShape();
    poiLayer.noStroke();
    poiLayer.fill(
      data.color.levels[0],
      data.color.levels[1],
      data.color.levels[2],
      150
    );
    poiLayer.ellipse(data.x * width, data.y * height, data.size * width);
  });
  socket.on("poicls", () => {
    poiLayer.clear();
  });

  sizeSlider = createSlider(2, 100, penSize, 2);
  let penbtn = createButton("Pen");
  penbtn.mousePressed(() => {
    if (mode === "poi") {
      socket.emit("poicls");
    }
    poiLayer.clear();
    if (mode !== "pen") {
      mode = "pen";
      print("Pen Mode!");
    }
    sizeSlider.value(penSize);
  });
  let poibtn = createButton("Pointer");
  poibtn.mousePressed(() => {
    if (mode !== "poi") {
      mode = "poi";
      print("Pointer Mode!");
    }
  });
  let erbtn = createButton("Eraser");
  erbtn.mousePressed(() => {
    if (mode === "poi") {
      socket.emit("poicls");
    }
    poiLayer.clear();
    if (mode !== "er") {
      mode = "er";
      console.log("Eraser mode!");
      sizeSlider.value(erSize);
    }
  });
  let clsbtn = createButton("Clear");
  clsbtn.mousePressed(() => {
    sendCls();
    console.log("Cleared the screen \n:D");
  });
  let txtBtn = createButton("Text");
  txtBtn.mousePressed(() => {
    if (mode === "poi") {
      socket.emit("poicls");
    }
    poiLayer.clear();
    if (mode !== "txt") {
      mode = "txt";
      console.log("Text mode!");
      sizeSlider.value(txtSize);
    }
  });
  createElement("p", "<b>Size</b>").position(
    penbtn.width +
      txtBtn.width +
      erbtn.width +
      poibtn.width +
      clsbtn.width +
      10,
    height - 12
  );
  sizeSlider.position(
    penbtn.width +
      txtBtn.width +
      erbtn.width +
      poibtn.width +
      clsbtn.width +
      40,
    height
  );
  sizeSlider.changed(() => {
    if (mode === "pen") {
      penSize = sizeSlider.value();
      console.log("pen size :", penSize);
    } else if (mode === "er") {
      erSize = sizeSlider.value();
      console.log("eraser size :", erSize);
    }
  });
  createElement("p", "<b>Color</b>").position(
    penbtn.width +
      txtBtn.width +
      erbtn.width +
      poibtn.width +
      clsbtn.width +
      50 +
      sizeSlider.width,
    height - 12
  );
  colorSlider = createSlider(0, 360, 0, 10).position(
    penbtn.width +
      txtBtn.width +
      erbtn.width +
      poibtn.width +
      clsbtn.width +
      90 +
      sizeSlider.width,
    height
  );

  createElement("p", "<b>Brightness</b>").position(
    penbtn.width +
      txtBtn.width +
      erbtn.width +
      poibtn.width +
      clsbtn.width +
      100 +
      sizeSlider.width +
      colorSlider.width,
    height - 12
  );
  brighSlider = createSlider(0, 100, 0, 5).position(
    penbtn.width +
      txtBtn.width +
      erbtn.width +
      poibtn.width +
      clsbtn.width +
      100 +
      sizeSlider.width +
      colorSlider.width +
      80,
    height
  );
}

function draw() {
  isInside = Boolean(mouseX <= width && mouseY <= height);
  background(bg);
  showTxt();
  poiLayer.image(txtLayer, 0, 0);
  image(layer, 0, 0);
  image(poiLayer, 0, 0);
  if (isInside) {
    if (mode === "poiwait") {
      mode = "poi";
    }
    if (mode === "pen") {
      cursor("./pen_cursor.png", -10, -10);
      pen();
    } else if (mode === "poi" || mode === "poiwait") {
      cursor("pointer");
      pointer();
    } else if (mode === "er") {
      eraser();
      cursor("./er_cursor.png");
    } else if (mode === "txt") {
      txtFun();
    }
  } else {
    cursor();
    last = null;
    if (mode === "poi") {
      socket.emit("poicls");
      mode = "poiwait";
      console.log("cls");
    }
  }
}

function mouseReleased() {
  if (!(mode == "poi" || mode == "txt")) {
    sendNewData();
  }
}

let sendUserData = () => {
  let userData;
  if (lazy) {
    cords = lazy.getBrushCoordinates();
    userData = {
      curr: {
        x: cords.x / width,
        y: cords.y / height,
      },
      poiC: poiC,
      id: myId,
    };
  } else {
    cords = last;
    userData = {
      curr: {
        x: cords.x / width,
        y: cords.y / height,
      },
      poiC: poiC,
      id: myId,
    };
  }
  socket.emit("userData", userData);
};
