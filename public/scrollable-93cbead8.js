import{ae as L,V as P,br as g,c as h,a6 as b,a5 as A,I as y}from"./index-257913ec.js";import{u as E,e as M}from"./page-e73ef7e4.js";const w=24,a=!g;let S,m;a?(S=n=>requestAnimationFrame(n),m=n=>cancelAnimationFrame(n)):(S=n=>window.setTimeout(n,w),m=n=>window.clearTimeout(n));class f{constructor(t,o="",c=document.createElement("div")){this.el=t,this.container=c,this.onScrollMeasure=0,this.lastScrollPosition=0,this.lastScrollDirection=0,this.isHeavyAnimationInProgress=!1,this.needCheckAfterAnimation=!1,this.onScroll=()=>{if(this.isHeavyAnimationInProgress){this.cancelMeasure(),this.needCheckAfterAnimation=!0;return}!this.onScrolledTop&&!this.onScrolledBottom&&!this.splitUp&&!this.onAdditionalScroll||this.onScrollMeasure||(this.onScrollMeasure=S(()=>{this.onScrollMeasure=0;const i=this.scrollPosition;if(this.lastScrollDirection=this.lastScrollPosition===i?0:this.lastScrollPosition<i?1:-1,this.lastScrollPosition=i,a&&this.thumb){const s=this.container[this.scrollSizeProperty],e=this.container[this.clientSizeProperty],r=s/e/.75,l=Math.max(20,e/r),d=i/(s-e)*e,p=i/(s-e),u=e-l;e<s?(this.thumb.style.height=l+"px",this.thumb.style.transform=`translateY(${Math.min(u,d-l*p)}px)`):this.thumb.style.height="0px"}this.onAdditionalScroll&&this.onAdditionalScroll(),this.checkForTriggers&&this.checkForTriggers()}))},this.onMouseMove=i=>{h(i);const s=this.scrollSize,e=this.clientSize,r=this.thumb.offsetHeight,l=s-e,d=e-r,u=(i[this.clientAxis]-this.startMousePosition)/d*l,v=this.startScrollPosition+u;this.scrollPosition=v},this.onMouseDown=i=>{h(i),this.startMousePosition=i[this.clientAxis],this.startScrollPosition=this.scrollPosition,this.thumb.classList.add("is-focused"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp,{once:!0})},this.onMouseUp=i=>{window.removeEventListener("mousemove",this.onMouseMove),this.thumb.classList.remove("is-focused")},this.container.classList.add("scrollable"),this.log=b("SCROLL"+(o?"-"+o:""),A.Error),t&&(Array.from(t.children).forEach(i=>this.container.append(i)),t.append(this.container))}addScrollListener(){this.addedScrollListener||(this.addedScrollListener=!0,this.container.addEventListener("scroll",this.onScroll,{passive:!0,capture:!0}))}removeScrollListener(){this.addedScrollListener&&(this.addedScrollListener=!1,this.container.removeEventListener("scroll",this.onScroll,{capture:!0}))}setListeners(){this.removeHeavyAnimationListener||(window.addEventListener("resize",this.onScroll,{passive:!0}),this.addScrollListener(),this.removeHeavyAnimationListener=E(()=>{this.isHeavyAnimationInProgress=!0,this.onScrollMeasure&&(this.cancelMeasure(),this.needCheckAfterAnimation=!0)},()=>{this.isHeavyAnimationInProgress=!1,this.needCheckAfterAnimation&&(this.onScroll(),this.needCheckAfterAnimation=!1)}))}removeListeners(){this.removeHeavyAnimationListener&&(window.removeEventListener("resize",this.onScroll),this.thumb&&(this.thumb.removeEventListener("mousedown",this.onMouseMove),window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)),this.removeScrollListener(),this.removeHeavyAnimationListener(),this.removeHeavyAnimationListener=void 0)}destroy(){this.removeListeners(),this.onAdditionalScroll=void 0,this.onScrolledTop=void 0,this.onScrolledBottom=void 0}prepend(...t){const o=this.splitUp||this.padding||this.container;this.thumb&&o!==this.container&&t.unshift(this.thumbContainer),o.prepend(...t),this.onSizeChange()}append(...t){(this.splitUp||this.padding||this.container).append(...t),this.onSizeChange()}scrollIntoViewNew(t){return M({...t,container:this.container})}cancelMeasure(){this.onScrollMeasure&&(m(this.onScrollMeasure),this.onScrollMeasure=0)}onSizeChange(){a&&this.thumb&&this.onScroll()}getDistanceToEnd(){return this.scrollSize-Math.round(this.scrollPosition+this.offsetSize)}get isScrolledToEnd(){return this.getDistanceToEnd()<=1}get scrollPosition(){return this.container[this.scrollPositionProperty]}set scrollPosition(t){this.container[this.scrollPositionProperty]=t}get scrollSize(){return this.container[this.scrollSizeProperty]}get clientSize(){return this.container[this.clientSizeProperty]}get offsetSize(){return this.container[this.offsetSizeProperty]}get firstElementChild(){return this.thumb?this.thumbContainer.nextElementSibling:this.container.firstElementChild}setScrollPositionSilently(t){this.lastScrollPosition=t,this.ignoreNextScrollEvent(),this.scrollPosition=t}ignoreNextScrollEvent(){this.removeHeavyAnimationListener&&(this.removeScrollListener(),this.container.addEventListener("scroll",t=>{h(t),this.addScrollListener()},{capture:!0,passive:!1,once:!0}))}replaceChildren(...t){this.thumb&&t.unshift(this.thumbContainer),this.container.replaceChildren(...t)}}class T extends f{constructor(t,o="",c=300,i){super(t,o),this.onScrollOffset=c,this.loadedAll={top:!0,bottom:!1},this.checkForTriggers=()=>{if(!this.onScrolledTop&&!this.onScrolledBottom)return;if(this.isHeavyAnimationInProgress){this.onScroll();return}const s=this.container.scrollHeight;if(!s)return;const e=this.container.clientHeight,r=s-e,l=this.lastScrollPosition;this.onScrolledTop&&l<=this.onScrollOffset&&this.lastScrollDirection<=0&&this.onScrolledTop(),this.onScrolledBottom&&r-l<=this.onScrollOffset&&this.lastScrollDirection>=0&&this.onScrolledBottom()},this.scrollPositionProperty="scrollTop",this.scrollSizeProperty="scrollHeight",this.clientSizeProperty="clientHeight",this.offsetSizeProperty="offsetHeight",this.clientAxis="clientY",a&&(this.thumbContainer=document.createElement("div"),this.thumbContainer.classList.add("scrollable-thumb-container"),this.thumb=document.createElement("div"),this.thumb.classList.add("scrollable-thumb"),this.thumbContainer.append(this.thumb),this.container.prepend(this.thumbContainer),this.thumb.addEventListener("mousedown",this.onMouseDown)),this.container.classList.add("scrollable-y"),L&&!P&&this.container.classList.add("no-scrollbar"),this.setListeners()}attachBorderListeners(t=this.container){const o=this.onAdditionalScroll;this.onAdditionalScroll=()=>{o?.(),t.classList.toggle("scrolled-top",!this.scrollPosition),t.classList.toggle("scrolled-bottom",this.isScrolledToEnd)},t.classList.add("scrolled-top","scrolled-bottom","scrollable-y-bordered")}setVirtualContainer(t){this.splitUp=t,this.log("setVirtualContainer:",t,this)}}class H extends f{constructor(t,o="",c=300,i=15,s=document.createElement("div")){if(super(t,o,s),this.onScrollOffset=c,this.splitCount=i,this.container=s,this.container.classList.add("scrollable-x"),!y){const e=r=>{r.stopPropagation(),!r.deltaX&&this.container.scrollWidth>this.container.clientWidth&&(this.container.scrollLeft+=r.deltaY/4,h(r))};this.container.addEventListener("wheel",e,{passive:!1})}this.scrollPositionProperty="scrollLeft",this.scrollSizeProperty="scrollWidth",this.clientSizeProperty="clientWidth",this.offsetSizeProperty="offsetWidth"}}export{T as S,H as a};
//# sourceMappingURL=scrollable-93cbead8.js.map