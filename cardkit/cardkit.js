/**
 * CardKit (ported from Piratwhist v0.2.98)
 * Exposes a tiny, game-agnostic API.
 */
export const CARDKIT_VERSION = "1.0.0";

/**
 * initCardKit({ backUrl })
 * Sets the CSS variable used by .playingcard.back
 */
export function initCardKit(opts = {}){
  const root = document.documentElement;
  if (opts.backUrl) root.style.setProperty("--cardback-url", `url("${opts.backUrl}")`);
}

/**
 * Universal card input:
 * { suit: "S"|"H"|"D"|"C" or "♠"|"♥"|"♦"|"♣", rank: "A"|"K"|"Q"|"J"|"10"|...|"2" }
 */
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

/** Face-down card */
export function renderCardBack(){
  const wrap = document.createElement("div");
  wrap.className = "playingcard back";
  return wrap;
}

/** Face-up card (uses the exact renderer from Piratwhist v0.2.98) */
export function renderCardFace(cardInput){
  const card = normalizeCard(cardInput);
  return _renderCardFaceExact(card);
}

/** Convenience wrapper */
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

// SVG card face (no copyrighted art). Normal playing-card pips for 2–10,
// and a simple vector "portrait" for J/Q/K.
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

function normalizeCode(s){ return (s || "").trim(); }



function bootFromUrl(){
  const qp = new URLSearchParams(window.location.search || "");
  const code = normalizeCode(qp.get("code"));
  if (!code) return;

  // Keep any visible input in sync (only exists on the entry page)
  const rc = el("olRoomCode");
  if (rc) rc.value = code;

  // Important: phase pages may not have an input field, so we must
  // join using the URL code directly.
  // Guard against duplicate joins: bootFromUrl runs both on DOMContentLoaded and on
  // socket connect. Without a guard we can join twice and get a new seat.
  if (!roomCode && !joinInProgress) joinRoom(code);
}
const socket = GUIDE_MODE ? {
  connected:false,
  on(){}, off(){}, emit(){}, connect(){}, disconnect(){},
} : io({ transports: ["websocket", "polling"] });


function emitWhenConnected(fn){
  if (socket && socket.connected){
    fn();
    return;
  }
  // Socket.IO will connect automatically, but we defer emits until we are connected
  try { socket.connect(); } catch(e){ /* ignore */ }
  const once = () => {
    socket.off("connect", once);
    fn();
  };
  socket.on("connect", once);
}
let roomCode = null;
let mySeat = null;
let state = null;
let prevState = null;

socket.on("connect", () => {
  const s = el("olRoomStatus");
  if (s) s.textContent = "Forbundet.";
  bootFromUrl();
});

document.addEventListener("DOMContentLoaded", () => {
  // In case the socket connects after DOM is ready or the page is restored
  // from bfcache.
  bootFromUrl();

  // Mobile Safari/Chrome can restore the play page from the back-forward cache
  // when navigating to rules.html and back. In that case, JS timers/listeners
  // and socket state can become stale, causing the game UI to "lock".
  // When this happens, the safest behavior is to reload the current page so
  // we re-attach to the room and re-render state.
  window.addEventListener("pageshow", (ev) => {
    try{
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      const backForward = nav && nav.type === "back_forward";
      const restored = !!ev.persisted || backForward;
      if (restored && document.body && document.body.classList.contains("page-play")){
        // Preserve URL (room code) and force a clean re-init.
        window.location.reload();
      }
    }catch(e){ /* ignore */ }
  }, { passive: true });

  // Keep the round-table layout stable on resize / orientation change.
  window.addEventListener("resize", () => {
    try{
      if (state && el("olCenter")){
        ensurePlayBoard(state.n);
        positionPlayBoard(state.n);
      }
    }catch(e){ /* ignore */ }
  });
  pendingCreateRoom = false;
});

socket.on("error", (data) => {
  const msg = (data?.message || "Ukendt fejl");

  // Robust join: During fast redirects between pages, the server may still be
  // finishing room creation / re-attachment. If we get "Rum ikke fundet" while
  // we *do* have a join pending, retry a few times before showing the error.
  if (msg === "Rum ikke fundet." && pendingJoinRoom && joinRetryCount < 6){
    joinInProgress = false;
    pendingCreateRoom = false;
    joinRetryCount += 1;
    const waitMs = 200 + (joinRetryCount * 150);
    const status = el("olRoomStatus");
    if (status) status.textContent = `Forbinder… (forsøg ${joinRetryCount}/6)`;
    setTimeout(() => {
      // Keep the pendingJoinRoom; try again.
      joinRoom(pendingJoinRoom);
    }, waitMs);
    return;
  }

  joinInProgress = false;
  pendingJoinRoom = null;
  pendingCreateRoom = false;
  joinRetryCount = 0;
  showRoomWarn(msg);
});

function handleOnlineState(payload){
  joinInProgress = false;
  pendingJoinRoom = null;
  pendingCreateRoom = false;
  joinRetryCount = 0;
  roomCode = payload.room;
  if (payload.seat !== null && payload.seat !== undefined) mySeat = payload.seat;
  prevState = state;
  state = payload.state;

  // Expose the current phase to CSS (for responsive layout + hiding side panels during play)
  try{
    const phases = ["lobby","dealing","bidding","playing","between_tricks","round_finished","game_finished"];
    phases.forEach(p=> document.body.classList.remove(`phase-${p}`));
    if (state?.phase) document.body.classList.add(`phase-${state.phase}`);
  }catch(e){ /* ignore */ }

  const rl = el("olRoomLabel"); if (rl) rl.textContent = roomCode || "-";
  const sl = el("olSeatLabel");
  if (sl){
    if (mySeat===null || mySeat===undefined) sl.textContent = "-";
    else sl.textContent = (state?.names?.[mySeat] ? state.names[mySeat] : `Spiller ${mySeat+1}`);
  }
  showRoomWarn("");
  showWarn("");
  syncPlayerCount();
  syncBotCount();
  maybeRunAnimations();

render();

// Ensure the "Regler" link returns to the current page after reading rules.
// We do this by adding ?from=<current path> to any rules links on the page.
try{
  const from = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
  document.querySelectorAll('a[href$="/rules.html"], a[href$="rules.html"]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href || href.includes('from=')) return;
    const sep = href.includes('?') ? '&' : '?';
    a.setAttribute('href', `${href}${sep}from=${from}`);
    // Mark that we navigated to rules so we can safely recover on return.
    a.addEventListener('click', ()=>{
      try { sessionStorage.setItem('PW_RETURN_FROM_RULES','1'); } catch(e){}
    }, {passive:true});
  });
}catch(e){ /* ignore */ }
}

if (!GUIDE_MODE){
  socket.on("online_state", handleOnlineState);
}
if (GUIDE_MODE){
  // Guide mode renders deterministic demo scenes without server/socket.
  window.addEventListener('DOMContentLoaded', ()=>{
    try{
      const qs = new URLSearchParams(window.location.search);
      const scene = qs.get('scene') || 'onecard';
      const clean = (qs.get('clean') === '1');
      try{ if (clean) document.body.classList.add('guide-clean'); }catch(e){}
      try{ document.body.classList.add('guide-mode'); }catch(e){}
      try{
        if (!clean && !document.querySelector('.guideBadge')){
          const b = document.createElement('div');
          b.className = 'guideBadge';
          b.textContent = 'GUIDE MODE · ' + scene;
          document.body.appendChild(b);
        }
      }catch(e){}
      const scenes = window.PW_GUIDE_SCENES || {};
      const st = scenes[scene];
      if (!st){ console.warn('Guide scene not found:', scene); return; }
      handleOnlineState({ room: 'GUIDE', seat: 0, state: st });
      if (window.PW_GUIDE_OVERLAYS && typeof window.PW_GUIDE_OVERLAYS[scene] === 'function'){
        window.PW_GUIDE_OVERLAYS[scene]();
      }
    }catch(e){ console.warn('Guide mode init failed', e); }
  });
}

socket.on("online_left", () => {
  roomCode = null;
  mySeat = null;
  state = null;
  const rl = el("olRoomLabel"); if (rl) rl.textContent = "-";
  const sl = el("olSeatLabel"); if (sl) sl.textContent = "-";
  const s = el("olRoomStatus");
  if (s) s.textContent = "Forlod rum.";
  showRoomWarn("");
  showWarn("");
  render();
});

function myName(){
  const v = (el("olMyName")?.value || "").trim();
  const s = getStoredName();
  return v || s || "Spiller";
}
function playerCount(){ return parseInt(el("olPlayerCount")?.value || "4", 10); }

