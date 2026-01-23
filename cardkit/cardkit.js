export const CARDKIT_VERSION = "1.1.0";

export function initCardKit(opts = {}){
  const root = document.documentElement;
  if (opts.backUrl) root.style.setProperty("--cardback-url", `url("${opts.backUrl}")`);
  // Optional overrides
  if (opts.w) root.style.setProperty("--card-w", String(opts.w));
  if (opts.h) root.style.setProperty("--card-h", String(opts.h));
}

function normalizeCard(card){
  const rank = String(card.rank).toUpperCase();
  const suitRaw = String(card.suit);
  const map = {
    "S":"♠","SPADES":"♠","♠":"♠",
    "H":"♥","HEARTS":"♥","♥":"♥",
    "D":"♦","DIAMONDS":"♦","♦":"♦",
    "C":"♣","CLUBS":"♣","♣":"♣",
  };
  const key = (suitRaw.toUpperCase?.() ?? suitRaw);
  const suit = map[key] || suitRaw;
  return { rank, suit };
}

function isRedSuit(suit){ return suit === "♥" || suit === "♦"; }

export function renderCardBack(){
  const wrap = document.createElement("div");
  wrap.className = "playingcard back";
  return wrap;
}

export function renderCardFace(cardInput){
  const card = normalizeCard(cardInput);
  const wrap = document.createElement("div");
  wrap.className = "playingcard" + (isRedSuit(card.suit) ? " red" : "");

  const c1 = document.createElement("div");
  c1.className = "corner tl";
  c1.innerHTML = `<div class="rk">${card.rank}</div><div class="st">${card.suit}</div>`;

  const c2 = document.createElement("div");
  c2.className = "corner br";
  c2.innerHTML = `<div class="rk">${card.rank}</div><div class="st">${card.suit}</div>`;

  const svg = buildCardSVG(card);

  wrap.appendChild(c1);
  wrap.appendChild(svg);
  wrap.appendChild(c2);
  return wrap;
}

export function createCard(card, opts = {}){
  const faceUp = opts.faceUp !== false;
  return faceUp ? renderCardFace(card) : renderCardBack();
}

export function buildCardSVG(card){
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 140");
  svg.setAttribute("class", "cardface-svg");

  const suit = card.suit;
  const rank = card.rank;

  function pip(x, y, size, rotate){
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.setAttribute("font-size", String(size));
    t.setAttribute("class", "pip");
    t.textContent = suit;
    if (rotate) t.setAttribute("transform", `rotate(${rotate} ${x} ${y})`);
    svg.appendChild(t);
  }

  // --- Face cards using your new images ---
  if (rank === "K" || rank === "D" || rank === "J"){
    const img = document.createElementNS(NS, "image");
    // Use relative URL; works when served from /
    const href = rank === "K" ? "../assets/face_K.png" : (rank === "D" ? "../assets/face_D.png" : "../assets/face_J.png");
    img.setAttribute("href", href);
    img.setAttribute("x", "18");
    img.setAttribute("y", "26");
    img.setAttribute("width", "64");
    img.setAttribute("height", "88");
    img.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.appendChild(img);

    // Suit watermark
    pip(50, 112, 26, 0);
    return svg;
  }

  // Ace
  if (rank === "A"){
    pip(50, 74, 64, 0);
    pip(26, 46, 18, 0);
    pip(74, 102, 18, 180);
    return svg;
  }

  // Number cards
  const n = parseInt(rank, 10);
  const layouts = {
    2:  [[50, 44],[50, 104]],
    3:  [[50, 38],[50, 74],[50, 110]],
    4:  [[34, 44],[66, 44],[34, 104],[66, 104]],
    5:  [[34, 44],[66, 44],[50, 74],[34, 104],[66, 104]],
    6:  [[34, 40],[66, 40],[34, 74],[66, 74],[34, 108],[66, 108]],
    7:  [[34, 38],[66, 38],[34, 68],[66, 68],[50, 74],[34, 108],[66, 108]],
    8:  [[34, 36],[66, 36],[34, 62],[66, 62],[34, 86],[66, 86],[34, 112],[66, 112]],
    9:  [[34, 34],[66, 34],[34, 58],[66, 58],[50, 74],[34, 92],[66, 92],[34, 116],[66, 116]],
    10: [[30, 34],[70, 34],[34, 56],[66, 56],[30, 78],[70, 78],[34, 100],[66, 100],[30, 122],[70, 122]],
  };
  const pts = layouts[n] || [[50,74]];
  for (const [x,y] of pts){
    const rot = (y > 74) ? 180 : 0;
    const size = (n >= 8) ? 20 : 22;
    pip(x, y, size, rot);
  }
  return svg;
}
