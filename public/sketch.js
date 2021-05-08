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
let autosave = true;
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
  " ",
];
let emojis = "🙂🙁😐😉😕🤪";
let otherTxt = [];
let poiPos = [];
let lazy = null;
let otherPos = [];

function setup() {
  window.lazyBrush = LazyBrush;
  // socket = io.connect("https://pwhiteboard.herokuapp.com/");
  socket = io.connect("http://localhost:8080");
  colorMode(HSB);
  poiC = color(random(255), 100, 100, 150);
  penC = color(0);
  colorMode(RGB);
  cnv = createCanvas(window.innerWidth, window.innerHeight - 100);
  controlZone = document.getElementById("defaultCanvas0");
  layer = createGraphics(width, height);
  txtLayer = createGraphics(width, height);
  poiLayer = createGraphics(width, height);
  txtLayer = createGraphics(width, height);
  background(bg);
  erSize = width / 20;
  penSize = width / 500;
  poiSize = width / 20;
  txtSize = 16;
  if (poiSize > 30) poiSize = 30;
  socket.on("connection", (data) => {
    let showImg = createImg(data.img, "");
    texts = data.txt;
    showImg.hide();
    setTimeout(() => {
      layer.image(showImg, 0, 0, width, height);
      console.log("loal:", data);
    }, 5);
  });

  socket.on("newTxt", (data) => {
    otherTxt.push(data);
    console.log(data);
  });

  socket.on("txtData", (data) => {
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
  socket.on("cls", () => {
    layer.clear();
    poiLayer.clear();
    otherTxt = [];
    texts = [];
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
    if (mode !== "er") {
      mode = "er";
      console.log("Eraser mode!");
      sizeSlider.value(erSize);
    }
  });
  let clsbtn = createButton("Clear");
  clsbtn.mousePressed(() => {
    layer.clear();
    texts = [];
    otherTxt = [];
    poiLayer.clear();
    socket.emit("cls");
    console.log("Cleared everything!");
  });
  let txtBtn = createButton("Text");
  txtBtn.mousePressed(() => {
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
      console.log("pen :", penSize);
    } else if (mode === "er") {
      erSize = sizeSlider.value();
      console.log("eraser :", erSize);
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
  colorSlider = createSlider(0, 360, 0, 30).position(
    penbtn.width +
      txtBtn.width +
      erbtn.width +
      poibtn.width +
      clsbtn.width +
      90 +
      sizeSlider.width,
    height
  );
  colorSlider.changed(() => {
    if (brighSlider.value() == 0) {
      alert("You must increase Brightness to see color.");
    }
  });

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
  checkbox = createCheckbox("Autosave", autosave);
  checkbox.changed(() => {
    autosave = checkbox.checked();
    console.log(`Autosave ${autosave ? "enabled" : "disabled"}`);
  });
  setInterval(() => {
    if (autosave) {
      let imageBase64String = layer.elt.toDataURL();
      socket.emit("newData", {
        img: imageBase64String,
        txt: texts,
      });
    }
  }, 2500);
}

function draw() {
  isInside = Boolean(mouseX <= width && mouseY <= height);
  background(bg);
  showTxt();
  poiLayer.image(txtLayer, 0, 0);
  image(layer, 0, 0);
  image(poiLayer, 0, 0);
  if (isInside) {
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
