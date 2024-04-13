(()=>{"use strict";var e={45:(e,o,t)=>{function r(e){return!(null==e)}function n(e){return r(e)&&e.length>0}function i(e){return!n(e)}function s(e){return r(e)&&(""===e.trim()||0===e.trim().length)}function a(e,o){return n(e)&&e.length===o}function l(e,o,t=!1){return!(!r(e)||!r(o))&&(t?e.toLowerCase()===o.toLowerCase():e===o)}function d(e){return JSON.parse(JSON.stringify(e))}function c(e){return 0===Object.keys(e).length}t.r(o),t.d(o,{areStringsEqual:()=>l,arrayDeepCopy:()=>d,arrayEmpty:()=>i,arrayLength:()=>a,arrayNotEmpty:()=>n,isEmptyObject:()=>c,isEmptyString:()=>s,valueExists:()=>r})},502:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.isDevelopmentMode=o.resolvePropertyToken=o.isConfiguredProperly=o.initConfig=o.config=void 0,o.config=null;const t={stopSimpleEvent:!1,stopDataEvent:!1,stopPageViewEvent:!1,stopAll:!1,logOnly:!1,observePageViaWebAPI:!0};function r(){return o.config?o.config.propertyToken:""}function n(){return!!o.config&&o.config.isDevelopmentMode}o.initConfig=function(e){o.config={...t,...e},n()&&console.log("configuration: ",o.config)},o.isConfiguredProperly=function(){return!!r()},o.resolvePropertyToken=r,o.isDevelopmentMode=n},318:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.sendEmail=void 0;const r=t(374),n=t(454),i=t(502),s=t(51);o.sendEmail=function(e,o,t,a){let l=new FormData;l.append("engineId",e),l.append("userId",t),l.append("templateId",o),l.append("senderInfo['deviceType']",(0,r.resolveDevice)()),l.append("senderInfo['osName']",(0,r.resolveOS)()),l.append("senderInfo['browserName']",(0,r.resolveBrowser)()),l.append("senderInfo['ipAddress']",(0,n.resolveIPAddress)()),l.append("senderInfo['countryCode']",(0,n.resolveCountry)()),l.append("senderInfo['region']",(0,n.resolveRegion)()),l.append("senderInfo['city']",(0,n.resolveCity)()),l.append("senderInfo['url']",window.location.href),a.forEach(((e,o)=>{l.append(`metadata[${o}]`,e)})),(0,i.isDevelopmentMode)()&&console.log("email data: ",l),(0,s.transferEmail)(l,(()=>{}),(e=>{}),(e=>{(0,i.isDevelopmentMode)()&&console.log("email sent successfully")}),(e=>{(0,i.isDevelopmentMode)()&&console.log(`email sending error: ${e}`)}),(()=>{}))}},857:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolveDataEvent=void 0;const r=t(647),n=t(502),i=t(454),s=t(374),a=t(494),l=t(270),d=t(358);o.resolveDataEvent=function(e,o,t=""){if((0,r.isBot)()&&(n.config.stopAll=!0),n.config?.stopAll||n.config?.stopDataEvent)return;const c={property:(0,n.resolvePropertyToken)(),dataEventToken:e,eventLogData:o,userId:(0,l.resolveUserId)(),ipAddress:(0,i.resolveIPAddress)(),city:(0,i.resolveCity)(),countryCode:(0,i.resolveCountry)(),region:(0,i.resolveRegion)(),browserName:(0,s.resolveBrowser)(),osName:(0,s.resolveOS)(),deviceType:(0,s.resolveDevice)(),url:window.location.href||""},u=(0,d.retrieveEventList)();u&&u.includes(e)||(l.isNewUser?c.newUser=!0:c.returningUser=!0,c.newSession=!0,(0,d.storeEventList)([...u,e])),(0,n.isDevelopmentMode)()&&console.log("data event data: ",c),(0,a.logDataEvent)(c,(()=>{}),(e=>{}),(o=>{(0,n.isDevelopmentMode)()&&console.log(`event ${e} logged successfully`)}),(e=>{(0,n.isDevelopmentMode)()&&console.log(`event log error: ${e}`)}),(()=>{}))}},358:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.retrieveEventList=o.storeEventList=void 0;const r=t(720),n="eventList";o.storeEventList=function(e){(0,r.store)(n,JSON.stringify(e))},o.retrieveEventList=function(){return JSON.parse((0,r.retrieve)(n))}},848:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolvePageViewEvent=o.pageViewObserver=o.initPageViewEventHandler=void 0;const r=t(502),n=t(454),i=t(374),s=t(610),a=t(407),l=t(838),d=t(647),c=t(270),u=t(358),v="startUrl",p="SITE_VISITED";let g=!1,f=!1;function m(){g?w(!1,(0,l.resolveUTMData)(window.location.href)):(w(!0,(0,l.resolveUTMData)(window.location.href)),g=!0)}function y(e){return e?document.referrer:(0,a.retrieve)(v)}function w(e,o){if((0,d.isBot)()&&(r.config.stopAll=!0),r.config?.stopAll||r.config?.stopPageViewEvent)return;const t={property:(0,r.resolvePropertyToken)(),userId:(0,c.resolveUserId)(),referredUrl:y(e),ipAddress:(0,n.resolveIPAddress)(),city:(0,n.resolveCity)(),countryCode:(0,n.resolveCountry)(),region:(0,n.resolveRegion)(),browserName:(0,i.resolveBrowser)(),osName:(0,i.resolveOS)(),deviceType:(0,i.resolveDevice)(),url:window.location.href||"",title:document.title||"",utmCampaign:o.utmCampaign,utmContent:o.utmContent,utmMedium:o.utmMedium,utmSource:o.utmSource,utmTerm:o.utmTerm},l=(0,u.retrieveEventList)();l&&l.includes(p)||(c.isNewUser?t.newUser=!0:t.returningUser=!0,t.newSession=!0,(0,u.storeEventList)([...l,p])),e||f||(f=!0,t.debounce=!0),(0,r.isDevelopmentMode)()&&console.log("page view data: ",t),r.config?.logOnly&&(0,a.store)("startUrl",window.location.href),(0,s.logPageViewEvent)(t,(()=>{}),(e=>{}),(e=>{(0,r.isDevelopmentMode)()&&console.log("page view event logged successfully")}),(e=>{(0,r.isDevelopmentMode)()&&console.log(`event log error: ${e}`)}),(()=>{(0,a.store)("startUrl",window.location.href)}))}o.initPageViewEventHandler=function(){window.addEventListener("load",(()=>m()))},o.pageViewObserver=m,o.resolvePageViewEvent=w},971:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolveSimpleEvent=void 0;const r=t(374),n=t(502),i=t(454),s=t(48),a=t(647),l=t(270),d=t(358);o.resolveSimpleEvent=function(e,o=""){if((0,a.isBot)()&&(n.config.stopAll=!0),n.config?.stopAll||n.config?.stopSimpleEvent)return;const t={property:(0,n.resolvePropertyToken)(),simpleEventToken:e,userId:(0,l.resolveUserId)(),ipAddress:(0,i.resolveIPAddress)(),city:(0,i.resolveCity)(),countryCode:(0,i.resolveCountry)(),region:(0,i.resolveRegion)(),browserName:(0,r.resolveBrowser)(),osName:(0,r.resolveOS)(),deviceType:(0,r.resolveDevice)(),url:window.location.href||""},c=(0,d.retrieveEventList)();c&&c.includes(e)||(l.isNewUser?t.newUser=!0:t.returningUser=!0,t.newSession=!0,(0,d.storeEventList)([...c,e])),(0,n.isDevelopmentMode)()&&console.log("simple event data: ",t),(0,s.logSimpleEvent)(t,(()=>{}),(e=>{}),(o=>{(0,n.isDevelopmentMode)()&&console.log(`event ${e} logged successfully`)}),(e=>{(0,n.isDevelopmentMode)()&&console.log(`event log error: ${e}`)}),(()=>{}))}},454:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolveCity=o.resolveRegion=o.resolveCountry=o.resolveIPAddress=o.initLocation=void 0;const r=t(407),n=t(502),i=t(340),s="city",a="region",l="country";o.initLocation=function(e){(0,i.resolveLocation)((()=>{}),(e=>{}),(e=>{var o;o=e,(0,r.store)("ip",o.ip),(0,r.store)(s,o.city),(0,r.store)(a,o.region),(0,r.store)(l,o.country),(0,n.isDevelopmentMode)()&&(console.log(`ip: ${o.ip}`),console.log(`city: ${o.city}`),console.log(`region: ${o.region}`),console.log(`country: ${o.country}`))}),(e=>{(0,n.isDevelopmentMode)()&&console.log(`failed to resolve location: ${e}`)}),(()=>{e()}))},o.resolveIPAddress=function(){return(0,r.retrieve)("ip")},o.resolveCountry=function(){return(0,r.retrieve)(l)},o.resolveRegion=function(){return(0,r.retrieve)(a)},o.resolveCity=function(){return(0,r.retrieve)(s)}},830:(e,o)=>{var t;Object.defineProperty(o,"__esModule",{value:!0}),o.IBrowser=void 0,function(e){e.Unknown="Unknown",e.Chrome="Google Chorme",e.Firefox="Mozilla Firefox",e.Safari="Apple Safari",e.ME_Legacy="Microsoft Edge (Legacy)",e.ME_Chromium="Microsoft Edge (Chromium)",e.IE="Microsoft Internet Explorer",e.Opera="Opera",e.Opera_Next="Opera Next"}(t||(o.IBrowser=t={}))},650:(e,o)=>{var t;Object.defineProperty(o,"__esModule",{value:!0}),o.IDevice=void 0,function(e){e.Unknown="Unknown",e.Tablet="Tablet",e.Mobile="Mobile",e.Desktop="Desktop"}(t||(o.IDevice=t={}))},583:(e,o)=>{var t;Object.defineProperty(o,"__esModule",{value:!0}),o.IOperatingSystem=void 0,function(e){e.Unknown="Unknown",e.MacOS="MacOS",e.Linux="Linux",e.Windows="Windows",e.Android="Android",e.iOS="iOS"}(t||(o.IOperatingSystem=t={}))},374:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolveDevice=o.resolveOS=o.resolveBrowserVersion=o.resolveBrowser=o.initPlatform=void 0;const r=t(830),n=t(583),i=t(650),s=t(502),a=window.navigator.userAgent;function l(){let e=0,o=0;switch(!0){case-1!==a.indexOf("Opera"):return r.IBrowser.Opera;case-1!==a.indexOf("OPR"):return r.IBrowser.Opera_Next;case-1!==a.indexOf("Edge"):return r.IBrowser.ME_Legacy;case-1!==a.indexOf("Edg"):return r.IBrowser.ME_Chromium;case-1!==a.indexOf("Chrome"):return r.IBrowser.Chrome;case-1!==a.indexOf("Safari"):return r.IBrowser.Safari;case-1!==a.indexOf("Firefox"):return r.IBrowser.Firefox;case-1!==a.indexOf("MSIE"):case-1!==a.indexOf("Trident"):return r.IBrowser.IE;case(e=a.lastIndexOf(" ")+1)<(o=a.lastIndexOf("/")):return a.substring(e,o);default:return r.IBrowser.Unknown}}function d(){switch(!0){case-1!==a.indexOf("Windows"):return n.IOperatingSystem.Windows;case-1!==a.indexOf("Mac OS"):return n.IOperatingSystem.MacOS;case-1!==a.indexOf("Linux"):return n.IOperatingSystem.Linux;case-1!==a.indexOf("Android"):return n.IOperatingSystem.Android;case-1!==a.indexOf("iOS"):return n.IOperatingSystem.iOS;default:return n.IOperatingSystem.Unknown}}function c(){return/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(a)?i.IDevice.Tablet:/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|webOS)/i.test(a)?i.IDevice.Mobile:i.IDevice.Desktop}o.initPlatform=function(){const e=l(),o=d(),t=c();(0,s.isDevelopmentMode)()&&(console.log(`browser: ${e}`),console.log(`os: ${o}`),console.log(`device: ${t}`))},o.resolveBrowser=l,o.resolveBrowserVersion=function(){const e=a.match(/(Chrome|Firefox|Safari|Edge|IE|Opera|Trident)[\/\s](\d+(\.\d+)*)/);return e&&e[2]?e[2]:"Unknown"},o.resolveOS=d,o.resolveDevice=c},382:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.validateProperty=void 0;const r=t(230);o.validateProperty=function(e,o){return new Promise(((t,n)=>{(0,r.resolvePropertyMetadata)(e,(()=>{}),(()=>{}),(e=>{t(e.name===o)}),(e=>{n("unable to validate bloomsight property token!")}),(()=>{}))}))}},914:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.initSession=void 0;const r=t(720),n=t(358),i=t(270),s=t(407),a="sessionEnd",l=30;let d=Date.now();function c(){d+6e4-Date.now()<0&&(function(){const e=v();Date.now()>e?((0,i.setUserStatus)(!1),u(!0)):u(!1)}(),d=Date.now())}function u(e){(0,s.store)(a,JSON.stringify(Date.now()+60*l*1e3)),e&&(0,n.storeEventList)([])}function v(){return+(0,r.retrieve)(a)}o.initSession=function(){const e=v();e?Date.now()>e?((0,i.setUserStatus)((0,i.hasUserReturnedBeyondNewUserTenureLimit)(e)),u(!0)):(0,i.setUserStatus)(!0):((0,i.setUserStatus)(!0),u(!0)),window.addEventListener("keydown",(()=>c())),window.addEventListener("mousemove",(()=>c())),window.addEventListener("click",(()=>c())),window.addEventListener("scroll",(()=>c())),window.addEventListener("wheel",(()=>c()))}},846:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.RESOURCE_VALIDATION_ERROR=void 0,o.RESOURCE_VALIDATION_ERROR="We could not validate your authority to access resources"},912:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.HTTP_HEADERS=o.EMAIL_TRANSFER_API=o.ADD_PAGE_VIEW_EVENT_API=o.ADD_DATA_EVENT_API=o.ADD_SIMPLE_EVENT_API=o.GET_PROPERTY_API=o.LOCATION_API=void 0;const t="https://api.bloomsight.io/api/v1";o.LOCATION_API="https://api.bloomsight.io/service/get-my-ip",o.GET_PROPERTY_API=t+"/property/get/{propertyToken}",o.ADD_SIMPLE_EVENT_API=t+"/simple-event-data/add",o.ADD_DATA_EVENT_API=t+"/data-event-data/add",o.ADD_PAGE_VIEW_EVENT_API=t+"/page-view-data/add",o.EMAIL_TRANSFER_API=t+"/email-notifier/gmail/send",o.HTTP_HEADERS=new Headers({"Content-Type":"application/json"})},494:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.logDataEvent=void 0;const r=t(304),n=t(912),i=t(502);o.logDataEvent=function(e,o,t,s,a,l){i.config?.logOnly||(0,r.executePostPayload)(n.ADD_DATA_EVENT_API,e,n.HTTP_HEADERS,o,t,s,a,l)}},51:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.transferEmail=void 0;const r=t(304),n=t(912),i=t(502);o.transferEmail=function(e,o,t,s,a,l){i.config?.logOnly||(0,r.executePostPayload)(n.EMAIL_TRANSFER_API,e,void 0,o,t,s,a,l)}},340:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolveLocation=void 0;const r=t(304),n=t(912);o.resolveLocation=function(e,o,t,i,s){(0,r.executeGetPayload)(n.LOCATION_API,n.HTTP_HEADERS,e,o,t,i,s,"information")}},610:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.logPageViewEvent=void 0;const r=t(304),n=t(912),i=t(502);o.logPageViewEvent=function(e,o,t,s,a,l){i.config?.logOnly||(0,r.executePostPayload)(n.ADD_PAGE_VIEW_EVENT_API,e,n.HTTP_HEADERS,o,t,s,a,l)}},230:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolvePropertyMetadata=void 0;const r=t(304),n=t(912);o.resolvePropertyMetadata=function(e,o,t,i,s,a){(0,r.executeGetPayload)(n.GET_PROPERTY_API.replace("{propertyToken}",e),n.HTTP_HEADERS,o,t,i,s,a,"property")}},48:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.logSimpleEvent=void 0;const r=t(304),n=t(912),i=t(502);o.logSimpleEvent=function(e,o,t,s,a,l){i.config?.logOnly||(0,r.executePostPayload)(n.ADD_SIMPLE_EVENT_API,e,n.HTTP_HEADERS,o,t,s,a,l)}},304:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.executePostPayload=o.executeGetPayload=o.executeBasicGet=void 0;const r=t(45),n=t(846);o.executeBasicGet=function(e,o,t,r,i,s,a){t(),fetch(e,{method:"GET",headers:o}).then((e=>e.json())).then((e=>{r(e.message),e.success?i(e.message):s(n.RESOURCE_VALIDATION_ERROR)})).catch((e=>s(e.toString()))).finally((()=>a()))},o.executeGetPayload=function(e,o,t,i,s,a,l,d){t(),fetch(e,{method:"GET",headers:o}).then((e=>e.json())).then((e=>{i(e[d]),e.success?s(e[d]):a((0,r.isEmptyString)(e.message)?n.RESOURCE_VALIDATION_ERROR:e.message)})).catch((e=>a(e.toString()))).finally((()=>l()))},o.executePostPayload=function(e,o,t,i,s,a,l,d){i();const c={method:"POST",headers:t};o instanceof FormData?c.body=o:(c.body=JSON.stringify(o),c.headers={...c.headers,"Content-Type":"application/json"}),fetch(e,c).then((e=>e.json())).then((e=>{s(e),e.success?a(e):l((0,r.isEmptyString)(e.message)?n.RESOURCE_VALIDATION_ERROR:e.message)})).catch((e=>l(e.toString()))).finally((()=>d()))}},270:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.setUserStatus=o.hasUserReturnedBeyondNewUserTenureLimit=o.resolveUserId=o.initUser=o.isNewUser=void 0;const r=t(720),n=t(171),i=t(502),s="userId";o.isNewUser=!1;let a="";o.initUser=function(){var e;(0,r.retrieve)(s)?a=(0,r.retrieve)(s):(a=(0,n.generateUserId)(),e=a,(0,r.store)(s,e)),(0,i.isDevelopmentMode)()&&console.log(`active user id: ${a}`)},o.resolveUserId=function(){return a||(0,r.retrieve)(s)},o.hasUserReturnedBeyondNewUserTenureLimit=function(e){return Date.now()-e>3888e6},o.setUserStatus=function(e){o.isNewUser=e}},647:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.isBot=void 0;const t=[" daum[ /]"," deusu/"," yadirectfetcher","(?:^|[^g])news","(?<! (?:channel/|google/))google(?!(app|/google| pixel))","(?<! cu)bot(?:[^\\w]|_|$)","(?<! ya(?:yandex)?)search","(?<!(?:lib))http","(?<![hg]m)score","@","\\(\\)","\\.com","^12345","^<","^[\\w \\.\\-\\(?:\\):]+(?:/v?\\d+(?:\\.\\d+)?(?:\\.\\d{1,10})*?)?(?:,|$)","^[^ ]{50,}$","^\\w+/[\\w\\(\\)]*$","^active","^ad muncher","^amaya","^avsdevicesdk/","^biglotron","^bot","^clamav[ /]","^client/","^cobweb/","^custom","^ddg[_-]android","^discourse","^dispatch/\\d","^downcast/","^duckduckgo","^facebook","^getright/","^gozilla/","^hatena","^hobbit","^hotzonu","^hwcdn/","^jeode/","^jetty/","^jigsaw","^microsoft bits","^movabletype","^mozilla/\\d\\.\\d \\(compatible;?\\)$","^mozilla/\\d\\.\\d \\w*$","^navermailapp","^netsurf","^offline explorer","^postman","^python","^rank","^read","^reed","^rest","^serf","^snapchat","^space bison","^svn","^swcd ","^taringa","^thumbor/","^track","^valid","^w3c","^webbandit/","^webcopier","^wget","^whatsapp","^wordpress","^xenu link sleuth","^yahoo","^yandex","^zdm/\\d","^zoom marketplace/","^{{.*}}$","archive","ask jeeves/teoma","bit\\.ly/","bluecoat drtr","browsex","burpcollaborator","capture","catch","check","chrome-lighthouse","chromeframe","classifier","cloud","crawl","dareboost","datanyze","dejaclick","dmbrowser","download","evc-batch/","feed","firephp","gomezagent","headless","httrack","hubspot marketing grader","hydra","ibisbrowser","images","insight","inspect","iplabel","ips-agent","java(?!;)","library","mail\\.ru/","manager","neustar wpm","node","nutch","offbyone","optimize","pageburst","parser","perl","phantom","pingdom","powermarks","preview","proxy","ptst[ /]\\d","reputation","resolver","retriever","rexx;","rigor","robot","rss","scan","scrape","server","sogou","sparkler/","speedcurve","spider","splash","statuscake","supercleaner","synapse","synthetic","tools","torrent","trace","transcoder","url","virtuoso","wappalyzer","webglance","webkit2png","whatcms/","zgrab"],r=window.navigator.userAgent;o.isBot=function(e){const o=e||r;return new RegExp(t.join("|"),"i").test(o)}},171:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.generateUserId=void 0,o.generateUserId=function(){return(Date.now()+Math.random()).toString(36)}},720:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.clear=o.retrieve=o.store=void 0,o.store=function(e,o){localStorage.setItem(e,o)},o.retrieve=function(e){const o=localStorage.getItem(e);return null===o?"":o},o.clear=function(){localStorage.clear()}},407:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.clear=o.retrieve=o.store=void 0,o.store=function(e,o){sessionStorage.setItem(e,o)},o.retrieve=function(e){const o=sessionStorage.getItem(e);return null===o?"":o},o.clear=function(){sessionStorage.clear()}},838:(e,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.resolveUTMData=void 0,o.resolveUTMData=function(e){const o=new URLSearchParams(e);return{utmCampaign:o.get("utm_campaign")||"",utmContent:o.get("utm_content")||"",utmMedium:o.get("utm_medium")||"",utmSource:o.get("utm_source")||"",utmTerm:o.get("utm_term")||""}}}},o={};function t(r){var n=o[r];if(void 0!==n)return n.exports;var i=o[r]={exports:{}};return e[r](i,i.exports,t),i.exports}t.d=(e,o)=>{for(var r in o)t.o(o,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:o[r]})},t.o=(e,o)=>Object.prototype.hasOwnProperty.call(e,o),t.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{const e=t(374),o=t(454),r=t(270),n=t(914),i=t(848),s=t(502),a=t(971),l=t(857),d=t(848),c=t(318),u=t(382);window.init=function(t){(0,s.initConfig)(t),(0,u.validateProperty)(t.propertyToken,window.location.host).then((s=>{s?(0,o.initLocation)((()=>{(0,e.initPlatform)(),(0,r.initUser)(),(0,n.initSession)(),t.observePageViaWebAPI&&(0,i.initPageViewEventHandler)()})):console.error(`propertyToken is not valid for ${window.location.host}`)})).catch((e=>{console.error(e)}))},window.resolveSimpleEvent=a.resolveSimpleEvent,window.resolveDataEvent=l.resolveDataEvent,window.pageViewObserver=d.pageViewObserver,window.sendEmail=c.sendEmail})()})();