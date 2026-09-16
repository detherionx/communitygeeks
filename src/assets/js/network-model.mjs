export const worlds={customers:{position:[-1.35,1.25,-1.4],radius:1.45},developers:{position:[1.55,.55,-.1],radius:1.05},partners:{position:[1.65,-2.35,1.8],radius:1.2}};
export const anchors={customers:[-1.45,3.1,-1.4],developers:[1.8,2.1,-.1],partners:[-1.35,-2.1,1.8],team:[-.65,-.85,.5]};
export const smooth=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function story(seconds,still=false){const t=still?17:seconds%20,reset=1-smooth(19,20,t);return {t,signal:smooth(3,4,t)*(1-smooth(6,7,t)),incoming:smooth(5,7,t),decision:smooth(7,7.5,t)*(1-smooth(8,9,t)),outgoing:smooth(8,11,t),integration:smooth(11,12,t)*reset,returning:smooth(12,15,t),outcome:smooth(15,16,t)*reset};}
export const shouldAnimate=({visible,hidden,paused,reduced,lost})=>visible&&!hidden&&!paused&&!reduced&&!lost;

export const heroScrollAngle=(progress,reduced=false)=>reduced?0:Math.max(0,Math.min(1,progress))*7*Math.PI/180;
