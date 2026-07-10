const IMAGES = [
  "ichiran.jpg",  //0
  "1.jpg",  //1
  "2.jpg", //2
  "2_hidari.jpg", //3
  "2_migi.jpg", //4
  "3.jpg", //5
  "3-2.jpg" //6

];

const ZONES = [
 { page: 0, cx: 0.33, cy: 0.58, r: 80, to: 1 }, // ①
  { page: 0, cx: 0.60, cy: 0.85, r: 80, to: 2 }, // ②
  { page: 0, cx: 0.82, cy: 0.52, r: 80, to: 5 }, // ③

  //1から3D動画
  { page: 1, cx: 0.40, cy: 0.85, r: 60, to: "video", src: "3Dtutan.mp4" },

  // 2.jpg（page:2）の左矢印◀ 
  { page: 2, cx: 0.10, cy: 0.55, r: 60, to: 3 }, //正面から左
   { page: 4, cx: 0.10, cy: 0.55, r: 60, to: 2}, //右から正面
  
  // 2.jpg（page:2）の右矢印▶ 
  { page: 2, cx: 0.38, cy: 0.55, r: 60, to: 4}, //正面から右
  { page: 3, cx: 0.38, cy: 0.55, r: 60, to: 2}, //左から正面

  //3からの移動
  { page: 5, cx: 0.88, cy: 0.88, r: 60, to: 6 },
  { page: 6, cx: 0.88, cy: 0.88, r: 60, to: 5 },

  { page: 1, cx: 0.87, cy: 0.12, r: 50, to: 0 },
  { page: 2, cx: 0.87, cy: 0.12, r: 50, to: 0 },
  { page: 3, cx: 0.87, cy: 0.12, r: 50, to: 0 },
  { page: 4, cx: 0.87, cy: 0.12, r: 50, to: 0 },
  { page: 5, cx: 0.87, cy: 0.12, r: 50, to: 0 },
  { page: 6, cx: 0.87, cy: 0.12, r: 50, to: 0 },

];

let currentPage = 0;

const imgA       = document.getElementById("imgA");
const imgB       = document.getElementById("imgB");
const stage      = document.getElementById("stage");
const mapPopup   = document.getElementById("map-popup");
const mapFrame   = document.getElementById("map-frame");
const mapClose   = document.getElementById("map-close");
const mapOverlay = document.getElementById("map-overlay");
const videoPopup  = document.getElementById("video-popup");
const videoPlayer = document.getElementById("video-player");
const videoClose  = document.getElementById("video-close");
const videoOverlay = document.getElementById("video-overlay");

ZONES.forEach((z, i) => {
  const el = document.createElement("div");
  el.className = "zone";
  el.dataset.index = i;
  el.style.display = "none";
  stage.appendChild(el);
  z.el = el;
});

function updateZones() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  ZONES.forEach(z => {
    if (z.page === currentPage) {
      const px = z.cx * W;
      const py = z.cy * H;
      z.el.style.display = "block";
      z.el.style.left   = (px - z.r) + "px";
      z.el.style.top    = (py - z.r) + "px";
      z.el.style.width  = (z.r * 2) + "px";
      z.el.style.height = (z.r * 2) + "px";
    } else {
      z.el.style.display = "none";
    }
  });
}

function goTo(pageIndex) {
  if (pageIndex === currentPage) return;
  const toSrc = IMAGES[pageIndex];

  imgB.src = toSrc;
  imgB.style.transition = "none";
  imgB.style.opacity = "0";

  imgB.onload = () => {
    requestAnimationFrame(() => {
      imgB.style.transition = "opacity 0.4s ease";
      imgB.style.opacity = "1";
    });
    setTimeout(() => {
      imgA.src = toSrc;
      imgA.style.transition = "none";
      imgA.style.opacity = "1";
      imgB.style.opacity = "0";
    }, 450);
  };

  currentPage = pageIndex;
  updateZones();
}


function openVideo(src) {
  videoPlayer.pause();
  videoPlayer.src = src;
  videoPlayer.load();
  videoPopup.style.display = "block";

  videoPlayer.onloadedmetadata = () => {
    videoPlayer.currentTime = 0;
    videoPlayer.play();
  };
}
function closeVideo() {
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
  videoPlayer.src = "";
  videoPopup.style.display = "none";
}

videoClose.addEventListener("click", closeVideo);
videoClose.addEventListener("touchend", e => { e.stopPropagation(); closeVideo(); });
videoOverlay.addEventListener("click", closeVideo);
videoOverlay.addEventListener("touchend", e => { e.stopPropagation(); closeVideo(); });

function handleInput(clientX, clientY) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  for (const z of ZONES) {
    if (z.page !== currentPage) continue;
    const dist = Math.sqrt((clientX - z.cx * W) ** 2 + (clientY - z.cy * H) ** 2);
    if (dist < z.r) {
      if (z.to === "map")   { openMap(z.lat, z.lng); return; }
      if (z.to === "video") { openVideo(z.src); return; }
      goTo(z.to);
      return;
    }
  }
}


stage.addEventListener("touchstart", e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  handleInput(t.clientX, t.clientY);
}, { passive: false });

stage.addEventListener("click", e => handleInput(e.clientX, e.clientY));

window.addEventListener("resize", updateZones);
imgA.src = IMAGES[0];
updateZones();
