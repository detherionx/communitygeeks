export const focusContent={
 customers:{label:'Customers',hint:'Find what drives adoption and repeat use.',headline:'Understand what makes customers adopt.',steps:[['LOOK FOR','Usage patterns, friction, unmet needs and relationships shaping adoption.'],['DO','Research customer needs and adoption barriers, then recommend where to invest and what to change.'],['CHANGE','Evidence and priorities to help improve adoption and lasting product use.']]},
 developers:{label:'Developers',hint:'See where builders extend your product, or get stuck.',headline:'Understand what makes developers build.',steps:[['LOOK FOR','What developers try to build, where integration breaks and what they need.'],['DO','Research developer needs, assess friction and recommend changes to enablement or program design.'],['CHANGE','A practical plan to help more developers reach useful integrations.']]},
 partners:{label:'Partners',hint:'Find relationships that create reach and new business.',headline:'Understand where partners create value.',steps:[['LOOK FOR','Who extends your reach, where incentives align and which relationships can work.'],['DO','Assess partner opportunities, incentives and fit, then recommend which relationships deserve investment.'],['CHANGE','Clear priorities for stronger partner relationships and routes to market.']]},
 team:{label:'Your team',hint:'Research → decide → act',headline:'Decide where to act.',steps:[['RESEARCH','Our research helps you understand what is happening.'],['DECIDE','Choose where intervention can matter.'],['ACT','Your team chooses how to put the recommendation into practice.'],['MEASURE','See what changes.']]}
};
export function focusPhase(seconds){const t=seconds%12;return t<4?0:t<8?1:2;}
export function nextFocus(current,requested){return current===requested?null:requested;}
export function trackHero(name,data={}){
 // Local previews emit a testable event but never send production analytics.
 window.dispatchEvent(new CustomEvent('communitygeeks:hero',{detail:{name,...data}}));
 if(!['localhost','127.0.0.1'].includes(location.hostname)&&typeof window.umami?.track==='function')window.umami.track(name,data);
}