function populateBotOptions(){
  const players = playerCount();
  const sel = el("olBotCount");
  if (!sel) return;
  const prev = sel.value || "0";
  sel.innerHTML = "";
  const maxBots = Math.max(0, players - 1);
  for (let i=0;i<=maxBots;i++){
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = String(i);
    sel.appendChild(opt);
  }
  if (parseInt(prev,10) <= maxBots) sel.value = prev;
  else sel.value = String(maxBots);
}
function botCount(){
  return parseInt(el("olBotCount")?.value || "0", 10);
}
function syncBotCount(){
  const sel = el("olBotCount");
  if (!sel) return;
  const isHost = (mySeat === 0);
  const inLobby = (state && state.phase === "lobby");
  if (roomCode && state && Array.isArray(state.botSeats)){
    sel.value = String(state.botSeats.length);
    // Host may change bot count while alone in lobby
    sel.disabled = !(isHost && inLobby);
  } else {
    sel.disabled = false;
  }
  populateBotOptions();
}



function syncPlayerCount(){
  const sel = el("olPlayerCount");
  if (!sel) return;
  const isHost = (mySeat === 0);
  const inLobby = (state && state.phase === "lobby");
  if (roomCode && state && typeof state.n === "number"){
    sel.value = String(state.n);
    // Host may change player count while alone in lobby
    sel.disabled = !(isHost && inLobby);
  } else {
    sel.disabled = false;
  }
}

function updateLobbyConfig(){
  if (!roomCode) return;
  if (!state || state.phase !== "lobby") return;
  if (mySeat !== 0) return;
  socket.emit("online_update_lobby", {
    room: roomCode,
    players: playerCount(),
    bots: botCount(),
    name: myName(),
  });
}


function createRoom(){
  // Persist the name before navigating/redirecting across pages
  setStoredName(myName());
  joinInProgress = true;
  pendingCreateRoom = true;
  emitWhenConnected(() => {
    socket.emit("online_create_room", {
      clientId: getClientId(),
      name: myName(),
      players: playerCount(),
      bots: botCount()
    });
    pendingCreateRoom = false;
  });
}
function joinRoom(roomOverride){
  // If used as a click handler, the browser passes an Event object – ignore it.
  if (roomOverride && typeof roomOverride === "object" && ("preventDefault" in roomOverride || "currentTarget" in roomOverride)){
    roomOverride = null;
  }
  const room = normalizeCode((roomOverride !== undefined && roomOverride !== null) ? roomOverride : el("olRoomCode")?.value);
  if (!room) return;
  setStoredName(myName());
  joinInProgress = true;
  pendingJoinRoom = room;
  emitWhenConnected(() => socket.emit("online_join_room", { room, clientId: getClientId(), name: myName() }));
}
function leaveRoom(){
  // Emit leave-room (server authoritative) and navigate user back immediately.
  // This makes the "Forlad" button feel responsive even if network/server is slow.
  try{
    if (roomCode) socket.emit("online_leave_room", { room: roomCode, clientId: getClientId() });
  } catch(_) {}

  // Clear local room so redirects don't bounce back into play.
  try{
    roomCode = null;
    state = null;
  } catch(_) {}

  // Go to the official start page.
  window.location.href = "/piratwhist.html";
}
function startOnline(){ if (roomCode) socket.emit("online_start_game", { room: roomCode }); }
function onNext(){ if (roomCode) socket.emit("online_next", { room: roomCode }); }
function submitBid(){ 
  if (!roomCode) return;
  const v = parseInt(el("olBidSelect")?.value || "0", 10);
  socket.emit("online_set_bid", { room: roomCode, bid: v });
}
function playCard(cardKey){ if (roomCode) socket.emit("online_play_card", { room: roomCode, card: cardKey }); }

function isPlayable(card){
  if (!state) return false;
  if (PW_ANIM?.dealInProgress) return false;
  if (state.phase !== "playing") return false;
  if (mySeat === null || mySeat === undefined) return false;
  if (state.turn !== mySeat) return false;
  if (!state.leadSuit) return true;

  const hand = state.hands ? state.hands[mySeat] : null;
  if (!hand) return false;
  const hasLead = hand.some(c => c.suit === state.leadSuit);
  if (!hasLead) return true;
  return card.suit === state.leadSuit;
}

function renderBidUI(cardsPer){
  const max = cardsPer ?? 0;
  const maxEl = el("olBidMax");
  if (maxEl) maxEl.textContent = String(max);

  const sel = el("olBidSelect");
  if (sel){
    sel.innerHTML = "";
    for (let i=0;i<=max;i++){
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = String(i);
      sel.appendChild(opt);
    }
  }

  const bids = state?.bids || [];
  const myBid = (mySeat!==null && mySeat!==undefined) ? bids[mySeat] : null;
  const status = el("olBidStatus");
  if (status){
    if (state.phase === "lobby") status.textContent = "Lobby";
    else if (state.phase === "dealing") status.textContent = "Dealer";
    else if (state.phase === "bidding") status.textContent = "Afgiv bud";
    else status.textContent = "Bud låst";
  }

  const btn = el("olBidSubmit");
  if (btn){
    const canBid = (state.phase === "bidding") && (mySeat!==null && mySeat!==undefined) && (myBid===null || myBid===undefined);
    btn.disabled = !canBid;
  }
  if (sel){
    sel.disabled = !((state.phase==="bidding") && (mySeat!==null && mySeat!==undefined) && (myBid===null || myBid===undefined));
  }

  // bids list
  const list = el("olBidsList");
  if (list){
    const n = state?.n || playerCount();
    const names = state?.names || Array.from({length:n}, (_,i)=>`Spiller ${i+1}`);
    const parts = [];
    for (let i=0;i<n;i++){
      const b = bids[i];
      // Each item gets data-seat so the deal-animation can target ALL players
      // even on the bidding page (where the round-table board isn't visible).
      parts.push(
        `<span class="bidItem" data-seat="${i}"><b>${names[i] || ("Spiller " + (i+1))}</b>: ${(b===null||b===undefined) ? "—" : b}</span>`
      );
    }
    list.innerHTML = parts.join(" ");
  }
}

function renderScores(){
  const n = state?.n || playerCount();
  const names = state?.names || Array.from({length:n}, (_,i)=>`Spiller ${i+1}`);
  const total = state?.pointsTotal || Array.from({length:n}, ()=>0);
  const bids = state?.bids || [];
  const taken = state?.tricksRound || Array.from({length:n}, ()=>0);

  const rNo = (state?.roundIndex ?? 0) + 1;
  const cardsPerNow = (state?.cardsPer ?? "-");
  if (el("olResRound")) el("olResRound").textContent = String(rNo);
  if (el("olResCards")) el("olResCards").textContent = String(cardsPerNow);

  // Legacy current-round table is no longer used; hide if present
  const t = el("olScoreTable");
  if (t){
    t.innerHTML = "";
    t.style.display = "none";
  }

  // Unified table: TOTAL row at top, then rounds sorted newest -> oldest.
  // Cell format: "Bud / Stik (Point)" (points show "—" if round not finished).
  const h = el("olHistoryTable");
  if (!h) return;

  const histFinished = Array.isArray(state?.history) ? state.history : [];

  // Build a "current round snapshot" row (may be unfinished)
  const currentRow = {
    round: rNo,
    cardsPer: cardsPerNow,
    bids: Array.from({length:n}, (_,i)=> (bids[i]===null||bids[i]===undefined) ? "—" : bids[i]),
    taken: Array.from({length:n}, (_,i)=> (taken[i]===null||taken[i]===undefined) ? 0 : taken[i]),
    points: null,          // unfinished
    unfinished: true
  };

  // Merge: avoid duplicating if server already included current round in history
  const hasCurrentInHist = histFinished.some(r => Number(r.round) === Number(rNo));
  const merged = hasCurrentInHist ? [...histFinished] : [currentRow, ...histFinished];

  // Sort newest -> oldest by round number (ignore TOTAL row)
  merged.sort((a,b)=> (Number(b.round)||0) - (Number(a.round)||0));

  h.innerHTML = "";

  const thead = document.createElement("thead");
  const playerHeads = Array.from({length:n}, (_,i)=>`<th>${names[i] || ("Spiller " + (i+1))}</th>`).join("");
  thead.innerHTML = `<tr><th>Runde</th>${playerHeads}<th>Antal stik</th></tr>`;

  const tbody = document.createElement("tbody");

  // TOTAL row
  {
    const tr = document.createElement("tr");
    let cells = `<td><b>Total</b></td>`;
    for (let i=0;i<n;i++){
      const p = (total[i] ?? 0);
      const pStr = (typeof p === "number" && p >= 0) ? `+${p}` : String(p);
      // Total line should ONLY show points (no bud/stik)
      cells += `<td class="rCell">${pStr}</td>`;
    }
    cells += `<td> </td>`;
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  }

  // Round rows
  for (const row of merged){
    const tr = document.createElement("tr");
    const roundNo = row.round ?? "";
    const cards = row.cardsPer ?? row.cardsPerNow ?? "";
    let cells = `<td><b>${roundNo}</b></td>`;

    for (let i=0;i<n;i++){
      const b = (row.bids && row.bids[i] !== undefined && row.bids[i] !== null) ? row.bids[i] : "—";
      const tk = (row.taken && row.taken[i] !== undefined && row.taken[i] !== null) ? row.taken[i] : "—";

      let pVal = null;
      if (row.points && row.points[i] !== undefined && row.points[i] !== null) pVal = row.points[i];

      const pStr = (pVal===null || pVal===undefined) ? "—" :
        ((typeof pVal === "number" && pVal >= 0) ? `+${pVal}` : String(pVal));

      cells += `<td class="rCell">${b} / ${tk} (${pStr})</td>`;
    }

    cells += `<td>${cards}</td>`;
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  }

  h.appendChild(thead);
  h.appendChild(tbody);
}

