import { useGameStore } from "@/store/useGameStore";
import { analyticsAllowed,isAnalyticsEvent,safeAnalyticsProps,type AnalyticsEvent } from "./analytics-rules";
declare global {interface Window {__HERITAGE_ANALYTICS_TEST__?:boolean}}
let sdkPromise:Promise<typeof import("@vercel/analytics")>|null=null;
let injected=false;
function enabled() {
 if(typeof window === "undefined" || !useGameStore.persist.hasHydrated() || !navigator.onLine)return false;
 // The opt-in exists only for local browser tests with intercepted provider routes.
 const localTest=["localhost","127.0.0.1"].includes(location.hostname) && window.__HERITAGE_ANALYTICS_TEST__===true;
 return analyticsAllowed(localTest ? "vercel" : process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER,localTest ? "e2e" : process.env.NEXT_PUBLIC_ANALYTICS_SITE,useGameStore.getState().analyticsEnabled,process.env.NODE_ENV,localTest);
}
async function client() {
 if(!enabled())return null;
 sdkPromise ??= import("@vercel/analytics");
 const sdk=await sdkPromise;if(!enabled())return null;
 if(!injected){sdk.inject({mode:"production",debug:false,disableAutoTrack:true,beforeSend:event=>enabled() ? {...event,url:location.origin+(process.env.NEXT_PUBLIC_BASE_PATH || "/")} : null});injected=true;}
 return sdk;
}
/** Only enumerated game properties leave the device; no names, URLs or free text. */
export async function track(event:AnalyticsEvent,props:Record<string,unknown>={}):Promise<boolean> {
 if(!isAnalyticsEvent(event) || !enabled())return false;
 try{const sdk=await client();if(!sdk || !enabled())return false;sdk.track(event,safeAnalyticsProps(event,props));return true;}catch{return false;}
}
