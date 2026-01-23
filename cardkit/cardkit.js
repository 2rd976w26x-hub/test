export function initCardKit(opts = {}){
  const root = document.documentElement;
  if (opts.backUrl){
    root.style.setProperty("--cardback-url", `url("${opts.backUrl}")`);
  }
}
export function createCard(card,{faceUp=true}={}){
  const d=document.createElement("div");
  d.className="playingcard";
  d.textContent=faceUp?`${card.rank}${card.suit}`:"🂠";
  return d;
}