function maybeRunAnimations(){
  if (!ENABLE_FLY_CARDS) return;
  if (!state) return;

  // Deal animation: when roundIndex changes OR phase enters bidding and previous wasn't bidding for same round
  if (ENABLE_DEAL_ANIM && state.phase === "dealing" && state.dealId){
    window.__pwDealDone = window.__pwDealDone || {};
    const key = `dealId_${state.dealId}`;
    if (!window.__pwDealDone[key]){
      window.__pwDealDone[key] = true;
      setTimeout(() => runDealAnimation(state.dealSeq || []), 120);
    }
  }

  // Play animations: detect newly placed cards on table
  if (prevState && Array.isArray(prevState.table) && Array.isArray(state.table)){
    for (let i=0;i<state.table.length;i++){
      const a = prevState.table[i];
      const b = state.table[i];
      if (!a && b){
        const lp = window.__pwLastPlayed;
        const useRect = (lp && lp.seat===i && lp.key===`${b.rank}${b.suit}`) ? lp.rect : null;
        runPlayAnimation(i, b, useRect);
        if (useRect) window.__pwLastPlayed = null;
      }
    }
  }

  // If we navigated to the play page mid-trick, prevState may be null.
  // In that case, animate any already-present table cards once so they don't just "pop" in.
  if ((!prevState || !Array.isArray(prevState.table)) && Array.isArray(state.table)){
    try{
      const sig = JSON.stringify(state.table);
      window.__pwInitTableDone = window.__pwInitTableDone || {};
      const key = `${roomCode}|${state.roundIndex}|${sig}`;
      if (!window.__pwInitTableDone[key]){
        window.__pwInitTableDone[key] = true;
        for (let i=0;i<state.table.length;i++){
          const b = state.table[i];
          if (b) setTimeout(()=> runPlayAnimation(i, b, null), 120 + i*60);
        }
      }
    }catch(e){ /* ignore */ }
  }

  // Winner + sweep when a trick completes.
  // NOTE: In some edge cases (page navigation mid-trick, fast state updates)
  // the client may miss a phase transition but still receive winner + table.
  // Therefore we trigger the sweep based on (phase in between_tricks/round_finished)
  // AND presence of winner+table, not solely on phase changes.
  if (ENABLE_SWEEP && state && (state.phase === "between_tricks" || state.phase === "round_finished")){
    if (state.winner !== null && state.winner !== undefined){
      try{
        const sig = JSON.stringify((prevState && prevState.table) ? prevState.table : (state.table || []));
        const key = `${roomCode}|${state.roundIndex}|${state.winner}|${sig}`;
        window.__pwSweepDone = window.__pwSweepDone || {};
        if (!window.__pwSweepDone[key]){
          window.__pwSweepDone[key] = true;
          setTimeout(()=> runTrickSweepAnimationQueued(state.winner, (prevState && prevState.table) ? prevState.table : (state.table || [])), 30);
        }
      }catch(e){ /* ignore */ }
    }
  }
}

