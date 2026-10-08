/* Constellation ring with faint aura. Approved crew assets remain unchanged. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ConstellationMotifs=factory();})(typeof self!=='undefined'?self:this,function(){
  'use strict';
  const scenes={
  "idea-to-product": {
    "title": "Choosing where a contribution belongs",
    "en": "An astronaut places a knight on a constellation chess field: when making the piece gets easy, human judgement still gives it a place.",
    "de": "Ein Astronaut setzt einen Springer auf ein Sternbild-Schachfeld: Wenn die Herstellung leicht wird, gibt menschliches Urteilsvermögen dem Beitrag seinen Platz.",
    "body": "<image href=\"/assets/images/article-motifs/idea-to-product-chess.png\" x=\"88\" y=\"88\" width=\"330\" height=\"330\"/>"
},
  "muay-thai": {
    "title": "Becoming part of a community through shared practice",
    "en": "Two astronauts practice Muay Thai together: one wears a Mongkhon and delivers a knee strike into the other's pads.",
    "de": "Zwei Astronauten trainieren gemeinsam Muay Thai: Einer trägt einen Mongkhon und übt einen Kniestoß gegen die Pratzen des anderen.",
    "body": "<image href=\"/assets/images/article-motifs/muay-thai-knee.png\" x=\"100\" y=\"101\" width=\"318\" height=\"318\"/>"
  },
  "horologium": {
    "title": "Human review in an executable loop",
    "en": "An astronaut reviews candidate evidence and controls an approval gate in a recruiting workflow.",
    "de": "Ein Astronaut prüft Bewerbernachweise und bedient eine Freigabeschranke im Recruiting-Ablauf.",
    "body": "<image href=\"/assets/images/article-motifs/recruiting-review.png\" x=\"88\" y=\"88\" width=\"330\" height=\"330\"/>"
  },
  "cookie-jar": {
    "title": "The exchange gives the platform its purpose",
    "en": "A kneeling astronaut offers a cookie from one shared jar to a standing participant.",
    "de": "Ein kniender Astronaut bietet einem stehenden Teilnehmer einen Keks aus einem gemeinsamen Glas an.",
    "body": "<image href=\"/assets/images/article-motifs/sharing-from-one-jar.png\" x=\"88\" y=\"88\" width=\"330\" height=\"330\"/>"
  },
  "pyxis": {
    "title": "Check the claim against an independent reference",
    "en": "An astronaut uses a telescope and a separate reference book to check an observation independently.",
    "de": "Ein Astronaut prüft eine Beobachtung unabhängig mit einem Teleskop und einem separaten Nachschlagewerk.",
    "body": "<image href=\"/assets/images/article-motifs/independent-verification.png\" x=\"88\" y=\"88\" width=\"330\" height=\"330\"/>"
  },
  "thread": {
    "title": "Freedom inside explicit limits",
    "en": "An astronaut adjusts a low boundary while a small drone operates inside it.",
    "de": "Ein Astronaut stellt eine niedrige Begrenzung ein, innerhalb derer eine kleine Drohne agiert.",
    "body": "<image href=\"/assets/images/article-motifs/setting-autonomy-boundaries.png\" x=\"88\" y=\"88\" width=\"330\" height=\"330\"/>"
  },
  "gaming": {
    "title": "Working across functional boundaries",
    "en": "Two astronauts connect separate game-studio and public-institution workstations.",
    "de": "Zwei Astronauten verbinden getrennte Arbeitsstationen eines Spielestudios und einer öffentlichen Institution.",
    "body": "<image href=\"/assets/images/article-motifs/studio-institution-connection.png\" x=\"88\" y=\"88\" width=\"330\" height=\"330\"/>"
  },
  "reticulum": {
    "title": "Tending the connections among six groups",
    "en": "An astronaut tends a six-port connection hub representing six participant groups.",
    "de": "Ein Astronaut wartet einen Verbindungsknoten mit sechs Anschlüssen für sechs Teilnehmergruppen.",
    "body": "<image href=\"/assets/images/article-motifs/six-participant-connections.png\" x=\"88\" y=\"88\" width=\"330\" height=\"330\"/>"
  }
};
  function ring(id,front){
    const path=front?'M444 248A194 80 0 0 1 56 248':'M56 248A194 80 0 0 1 444 248';
    const angles=front?[.35,1.2,2.4]:[3.5,4.4,5.5];
    return `<g transform="rotate(20 250 248)">
      <path class="orbital-aura" d="${path}" fill="none" stroke="url(#${id}-dust)" stroke-width="10" filter="url(#${id}-mist)"/>
      <path d="${path}" fill="none" stroke="#FCF5D5" stroke-width=".85"/>
      ${angles.map(a=>{const x=250+194*Math.cos(a),y=248+80*Math.sin(a);return `<circle class="orbital-aura" cx="${x}" cy="${y}" r="7" fill="url(#${id}-star)"/><circle cx="${x}" cy="${y}" r="1.5" fill="#fcf5d5"/>`}).join('')}
    </g>`;
  }
  function motifSvg(kind,ctx='record',ground='dark',lang='en'){
    if(kind==='people-beyond-container')kind='reticulum';const scene=scenes[kind];if(!scene)return '';
    const id=`orbit-${kind}-${ctx}-${ground}-${lang}`,description=scene[lang]||scene.en;
    const a11y=ctx==='masthead'?`role="img" aria-label="${description}"`:'aria-hidden="true"';
    return `<svg class="cm cm--${ctx} cm--${ground} cm-${kind} cm-orbital" viewBox="0 35 500 420" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" ${a11y} focusable="false">
      <defs>
        <radialGradient id="${id}" cx="35%" cy="25%" r="85%"><stop stop-color="#285455"/><stop offset="1" stop-color="#092b30"/></radialGradient>
        <filter id="${id}-mist" filterUnits="userSpaceOnUse" x="35" y="33" width="430" height="430" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="3" seed="17" result="cloud"/>
          <feDisplacementMap in="SourceGraphic" in2="cloud" scale="9" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="2.8"/>
        </filter>
        <linearGradient id="${id}-dust" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F29660" stop-opacity=".28"/><stop offset=".35" stop-color="#fcf5d5" stop-opacity=".38"/><stop offset=".7" stop-color="#F29660" stop-opacity=".3"/><stop offset="1" stop-color="#F29660" stop-opacity=".28"/></linearGradient>
        <radialGradient id="${id}-star"><stop stop-color="#fcf5d5" stop-opacity=".8"/><stop offset=".35" stop-color="#F29660" stop-opacity=".4"/><stop offset="1" stop-color="#F29660" stop-opacity="0"/></radialGradient>
      </defs>
      ${ring(id,false)}
      <circle cx="250" cy="248" r="146" fill="url(#${id})"/>
      ${scene.body}
      ${ring(id,true)}
    </svg>`;
  }
  return {motifSvg,kinds:Object.keys(scenes),scenes};
});
