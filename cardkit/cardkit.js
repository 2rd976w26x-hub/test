
export function initCardKit(){}
export function createCard(card,{faceUp=true}={}){
  const d=document.createElement("div");
  d.className="playingcard";
  d.textContent=faceUp?card.rank+card.suit:"🂠";
  return d;
}