function render(){
  if (maybeRedirectForPhase()) return;
  // lobby names view
  const namesWrap = el("olNames");
  if (namesWrap){
    namesWrap.innerHTML = "";
    const n = playerCount();
    const names = state?.names || Array.from({length:n}, (_,i)=>`Spiller ${i+1}`);
    for (let i=0;i<n;i++){
      const name = (names[i] || `Spiller ${i+1}`).trim();
      const row = document.createElement("div");
      row.className = "nameItem";
      row.textContent = name;
      row.title = name; // tooltip for full name
      namesWrap.appendChild(row);
    }
  }

  const info = el("olInfo");
  const roundSpan = el("olRound");
  const cardsPerEl = el("olCardsPer");

  if (!state){
    if (info) info.textContent = "Ikke startet";
    if (roundSpan) roundSpan.textContent = "-";
    if (cardsPerEl) cardsPerEl.textContent = "-";
    if (el("olLeader")) el("olLeader").textContent = "-";
    if (el("olLeadSuit")) el("olLeadSuit").textContent = "-";
    if (el("olWinner")) el("olWinner").textContent = "-";
    if (el("olTable")) el("olTable").innerHTML = "";
    if (el("olHands")) el("olHands").innerHTML = "";
    if (el("olNextRound")) el("olNextRound").disabled = true;
    if (el("olStartOnline")) el("olStartOnline").disabled = !roomCode;
    setHidden("olScores", true);
    return;
  }

  setHidden("olScores", false);

  const rNo = (state.roundIndex ?? 0) + 1;
  // Server-authoritative cards-per-round (52-card safe).
  const cardsPer = Number(state.cardsPer || 0);
  if (roundSpan) roundSpan.textContent = String(rNo);
  if (cardsPerEl) cardsPerEl.textContent = String(cardsPer);

  // top info
  if (info){
    if (state.phase === "lobby"){
      const joined = state.names.filter(Boolean).length;
      info.textContent = `Lobby · ${joined}/${state.n} spillere`;
    } else if (state.phase === "dealing"){
      info.textContent = `Runde ${rNo} · Dealer kort...`;
    } else if (state.phase === "bidding"){
      info.textContent = `Runde ${rNo} · Afgiv bud`;
    } else if (state.phase === "game_finished"){
      info.textContent = "Spil færdigt · 14 runder";
    } else if (state.phase === "round_finished"){
      info.textContent = `Runde ${rNo} færdig · Klik “Næste runde”`;
    } else if (state.phase === "between_tricks"){
      // Winner is shown via the sweep-to-winner animation; keep text neutral.
      info.textContent = "Stik færdig";
    } else {
      info.textContent = `Runde ${rNo} · Tur: ${state.names[state.turn]}`;
    }
  }

  if (el("olLeader")) el("olLeader").textContent = state.names[state.leader] ?? "-";
  if (el("olLeadSuit")) el("olLeadSuit").textContent = state.leadSuit ? `${state.leadSuit} (${SUIT_NAME[state.leadSuit]})` : "-";
  if (el("olWinner")) el("olWinner").textContent = (state.winner===null || state.winner===undefined) ? "-" : (state.names[state.winner] ?? "-");

  // bidding UI
  renderBidUI(cardsPer);

  // Round table board (play page)
  if (el("olCenter")){
    // Build + position the dynamic board DOM (2–8 players)
    ensurePlayBoard(state.n);
    positionPlayBoard(state.n);

    const bids = state.bids || [];
    const taken = state.tricksRound || [];
    const total = state.tricksTotal || [];

    for (let i=0;i<state.n;i++){
      const nm = el(`olSeatName${i}`);
      if (nm){ const name = (state.names[i] || ("Spiller " + (i+1))).trim(); nm.textContent = name; nm.title = name; }
      const b = el(`olSeatBid${i}`);
      if (b) b.textContent = (bids[i]===null || bids[i]===undefined) ? "—" : String(bids[i]);
      const tr = el(`olSeatTricks${i}`);
      if (tr) tr.textContent = String(taken[i] ?? 0);

      // Visual trick counter: dots/chips so the user can read trick counts at a glance.
      const viz = el(`olSeatViz${i}`);
      if (viz){
        const k = Math.max(0, Number(taken[i] ?? 0));
        const maxDots = 10;
        let dots = "";
        const show = Math.min(k, maxDots);
        for (let d=0; d<show; d++) dots += '<span class="dot" aria-hidden="true"></span>';
        if (k > maxDots) dots += `<span class="more">+${k-maxDots}</span>`;
        viz.innerHTML = dots || '<span class="zero">0</span>';
      }
      const tt = el(`olSeatTotal${i}`);
      if (tt) tt.textContent = String(total[i] ?? 0);

      const slot = el(`olTrickSlot${i}`);
      if (slot){
        // Defensive: ensure slots are never left hidden by a previous animation.
        slot.style.opacity = "";
        slot.style.visibility = "";
        slot.innerHTML = "";
        const c = state.table ? state.table[i] : null;
        if (PW_ANIM.sweepHide[i]){
          // While sweep-to-winner runs, hide the real slot so only the moving ghosts are visible.
          slot.style.visibility = "hidden";
        } else if (c){
          // While fly-in runs, suppress rendering at destination to avoid "double" (ghost + final).
          const key = `${c.rank}${c.suit}`;
          if (!PW_ANIM.flyIn[i] || PW_ANIM.flyIn[i] !== key){
            const ce = makeCardEl(c);
            ce.disabled = true;
            slot.appendChild(ce.firstChild);
          }
        }
      }
    }
  }


  // table
  const table = el("olTable");
  if (table){
    const isPlayPage = !!el("olCenter");
    table.innerHTML = "";

    if (isPlayPage){
      // Compact scoreboard (prevents overflow into the board column)
      const bids = state.bids || [];
      const taken = state.tricksRound || [];
      const total = state.tricksTotal || [];
      const wrap = document.createElement("div");
      wrap.className = "scoreMini";

      const head = document.createElement("div");
      head.className = "sub small";
      head.textContent = "Bud · stik (runde) · total";
      wrap.appendChild(head);

      for (let i=0;i<state.n;i++){
        const row = document.createElement("div");
        row.className = "scoreRow";
        const nm = state.names[i] || ("Spiller " + (i+1));
        const b  = (bids[i]===null || bids[i]===undefined) ? "—" : bids[i];
        const tr = taken[i] ?? 0;
        const tt = total[i] ?? 0;
        row.innerHTML = `<b>${nm}</b><span class="pill tiny">Bud: ${b}</span><span class="pill tiny">Stik: ${tr}</span><span class="pill tiny ghost">Total: ${tt}</span>`;
        table.appendChild(row);
      }
    } else {
      // Original table with current trick cards (used on other pages)
      table.style.gridTemplateColumns = `repeat(${Math.min(4,state.n)}, minmax(140px, 1fr))`;
      for (let i=0;i<state.n;i++){
        const slot = document.createElement("div");
        slot.className = "slot";

        const nm = document.createElement("div");
        nm.className = "name";
        const totalTricks = (state.tricksTotal && state.tricksTotal[i] !== undefined) ? state.tricksTotal[i] : 0;
        const roundTricks = (state.tricksRound && state.tricksRound[i] !== undefined) ? state.tricksRound[i] : 0;
        nm.textContent = `${state.names[i] || ("Spiller " + (i+1))} · runde: ${roundTricks} · total: ${totalTricks}`;

        const cd = document.createElement("div");
        cd.className = "card";
        const c = state.table ? state.table[i] : null;
        if (c){
          const ce = makeCardEl(c);
          ce.disabled = true;
          cd.appendChild(ce.firstChild);
        } else {
          cd.textContent = "—";
        }

        slot.appendChild(nm);
        slot.appendChild(cd);
        table.appendChild(slot);
      }
    }
  }

// my hand only
  const hands = el("olHands");
  if (hands){
    hands.innerHTML = "";
    if (state.phase === "dealing" || PW_ANIM?.dealInProgress){
      const p = document.createElement("div");
      p.className = "sub";
      p.textContent = "Dealer kort...";
      hands.appendChild(p);
    } else {
    const mine = (mySeat!==null && mySeat!==undefined && state.hands) ? state.hands[mySeat] : null;
    const cardsPer = (state?.cardsPer || 0);

    // Reset opponent-cards reveal container each render
    const __oppWrap = document.getElementById("olOppCardsWrap");
    const __oppCards = document.getElementById("olOppCards");
    if (__oppWrap) __oppWrap.classList.add("hidden");
    if (__oppCards) __oppCards.innerHTML = "";

    // Special bidding rule (cardsPer==1): show opponents' single cards face-up,
    // but hide your own card (show back) before bidding. Symmetric for all players.
    // IMPORTANT: When this rule is active, the server sends hands[] for opponents,
    // but sets YOUR hand to null. Therefore we must render this section even when
    // `mine` is null.
    const __isSingleCardBid = document.body.classList.contains("page-bidding")
      && (cardsPer === 1 || cardsPer == 1)
      && (state.phase === "dealing" || state.phase === "bidding");

    if (__isSingleCardBid){
      // Show opponents' cards in the dedicated section (preferred)
      const oppWrap = document.getElementById("olOppCardsWrap");
      const oppCards = document.getElementById("olOppCards");
      if (oppWrap) oppWrap.classList.remove("hidden");
      if (oppCards){
        oppCards.innerHTML = "";
        const nSeats = state.n || playerCount();
        for (let i=0;i<nSeats;i++){
          if (i === mySeat) continue; // never show your own card here
          const slot = document.createElement("div");
          slot.className = "bidCardSlot";

          const nm = document.createElement("div");
          nm.className = "bidName";
          nm.textContent = (state.names && state.names[i]) ? state.names[i] : `Spiller ${i+1}`;
          slot.appendChild(nm);

          const cardObj = (state.hands && state.hands[i] && state.hands[i][0]) ? state.hands[i][0] : null;
          let cardEl;
          if (cardObj) {
            cardEl = makeCardEl(cardObj);
            cardEl.disabled = true;
          } else {
            cardEl = makeCardBackEl();
            cardEl.disabled = true;
          }
          slot.appendChild(cardEl);
          oppCards.appendChild(slot);
        }
      }

      // Always render your own hidden card as a single back in the hand area,
      // so the player has a consistent "Din hånd" section.
      const h = document.createElement("div");
      h.className = "hand";
      const head = document.createElement("div");
      head.className = "head";
      const left = document.createElement("div");
      left.innerHTML = `<b>Din hånd</b> <span class="sub">(1 kort)</span>`;
      const right = document.createElement("div");
      right.className = "sub";
      right.textContent = "";
      head.appendChild(left); head.appendChild(right);

      const cards = document.createElement("div");
      cards.className = "cards";
      const mineBack = makeCardBackEl();
      mineBack.disabled = true;
      cards.appendChild(mineBack);

      h.appendChild(head);
      h.appendChild(cards);
      hands.appendChild(h);
      return; // do not render normal hand UI
    }

    if (mine){
      const h = document.createElement("div");
      h.className = "hand";

      const head = document.createElement("div");
      head.className = "head";
      const left = document.createElement("div");
      const isPlayPage = document.body.classList.contains("page-play");
      left.innerHTML = isPlayPage ? `<span class="sub">${mine.length} kort</span>`
                                : `<b>Din hånd</b> <span class="sub">(${mine.length} kort)</span>`;
      const right = document.createElement("div");
      right.className = "sub";
      right.textContent = (state.turn===mySeat && state.phase==="playing") ? "Din tur" : "";
      head.appendChild(left); head.appendChild(right);

      const cards = document.createElement("div");
      cards.className = "cards";

      const cardsPer = (state?.cardsPer || 0);
      // Reset opponent-cards reveal container each render
      const __oppWrap = document.getElementById("olOppCardsWrap");
      const __oppCards = document.getElementById("olOppCards");


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

function normalizeCode(s){ return (s || "").trim(); }



function bootFromUrl(){
  const qp = new URLSearchParams(window.location.search || "");
  const code = normalizeCode(qp.get("code"));
  if (!code) return;

  // Keep any visible input in sync (only exists on the entry page)
  const rc = el("olRoomCode");
  if (rc) rc.value = code;

  // Important: phase pages may not have an input field, so we must
  // join using the URL code directly.
  // Guard against duplicate joins: bootFromUrl runs both on DOMContentLoaded and on
  // socket connect. Without a guard we can join twice and get a new seat.
  if (!roomCode && !joinInProgress) joinRoom(code);
}
const socket = GUIDE_MODE ? {
  connected:false,
  on(){}, off(){}, emit(){}, connect(){}, disconnect(){},
} : io({ transports: ["websocket", "polling"] });


function emitWhenConnected(fn){
  if (socket && socket.connected){
    fn();
    return;
  }
  // Socket.IO will connect automatically, but we defer emits until we are connected
  try { socket.connect(); } catch(e){ /* ignore */ }
  const once = () => {
    socket.off("connect", once);
    fn();
  };
  socket.on("connect", once);
}
let roomCode = null;
let mySeat = null;
let state = null;
let prevState = null;

socket.on("connect", () => {
  const s = el("olRoomStatus");
  if (s) s.textContent = "Forbundet.";
  bootFromUrl();
});

document.addEventListener("DOMContentLoaded", () => {
  // In case the socket connects after DOM is ready or the page is restored
  // from bfcache.
  bootFromUrl();

  // Mobile Safari/Chrome can restore the play page from the back-forward cache
  // when navigating to rules.html and back. In that case, JS timers/listeners
  // and socket state can become stale, causing the game UI to "lock".
  // When this happens, the safest behavior is to reload the current page so
  // we re-attach to the room and re-render state.
  window.addEventListener("pageshow", (ev) => {
    try{
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      const backForward = nav && nav.type === "back_forward";
      const restored = !!ev.persisted || backForward;
      if (restored && document.body && document.body.classList.contains("page-play")){
        // Preserve URL (room code) and force a clean re-init.
        window.location.reload();
      }
    }catch(e){ /* ignore */ }
  }, { passive: true });

  // Keep the round-table layout stable on resize / orientation change.
  window.addEventListener("resize", () => {
    try{
      if (state && el("olCenter")){
        ensurePlayBoard(state.n);
        positionPlayBoard(state.n);
      }
    }catch(e){ /* ignore */ }
  });
  pendingCreateRoom = false;
});

socket.on("error", (data) => {
  const msg = (data?.message || "Ukendt fejl");

  // Robust join: During fast redirects between pages, the server may still be
  // finishing room creation / re-attachment. If we get "Rum ikke fundet" while
  // we *do* have a join pending, retry a few times before showing the error.
  if (msg === "Rum ikke fundet." && pendingJoinRoom && joinRetryCount < 6){
    joinInProgress = false;
    pendingCreateRoom = false;
    joinRetryCount += 1;
    const waitMs = 200 + (joinRetryCount * 150);
    const status = el("olRoomStatus");
    if (status) status.textContent = `Forbinder… (forsøg ${joinRetryCount}/6)`;
    setTimeout(() => {
      // Keep the pendingJoinRoom; try again.
      joinRoom(pendingJoinRoom);
    }, waitMs);
    return;
  }

  joinInProgress = false;
  pendingJoinRoom = null;
  pendingCreateRoom = false;
  joinRetryCount = 0;
  showRoomWarn(msg);
});

function handleOnlineState(payload){
  joinInProgress = false;
  pendingJoinRoom = null;
  pendingCreateRoom = false;
  joinRetryCount = 0;
  roomCode = payload.room;
  if (payload.seat !== null && payload.seat !== undefined) mySeat = payload.seat;
  prevState = state;
  state = payload.state;

  // Expose the current phase to CSS (for responsive layout + hiding side panels during play)
  try{
    const phases = ["lobby","dealing","bidding","playing","between_tricks","round_finished","game_finished"];
    phases.forEach(p=> document.body.classList.remove(`phase-${p}`));
    if (state?.phase) document.body.classList.add(`phase-${state.phase}`);
  }catch(e){ /* ignore */ }

  const rl = el("olRoomLabel"); if (rl) rl.textContent = roomCode || "-";
  const sl = el("olSeatLabel");
  if (sl){
    if (mySeat===null || mySeat===undefined) sl.textContent = "-";
    else sl.textContent = (state?.names?.[mySeat] ? state.names[mySeat] : `Spiller ${mySeat+1}`);
  }
  showRoomWarn("");
  showWarn("");
  syncPlayerCount();
  syncBotCount();
  maybeRunAnimations();

render();

// Ensure the "Regler" link returns to the current page after reading rules.
// We do this by adding ?from=<current path> to any rules links on the page.
try{
  const from = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
  document.querySelectorAll('a[href$="/rules.html"], a[href$="rules.html"]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href || href.includes('from=')) return;
    const sep = href.includes('?') ? '&' : '?';
    a.setAttribute('href', `${href}${sep}from=${from}`);
    // Mark that we navigated to rules so we can safely recover on return.
    a.addEventListener('click', ()=>{
      try { sessionStorage.setItem('PW_RETURN_FROM_RULES','1'); } catch(e){}
    }, {passive:true});
  });
}catch(e){ /* ignore */ }
}

if (!GUIDE_MODE){
  socket.on("online_state", handleOnlineState);
}
if (GUIDE_MODE){
  // Guide mode renders deterministic demo scenes without server/socket.
  window.addEventListener('DOMContentLoaded', ()=>{
    try{
      const qs = new URLSearchParams(window.location.search);
      const scene = qs.get('scene') || 'onecard';
      const clean = (qs.get('clean') === '1');
      try{ if (clean) document.body.classList.add('guide-clean'); }catch(e){}
      try{ document.body.classList.add('guide-mode'); }catch(e){}
      try{
        if (!clean && !document.querySelector('.guideBadge')){
          const b = document.createElement('div');
          b.className = 'guideBadge';
          b.textContent = 'GUIDE MODE · ' + scene;
          document.body.appendChild(b);
        }
      }catch(e){}
      const scenes = window.PW_GUIDE_SCENES || {};
      const st = scenes[scene];
      if (!st){ console.warn('Guide scene not found:', scene); return; }
      handleOnlineState({ room: 'GUIDE', seat: 0, state: st });
      if (window.PW_GUIDE_OVERLAYS && typeof window.PW_GUIDE_OVERLAYS[scene] === 'function'){
        window.PW_GUIDE_OVERLAYS[scene]();
      }
    }catch(e){ console.warn('Guide mode init failed', e); }
  });
}

socket.on("online_left", () => {
  roomCode = null;
  mySeat = null;
  state = null;
  const rl = el("olRoomLabel"); if (rl) rl.textContent = "-";
  const sl = el("olSeatLabel"); if (sl) sl.textContent = "-";
  const s = el("olRoomStatus");
  if (s) s.textContent = "Forlod rum.";
  showRoomWarn("");
  showWarn("");
  render();
});

function myName(){
  const v = (el("olMyName")?.value || "").trim();
  const s = getStoredName();
  return v || s || "Spiller";
}
function playerCount(){ return parseInt(el("olPlayerCount")?.value || "4", 10); }

function populateBotOptions(){
  const players = playerCount();
  const sel = el("olBotCount");
  if (!sel) return;
  const prev = sel.value || "0";
  sel.innerHTML = "";
  const maxBots = Math.max(0, players - 1);
  for (let i=0;i<=maxBots;i++){
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = String(i);
    sel.appendChild(opt);
  }
  if (parseInt(prev,10) <= maxBots) sel.value = prev;
  else sel.value = String(maxBots);
}
function botCount(){
  return parseInt(el("olBotCount")?.value || "0", 10);
}
function syncBotCount(){
  const sel = el("olBotCount");
  if (!sel) return;
  const isHost = (mySeat === 0);
  const inLobby = (state && state.phase === "lobby");
  if (roomCode && state && Array.isArray(state.botSeats)){
    sel.value = String(state.botSeats.length);
    // Host may change bot count while alone in lobby
    sel.disabled = !(isHost && inLobby);
  } else {
    sel.disabled = false;
  }
  populateBotOptions();
}



function syncPlayerCount(){
  const sel = el("olPlayerCount");
  if (!sel) return;
  const isHost = (mySeat === 0);
  const inLobby = (state && state.phase === "lobby");
  if (roomCode && state && typeof state.n === "number"){
    sel.value = String(state.n);
    // Host may change player count while alone in lobby
    sel.disabled = !(isHost && inLobby);
  } else {
    sel.disabled = false;
  }
}

function updateLobbyConfig(){
  if (!roomCode) return;
  if (!state || state.phase !== "lobby") return;
  if (mySeat !== 0) return;
  socket.emit("online_update_lobby", {
    room: roomCode,
    players: playerCount(),
    bots: botCount(),
    name: myName(),
  });
}


function createRoom(){
  // Persist the name before navigating/redirecting across pages
  setStoredName(myName());
  joinInProgress = true;
  pendingCreateRoom = true;
  emitWhenConnected(() => {
    socket.emit("online_create_room", {
      clientId: getClientId(),
      name: myName(),
      players: playerCount(),
      bots: botCount()
    });
    pendingCreateRoom = false;
  });
}
function joinRoom(roomOverride){
  // If used as a click handler, the browser passes an Event object – ignore it.
  if (roomOverride && typeof roomOverride === "object" && ("preventDefault" in roomOverride || "currentTarget" in roomOverride)){
    roomOverride = null;
  }
  const room = normalizeCode((roomOverride !== undefined && roomOverride !== null) ? roomOverride : el("olRoomCode")?.value);
  if (!room) return;
  setStoredName(myName());
  joinInProgress = true;
  pendingJoinRoom = room;
  emitWhenConnected(() => socket.emit("online_join_room", { room, clientId: getClientId(), name: myName() }));
}
function leaveRoom(){
  // Emit leave-room (server authoritative) and navigate user back immediately.
  // This makes the "Forlad" button feel responsive even if network/server is slow.
  try{
    if (roomCode) socket.emit("online_leave_room", { room: roomCode, clientId: getClientId() });
  } catch(_) {}

  // Clear local room so redirects don't bounce back into play.
  try{
    roomCode = null;
    state = null;
  } catch(_) {}

  // Go to the official start page.
  window.location.href = "/piratwhist.html";
}
function startOnline(){ if (roomCode) socket.emit("online_start_game", { room: roomCode }); }
function onNext(){ if (roomCode) socket.emit("online_next", { room: roomCode }); }
function submitBid(){ 
  if (!roomCode) return;
  const v = parseInt(el("olBidSelect")?.value || "0", 10);
  socket.emit("online_set_bid", { room: roomCode, bid: v });
}
function playCard(cardKey){ if (roomCode) socket.emit("online_play_card", { room: roomCode, card: cardKey }); }

function isPlayable(card){
  if (!state) return false;
  if (PW_ANIM?.dealInProgress) return false;
  if (state.phase !== "playing") return false;
  if (mySeat === null || mySeat === undefined) return false;
  if (state.turn !== mySeat) return false;
  if (!state.leadSuit) return true;

  const hand = state.hands ? state.hands[mySeat] : null;
  if (!hand) return false;
  const hasLead = hand.some(c => c.suit === state.leadSuit);
  if (!hasLead) return true;
  return card.suit === state.leadSuit;
}

function renderBidUI(cardsPer){
  const max = cardsPer ?? 0;
  const maxEl = el("olBidMax");
  if (maxEl) maxEl.textContent = String(max);

  const sel = el("olBidSelect");
  if (sel){
    sel.innerHTML = "";
    for (let i=0;i<=max;i++){
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = String(i);
      sel.appendChild(opt);
    }
  }

  const bids = state?.bids || [];
  const myBid = (mySeat!==null && mySeat!==undefined) ? bids[mySeat] : null;
  const status = el("olBidStatus");
  if (status){
    if (state.phase === "lobby") status.textContent = "Lobby";
    else if (state.phase === "dealing") status.textContent = "Dealer";
    else if (state.phase === "bidding") status.textContent = "Afgiv bud";
    else status.textContent = "Bud låst";
  }

  const btn = el("olBidSubmit");
  if (btn){
    const canBid = (state.phase === "bidding") && (mySeat!==null && mySeat!==undefined) && (myBid===null || myBid===undefined);
    btn.disabled = !canBid;
  }
  if (sel){
    sel.disabled = !((state.phase==="bidding") && (mySeat!==null && mySeat!==undefined) && (myBid===null || myBid===undefined));
  }

  // bids list
  const list = el("olBidsList");
  if (list){
    const n = state?.n || playerCount();
    const names = state?.names || Array.from({length:n}, (_,i)=>`Spiller ${i+1}`);
    const parts = [];
    for (let i=0;i<n;i++){
      const b = bids[i];
      // Each item gets data-seat so the deal-animation can target ALL players
      // even on the bidding page (where the round-table board isn't visible).
      parts.push(
        `<span class="bidItem" data-seat="${i}"><b>${names[i] || ("Spiller " + (i+1))}</b>: ${(b===null||b===undefined) ? "—" : b}</span>`
      );
    }
    list.innerHTML = parts.join(" ");
  }
}

function renderScores(){
  const n = state?.n || playerCount();
  const names = state?.names || Array.from({length:n}, (_,i)=>`Spiller ${i+1}`);
  const total = state?.pointsTotal || Array.from({length:n}, ()=>0);
  const bids = state?.bids || [];
  const taken = state?.tricksRound || Array.from({length:n}, ()=>0);

  const rNo = (state?.roundIndex ?? 0) + 1;
  const cardsPerNow = (state?.cardsPer ?? "-");
  if (el("olResRound")) el("olResRound").textContent = String(rNo);
  if (el("olResCards")) el("olResCards").textContent = String(cardsPerNow);

  // Legacy current-round table is no longer used; hide if present
  const t = el("olScoreTable");
  if (t){
    t.innerHTML = "";
    t.style.display = "none";
  }

  // Unified table: TOTAL row at top, then rounds sorted newest -> oldest.
  // Cell format: "Bud / Stik (Point)" (points show "—" if round not finished).
  const h = el("olHistoryTable");
  if (!h) return;

  const histFinished = Array.isArray(state?.history) ? state.history : [];

  // Build a "current round snapshot" row (may be unfinished)
  const currentRow = {
    round: rNo,
    cardsPer: cardsPerNow,
    bids: Array.from({length:n}, (_,i)=> (bids[i]===null||bids[i]===undefined) ? "—" : bids[i]),
    taken: Array.from({length:n}, (_,i)=> (taken[i]===null||taken[i]===undefined) ? 0 : taken[i]),
    points: null,          // unfinished
    unfinished: true
  };

  // Merge: avoid duplicating if server already included current round in history
  const hasCurrentInHist = histFinished.some(r => Number(r.round) === Number(rNo));
  const merged = hasCurrentInHist ? [...histFinished] : [currentRow, ...histFinished];

  // Sort newest -> oldest by round number (ignore TOTAL row)
  merged.sort((a,b)=> (Number(b.round)||0) - (Number(a.round)||0));

  h.innerHTML = "";

  const thead = document.createElement("thead");
  const playerHeads = Array.from({length:n}, (_,i)=>`<th>${names[i] || ("Spiller " + (i+1))}</th>`).join("");
  thead.innerHTML = `<tr><th>Runde</th>${playerHeads}<th>Antal stik</th></tr>`;

  const tbody = document.createElement("tbody");

  // TOTAL row
  {
    const tr = document.createElement("tr");
    let cells = `<td><b>Total</b></td>`;
    for (let i=0;i<n;i++){
      const p = (total[i] ?? 0);
      const pStr = (typeof p === "number" && p >= 0) ? `+${p}` : String(p);
      // Total line should ONLY show points (no bud/stik)
      cells += `<td class="rCell">${pStr}</td>`;
    }
    cells += `<td> </td>`;
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  }

  // Round rows
  for (const row of merged){
    const tr = document.createElement("tr");
    const roundNo = row.round ?? "";
    const cards = row.cardsPer ?? row.cardsPerNow ?? "";
    let cells = `<td><b>${roundNo}</b></td>`;

    for (let i=0;i<n;i++){
      const b = (row.bids && row.bids[i] !== undefined && row.bids[i] !== null) ? row.bids[i] : "—";
      const tk = (row.taken && row.taken[i] !== undefined && row.taken[i] !== null) ? row.taken[i] : "—";

      let pVal = null;
      if (row.points && row.points[i] !== undefined && row.points[i] !== null) pVal = row.points[i];

      const pStr = (pVal===null || pVal===undefined) ? "—" :
        ((typeof pVal === "number" && pVal >= 0) ? `+${pVal}` : String(pVal));

      cells += `<td class="rCell">${b} / ${tk} (${pStr})</td>`;
    }

    cells += `<td>${cards}</td>`;
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  }

  h.appendChild(thead);
  h.appendChild(tbody);
}

function maybeRunAnimations(){
  if (!ENABLE_FLY_CARDS) return;
  if (!state) return;

  // Deal animation: when roundIndex changes OR phase enters bidding and previous wasn't bidding for same round
  if (ENABLE_DEAL_ANIM && state.phase === "dealing" && state.dealId){
    window.__pwDealDone = window.__pwDealDone || {};
    const key = `dealId_${state.dealId}`;
    if (!window.__pwDealDone[key]){
      window.__pwDealDone[key] = true;
      setTimeout(() => runDealAnimation(state.dealSeq || []), 120);
    }
  }

  // Play animations: detect newly placed cards on table
  if (prevState && Array.isArray(prevState.table) && Array.isArray(state.table)){
    for (let i=0;i<state.table.length;i++){
      const a = prevState.table[i];
      const b = state.table[i];
      if (!a && b){
        const lp = window.__pwLastPlayed;
        const useRect = (lp && lp.seat===i && lp.key===`${b.rank}${b.suit}`) ? lp.rect : null;
        runPlayAnimation(i, b, useRect);
        if (useRect) window.__pwLastPlayed = null;
      }
    }
  }

  // If we navigated to the play page mid-trick, prevState may be null.
  // In that case, animate any already-present table cards once so they don't just "pop" in.
  if ((!prevState || !Array.isArray(prevState.table)) && Array.isArray(state.table)){
    try{
      const sig = JSON.stringify(state.table);
      window.__pwInitTableDone = window.__pwInitTableDone || {};
      const key = `${roomCode}|${state.roundIndex}|${sig}`;
      if (!window.__pwInitTableDone[key]){
        window.__pwInitTableDone[key] = true;
        for (let i=0;i<state.table.length;i++){
          const b = state.table[i];
          if (b) setTimeout(()=> runPlayAnimation(i, b, null), 120 + i*60);
        }
      }
    }catch(e){ /* ignore */ }
  }

  // Winner + sweep when a trick completes.
  // NOTE: In some edge cases (page navigation mid-trick, fast state updates)
  // the client may miss a phase transition but still receive winner + table.
  // Therefore we trigger the sweep based on (phase in between_tricks/round_finished)
  // AND presence of winner+table, not solely on phase changes.
  if (ENABLE_SWEEP && state && (state.phase === "between_tricks" || state.phase === "round_finished")){
    if (state.winner !== null && state.winner !== undefined){
      try{
        const sig = JSON.stringify((prevState && prevState.table) ? prevState.table : (state.table || []));
        const key = `${roomCode}|${state.roundIndex}|${state.winner}|${sig}`;
        window.__pwSweepDone = window.__pwSweepDone || {};
        if (!window.__pwSweepDone[key]){
          window.__pwSweepDone[key] = true;
          setTimeout(()=> runTrickSweepAnimationQueued(state.winner, (prevState && prevState.table) ? prevState.table : (state.table || [])), 30);
        }
      }catch(e){ /* ignore */ }
    }
  }
}

function render(){
  if (maybeRedirectForPhase()) return;
  // lobby names view
  const namesWrap = el("olNames");
  if (namesWrap){
    namesWrap.innerHTML = "";
    const n = playerCount();
    const names = state?.names || Array.from({length:n}, (_,i)=>`Spiller ${i+1}`);
    for (let i=0;i<n;i++){
      const name = (names[i] || `Spiller ${i+1}`).trim();
      const row = document.createElement("div");
      row.className = "nameItem";
      row.textContent = name;
      row.title = name; // tooltip for full name
      namesWrap.appendChild(row);
    }
  }

  const info = el("olInfo");
  const roundSpan = el("olRound");
  const cardsPerEl = el("olCardsPer");

  if (!state){
    if (info) info.textContent = "Ikke startet";
    if (roundSpan) roundSpan.textContent = "-";
    if (cardsPerEl) cardsPerEl.textContent = "-";
    if (el("olLeader")) el("olLeader").textContent = "-";
    if (el("olLeadSuit")) el("olLeadSuit").textContent = "-";
    if (el("olWinner")) el("olWinner").textContent = "-";
    if (el("olTable")) el("olTable").innerHTML = "";
    if (el("olHands")) el("olHands").innerHTML = "";
    if (el("olNextRound")) el("olNextRound").disabled = true;
    if (el("olStartOnline")) el("olStartOnline").disabled = !roomCode;
    setHidden("olScores", true);
    return;
  }

  setHidden("olScores", false);

  const rNo = (state.roundIndex ?? 0) + 1;
  // Server-authoritative cards-per-round (52-card safe).
  const cardsPer = Number(state.cardsPer || 0);
  if (roundSpan) roundSpan.textContent = String(rNo);
  if (cardsPerEl) cardsPerEl.textContent = String(cardsPer);

  // top info
  if (info){
    if (state.phase === "lobby"){
      const joined = state.names.filter(Boolean).length;
      info.textContent = `Lobby · ${joined}/${state.n} spillere`;
    } else if (state.phase === "dealing"){
      info.textContent = `Runde ${rNo} · Dealer kort...`;
    } else if (state.phase === "bidding"){
      info.textContent = `Runde ${rNo} · Afgiv bud`;
    } else if (state.phase === "game_finished"){
      info.textContent = "Spil færdigt · 14 runder";
    } else if (state.phase === "round_finished"){
      info.textContent = `Runde ${rNo} færdig · Klik “Næste runde”`;
    } else if (state.phase === "between_tricks"){
      // Winner is shown via the sweep-to-winner animation; keep text neutral.
      info.textContent = "Stik færdig";
    } else {
      info.textContent = `Runde ${rNo} · Tur: ${state.names[state.turn]}`;
    }
  }

  if (el("olLeader")) el("olLeader").textContent = state.names[state.leader] ?? "-";
  if (el("olLeadSuit")) el("olLeadSuit").textContent = state.leadSuit ? `${state.leadSuit} (${SUIT_NAME[state.leadSuit]})` : "-";
  if (el("olWinner")) el("olWinner").textContent = (state.winner===null || state.winner===undefined) ? "-" : (state.names[state.winner] ?? "-");

  // bidding UI
  renderBidUI(cardsPer);

  // Round table board (play page)
  if (el("olCenter")){
    // Build + position the dynamic board DOM (2–8 players)
    ensurePlayBoard(state.n);
    positionPlayBoard(state.n);

    const bids = state.bids || [];
    const taken = state.tricksRound || [];
    const total = state.tricksTotal || [];

    for (let i=0;i<state.n;i++){
      const nm = el(`olSeatName${i}`);
      if (nm){ const name = (state.names[i] || ("Spiller " + (i+1))).trim(); nm.textContent = name; nm.title = name; }
      const b = el(`olSeatBid${i}`);
      if (b) b.textContent = (bids[i]===null || bids[i]===undefined) ? "—" : String(bids[i]);
      const tr = el(`olSeatTricks${i}`);
      if (tr) tr.textContent = String(taken[i] ?? 0);

      // Visual trick counter: dots/chips so the user can read trick counts at a glance.
      const viz = el(`olSeatViz${i}`);
      if (viz){
        const k = Math.max(0, Number(taken[i] ?? 0));
        const maxDots = 10;
        let dots = "";
        const show = Math.min(k, maxDots);
        for (let d=0; d<show; d++) dots += '<span class="dot" aria-hidden="true"></span>';
        if (k > maxDots) dots += `<span class="more">+${k-maxDots}</span>`;
        viz.innerHTML = dots || '<span class="zero">0</span>';
      }
      const tt = el(`olSeatTotal${i}`);
      if (tt) tt.textContent = String(total[i] ?? 0);

      const slot = el(`olTrickSlot${i}`);
      if (slot){
        // Defensive: ensure slots are never left hidden by a previous animation.
        slot.style.opacity = "";
        slot.style.visibility = "";
        slot.innerHTML = "";
        const c = state.table ? state.table[i] : null;
        if (PW_ANIM.sweepHide[i]){
          // While sweep-to-winner runs, hide the real slot so only the moving ghosts are visible.
          slot.style.visibility = "hidden";
        } else if (c){
          // While fly-in runs, suppress rendering at destination to avoid "double" (ghost + final).
          const key = `${c.rank}${c.suit}`;
          if (!PW_ANIM.flyIn[i] || PW_ANIM.flyIn[i] !== key){
            const ce = makeCardEl(c);
            ce.disabled = true;
            slot.appendChild(ce.firstChild);
          }
        }
      }
    }
  }


  // table
  const table = el("olTable");
  if (table){
    const isPlayPage = !!el("olCenter");
    table.innerHTML = "";

    if (isPlayPage){
      // Compact scoreboard (prevents overflow into the board column)
      const bids = state.bids || [];
      const taken = state.tricksRound || [];
      const total = state.tricksTotal || [];
      const wrap = document.createElement("div");
      wrap.className = "scoreMini";

      const head = document.createElement("div");
      head.className = "sub small";
      head.textContent = "Bud · stik (runde) · total";
      wrap.appendChild(head);

      for (let i=0;i<state.n;i++){
        const row = document.createElement("div");
        row.className = "scoreRow";
        const nm = state.names[i] || ("Spiller " + (i+1));
        const b  = (bids[i]===null || bids[i]===undefined) ? "—" : bids[i];
        const tr = taken[i] ?? 0;
        const tt = total[i] ?? 0;
        row.innerHTML = `<b>${nm}</b><span class="pill tiny">Bud: ${b}</span><span class="pill tiny">Stik: ${tr}</span><span class="pill tiny ghost">Total: ${tt}</span>`;
        table.appendChild(row);
      }
    } else {
      // Original table with current trick cards (used on other pages)
      table.style.gridTemplateColumns = `repeat(${Math.min(4,state.n)}, minmax(140px, 1fr))`;
      for (let i=0;i<state.n;i++){
        const slot = document.createElement("div");
        slot.className = "slot";

        const nm = document.createElement("div");
        nm.className = "name";
        const totalTricks = (state.tricksTotal && state.tricksTotal[i] !== undefined) ? state.tricksTotal[i] : 0;
        const roundTricks = (state.tricksRound && state.tricksRound[i] !== undefined) ? state.tricksRound[i] : 0;
        nm.textContent = `${state.names[i] || ("Spiller " + (i+1))} · runde: ${roundTricks} · total: ${totalTricks}`;

        const cd = document.createElement("div");
        cd.className = "card";
        const c = state.table ? state.table[i] : null;
        if (c){
          const ce = makeCardEl(c);
          ce.disabled = true;
          cd.appendChild(ce.firstChild);
        } else {
          cd.textContent = "—";
        }

        slot.appendChild(nm);
        slot.appendChild(cd);
        table.appendChild(slot);
      }
    }
  }

// my hand only
  const hands = el("olHands");
  if (hands){
    hands.innerHTML = "";
    if (state.phase === "dealing" || PW_ANIM?.dealInProgress){
      const p = document.createElement("div");
      p.className = "sub";
      p.textContent = "Dealer kort...";
      hands.appendChild(p);
    } else {
    const mine = (mySeat!==null && mySeat!==undefined && state.hands) ? state.hands[mySeat] : null;
    const cardsPer = (state?.cardsPer || 0);

    // Reset opponent-cards reveal container each render
    const __oppWrap = document.getElementById("olOppCardsWrap");
    const __oppCards = document.getElementById("olOppCards");
    if (__oppWrap) __oppWrap.classList.add("hidden");
    if (__oppCards) __oppCards.innerHTML = "";

    // Special bidding rule (cardsPer==1): show opponents' single cards face-up,
    // but hide your own card (show back) before bidding. Symmetric for all players.
    // IMPORTANT: When this rule is active, the server sends hands[] for opponents,
    // but sets YOUR hand to null. Therefore we must render this section even when
    // `mine` is null.
    const __isSingleCardBid = document.body.classList.contains("page-bidding")
      && (cardsPer === 1 || cardsPer == 1)
      && (state.phase === "dealing" || state.phase === "bidding");

    if (__isSingleCardBid){
      // Show opponents' cards in the dedicated section (preferred)
      const oppWrap = document.getElementById("olOppCardsWrap");
      const oppCards = document.getElementById("olOppCards");
      if (oppWrap) oppWrap.classList.remove("hidden");
      if (oppCards){
        oppCards.innerHTML = "";
        const nSeats = state.n || playerCount();
        for (let i=0;i<nSeats;i++){
          if (i === mySeat) continue; // never show your own card here
          const slot = document.createElement("div");
          slot.className = "bidCardSlot";

          const nm = document.createElement("div");
          nm.className = "bidName";
          nm.textContent = (state.names && state.names[i]) ? state.names[i] : `Spiller ${i+1}`;
          slot.appendChild(nm);

          const cardObj = (state.hands && state.hands[i] && state.hands[i][0]) ? state.hands[i][0] : null;
          let cardEl;
          if (cardObj) {
            cardEl = makeCardEl(cardObj);
            cardEl.disabled = true;
          } else {
            cardEl = makeCardBackEl();
            cardEl.disabled = true;
          }
          slot.appendChild(cardEl);
          oppCards.appendChild(slot);
        }
      }

      // Always render your own hidden card as a single back in the hand area,
      // so the player has a consistent "Din hånd" section.
      const h = document.createElement("div");
      h.className = "hand";
      const head = document.createElement("div");
      head.className = "head";
      const left = document.createElement("div");
      left.innerHTML = `<b>Din hånd</b> <span class="sub">(1 kort)</span>`;
      const right = document.createElement("div");
      right.className = "sub";
      right.textContent = "";
      head.appendChild(left); head.appendChild(right);

      const cards = document.createElement("div");
      cards.className = "cards";
      const mineBack = makeCardBackEl();
      mineBack.disabled = true;
      cards.appendChild(mineBack);

      h.appendChild(head);
      h.appendChild(cards);
      hands.appendChild(h);
      return; // do not render normal hand UI
    }

    if (mine){
      const h = document.createElement("div");
      h.className = "hand";

      const head = document.createElement("div");
      head.className = "head";
      const left = document.createElement("div");
      const isPlayPage = document.body.classList.contains("page-play");
      left.innerHTML = isPlayPage ? `<span class="sub">${mine.length} kort</span>`
                                : `<b>Din hånd</b> <span class="sub">(${mine.length} kort)</span>`;
      const right = document.createElement("div");
      right.className = "sub";
      right.textContent = (state.turn===mySeat && state.phase==="playing") ? "Din tur" : "";
      head.appendChild(left); head.appendChild(right);

      const cards = document.createElement("div");
      cards.className = "cards";

      const cardsPer = (state?.cardsPer || 0);
      // Reset opponent-cards reveal container each render
      const __oppWrap = document.getElementById("olOppCardsWrap");
      const __oppCards = document.getElementById("olOppCards");
      if (__oppWrap) __oppWrap.classList.add("hidden");
      if (__oppCards) __oppCards.innerHTML = "";


      // Special bidding rule (cardsPer==1): show opponents' single cards face-up,
      // but hide your own card (show back) before bidding. Symmetric for all players.
      if (document.body.classList.contains("page-bidding") && (cardsPer === 1 || cardsPer == 1) && (state.phase === "dealing" || state.phase === "bidding")) {
        // Special bidding rule (cardsPer==1): show opponents' single cards face-up,
        // but hide your own card (show back) before bidding. Symmetric for all players.
        const oppWrap = document.getElementById("olOppCardsWrap");
        const oppCards = document.getElementById("olOppCards");
        if (oppCards){
          oppCards.innerHTML = "";
          if (oppWrap) oppWrap.classList.remove("hidden");

          const nSeats = state.n || playerCount();
          for (let i=0;i<nSeats;i++){
            if (i === mySeat) continue; // never show your own card here
            const slot = document.createElement("div");
            slot.className = "bidCardSlot";

            const nm = document.createElement("div");
            nm.className = "bidName";
            nm.textContent = (state.names && state.names[i]) ? state.names[i] : `Spiller ${i+1}`;
            slot.appendChild(nm);

            const cardObj = (state.hands && state.hands[i] && state.hands[i][0]) ? state.hands[i][0] : null;
            let cardEl;
            if (cardObj) {
              cardEl = makeCardEl(cardObj);
              cardEl.disabled = true;
            } else {
              // Fallback: show back if card is not available yet
              cardEl = makeCardBackEl();
            }
            slot.appendChild(cardEl);
            oppCards.appendChild(slot);
          }
        } else {
          // Fallback for older HTML: render everything into the hand area
          cards.classList.add("bidReveal");
          const nSeats = state.n || playerCount();
          for (let i=0;i<nSeats;i++){
            const slot = document.createElement("div");
            slot.className = "bidCardSlot";

            const nm = document.createElement("div");
            nm.className = "bidName";
            nm.textContent = (state.names && state.names[i]) ? state.names[i] : `Spiller ${i+1}`;
            slot.appendChild(nm);

            const cardObj = (state.hands && state.hands[i] && state.hands[i][0]) ? state.hands[i][0] : null;
            let cardEl;
            if (i === mySeat) {
              cardEl = makeCardBackEl();
            } else if (cardObj) {
              cardEl = makeCardEl(cardObj);
              cardEl.disabled = true;
            } else {
              cardEl = makeCardBackEl();
            }
            slot.appendChild(cardEl);
            cards.appendChild(slot);
          }
        }

        // Always hide your own card in the hand area (show back only)
        const mineBack = makeCardBackEl();
        mineBack.disabled = true;
        cards.appendChild(mineBack);
      } else {
        const mineSorted = sortHand(mine);
        for (const c of mineSorted){
          const b = makeCardEl(c);
          b.disabled = !isPlayable(c);
          b.addEventListener("click", () => {
          // Save a precise start position for the fly-in animation (only for your own plays)
          if (ENABLE_FLY) window.__pwLastPlayed = { seat: mySeat, key: `${c.rank}${c.suit}`, rect: b.getBoundingClientRect() };
          playCard(`${c.rank}${c.suit}`);
        });
        cards.appendChild(b);
      }
      }

      h.appendChild(head);
      h.appendChild(cards);
      hands.appendChild(h);
    } else {
      const p = document.createElement("div");
      p.className = "sub";
      p.textContent = roomCode ? "Vent på start." : "Opret eller join et rum.";
      hands.appendChild(p);
    }
    }
  }

  // buttons
  if (el("olStartOnline")) el("olStartOnline").disabled = !(state.phase === "lobby");
  if (el("olNextRound")){
    el("olNextRound").disabled = !(state.phase === "between_tricks" || state.phase === "round_finished");
    if (state.phase === "between_tricks") el("olNextRound").textContent = "Næste stik";
    else if (state.phase === "round_finished") el("olNextRound").textContent = "Næste runde";
    else el("olNextRound").textContent = "Næste";
  }

  // PC HUD: keep values in the corners (and wire buttons, incl. Regler)
  syncPcHud();
  wirePcHudButtons();
  const rulesBtn = el("olRules");
  if (rulesBtn) rulesBtn.onclick = goToRules;
  const pcRules = el("pcRules");
  if (pcRul
