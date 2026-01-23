export const CARDKIT_VERSION = "1.2.0";

export function initCardKit(opts = {}){
  const root = document.documentElement;
  if (opts.backUrl) root.style.setProperty("--cardback-url", `url("${opts.backUrl}")`);
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

export function renderCardBack(opts = {}){
  const wrap = document.createElement("div");
  const variant = opts.variant || "A"; // "A" or "B"
  wrap.className = "playingcard back " + (variant === "B" ? "backB" : "backA");
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
  return faceUp ? renderCardFace(card) : renderCardBack({ variant: opts.backVariant || 'A' });
}

export function buildCardSVG(card){
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 140");
  svg.setAttribute("class", "cardface-svg");

  const suit = card.suit;
  const rank = card.rank;

  function pip(x, y, size, rotate, emphasis=false){
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.setAttribute("font-size", String(emphasis ? (size + 1) : size));
    t.setAttribute("class", "pip");
    t.textContent = suit;
    t.setAttribute("opacity", emphasis ? "1" : "0.92");
    if (rotate) t.setAttribute("transform", `rotate(${rotate} ${x} ${y})`);
    svg.appendChild(t);
  }

  // Face cards: K, D (Queen), J
  if (rank === "K" || rank === "D" || rank === "J"){
    const img = document.createElementNS(NS, "image");
    const href = rank === "K" ? "../assets/face_K.png" : (rank === "D" ? "../assets/face_D.png" : "../assets/face_J.png");
    img.setAttribute("href", href);
    img.setAttribute("x", "18");
    img.setAttribute("y", "24");
    img.setAttribute("width", "64");
    img.setAttribute("height", "92");
    img.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.appendChild(img);

    // Small watermark suit
    pip(50, 116, 24, 0);
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
    2:  [[50, 46],[50, 100]],
    3:  [[50, 40],[50, 73, true],[50, 106]],
    4:  [[36, 46],[64, 46],[36, 100],[64, 100]],
    5:  [[36, 46],[64, 46],[50, 73, true],[36, 100],[64, 100]],
    6:  [[36, 42],[64, 42],[36, 73],[64, 73],[36, 104],[64, 104]],
    7:  [[36, 40],[64, 40],[36, 66],[64, 66],[50, 73, true],[36, 106],[64, 106]],
    8:  [[36, 38],[64, 38],[36, 62],[64, 62],[36, 84],[64, 84],[36, 108],[64, 108]],
    9:  [[36, 38],[64, 38],[36, 60],[64, 60],[50, 73, true],[36, 90],[64, 90],[36, 112],[64, 112]],
    10: [[34, 38],[66, 38],[38, 58],[62, 58],[34, 78],[66, 78],[38, 98],[62, 98],[34, 112],[66, 112]],
  };
  const pts = layouts[n] || [[50,74]];
  for (const item of pts){
    const x = item[0], y = item[1], emphasis = !!item[2];
    const rot = (y > 74) ? 180 : 0;

    // Clean sizing: more pips => smaller, to avoid "clumps"
    const size = (n >= 9) ? 18 : (n >= 8 ? 19 : (n >= 7 ? 20 : 22));

    pip(x, y, size, rot, emphasis);
  }
  return svg;
}
