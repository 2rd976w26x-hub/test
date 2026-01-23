/**
 * CardKit (ported from Piratwhist v0.2.98)
 * Uses the exact card face SVG renderer from that build.
 */
export const CARDKIT_VERSION = "1.0.1";

export function initCardKit(opts = {}){
  const root = document.documentElement;
  if (opts.backUrl) root.style.setProperty("--cardback-url", `url("${opts.backUrl}")`);
}

function normalizeCard(card){
  const rank = String(card.rank);
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

export function renderCardBack(){
  const wrap = document.createElement("div");
  wrap.className = "playingcard back";
  return wrap;
}

export function renderCardFace(cardInput){
  const card = normalizeCard(cardInput);
  return _renderCardFaceExact(card);
}

export function createCard(card, opts = {}){
  const faceUp = opts.faceUp !== false;
  return faceUp ? renderCardFace(card) : renderCardBack();
}

// ---- Exact functions from Piratwhist v0.2.98 (kept intact) ----
function _renderCardFaceExact(card){
  const red = (card.suit === "♥" || card.suit === "♦");
  const wrap = document.createElement("div");
  wrap.className = "playingcard" + (red ? " red" : "");

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


function buildCardSVG(card){
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 140");
  svg.setAttribute("class", "cardface-svg");

  const suit = card.suit;
  const rank = String(card.rank);

  function pip(x, y, size, rotate){
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.setAttribute("font-size", String(size));
    t.setAttribute("class", "pip");
    t.textContent = suit;
    if (rotate){
      t.setAttribute("transform", `rotate(${rotate} ${x} ${y})`);
    }
    svg.appendChild(t);
  }

  const isFace = (rank === "J" || rank === "Q" || rank === "K");
  const isAce  = (rank === "A");

  if (isFace){
    // Vector "portrait" in a classic card style (no copyrighted art).
    const frame = document.createElementNS(NS, "rect");
    frame.setAttribute("x","18"); frame.setAttribute("y","28");
    frame.setAttribute("width","64"); frame.setAttribute("height","84");
    frame.setAttribute("rx","10");
    frame.setAttribute("class","face-bg");
    svg.appendChild(frame);

    // Head + body
    const head = document.createElementNS(NS, "circle");
    head.setAttribute("cx","50"); head.setAttribute("cy","60");
    head.setAttribute("r","10");
    head.setAttribute("class","face-fill");
    svg.appendChild(head);

    const body = document.createElementNS(NS, "path");
    body.setAttribute("d","M34 108 Q50 86 66 108 L66 112 Q50 124 34 112 Z");
    body.setAttribute("class","face-fill");
    svg.appendChild(body);

    // Crown/tiara/helmet hint
    const hat = document.createElementNS(NS, "path");
    if (rank === "K"){
      hat.setAttribute("d","M34 56 L38 46 L44 58 L50 44 L56 58 L62 46 L66 56 L66 62 L34 62 Z");
    } else if (rank === "Q"){
      hat.setAttribute("d","M34 58 Q50 40 66 58 L62 50 Q50 46 38 50 Z");
    } else {
      hat.setAttribute("d","M34 56 Q50 48 66 56 L66 66 Q50 70 34 66 Z");
    }
    hat.setAttribute("class","face-line");
    svg.appendChild(hat);

    // Big center suit
    pip(50, 84, 38, 0);

    // Rank banner
    const banner = document.createElementNS(NS, "rect");
    banner.setAttribute("x","30"); banner.setAttribute("y","94");
    banner.setAttribute("width","40"); banner.setAttribute("height","18");
    banner.setAttribute("rx","6");
    banner.setAttribute("class","face-banner");
    svg.appendChild(banner);

    const rt = document.createElementNS(NS, "text");
    rt.setAttribute("x","50"); rt.setAttribute("y","103");
    rt.setAttribute("text-anchor","middle");
    rt.setAttribute("dominant-baseline","middle");
    rt.setAttribute("class","face-rank");
    rt.textContent = rank;
    svg.appendChild(rt);

    return svg;
  }

  if (isAce){
    pip(50, 74, 64, 0);
    pip(26, 46, 18, 0);
    pip(74, 102, 18, 180);
    return svg;
  }

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
