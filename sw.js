if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let t={};const c=e=>n(e,o),l={module:{uri:o},exports:t,require:c};i[o]=Promise.all(s.map((e=>l[e]||c(e)))).then((e=>(r(...e),t)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"ec9b4135df66e5e04f7bed69d1c8b8b2"},{url:"assets/index-Bc5eBo31.js",revision:null},{url:"assets/index-CAh6Klep.css",revision:null},{url:"index.html",revision:"960466321ab957ddb51e40cc29ee69d1"},{url:"registerSW.js",revision:"332892388682f6b3c1a0a9e1e4f2f3cd"},{url:"icons/icon-192x192.png",revision:"30e9fb8822b8993375c9640c84cb781e"},{url:"icons/icon-512x512.png",revision:"30e9fb8822b8993375c9640c84cb781e"},{url:"manifest.webmanifest",revision:"40a271e3870ce63773f6e6e238f9b198"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
