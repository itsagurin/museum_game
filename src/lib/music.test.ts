import {expect,it} from "vitest";
import {existsSync,statSync} from "node:fs";
import {createMusicPlayer,musicTrackForView,musicTracks,type MusicAudio} from "./music";
function setup(){
 let now=0,next=0;const frames=new Map<number,(time:number)=>void>();
 const make=()=>({src:"",volume:0,loop:false,paused:true,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}});
 const players:[MusicAudio,MusicAudio]=[make(),make()];
 const mixer=createMusicPlayer(players,{now:()=>now,request:callback=>{frames.set(++next,callback);return next;},cancel:id=>{frames.delete(id);}});
 const tick=(time:number)=>{now=time;const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(now));};
 return {players,mixer,tick};
}
it("selects room tracks and a neutral track for the shell",()=>{
 expect(musicTrackForView("hall").id).toBe("home");expect(musicTrackForView("library").id).toBe("home");expect(musicTrackForView("era-3").id).toBe("era-3");
});
it("requires both an enabled setting and a gesture",async()=>{
 const {mixer,players}=setup();mixer.update({src:"room.mp3",enabled:true});expect(players.every(p=>p.paused)).toBe(true);mixer.unlock();await Promise.resolve();await Promise.resolve();expect(players[0].paused).toBe(false);
});
it("crossfades for 1.5 seconds, ducks the studio and pauses on hiding",async()=>{
 const {mixer,players,tick}=setup();mixer.update({src:"first.mp3",enabled:true,volume:.4});mixer.unlock();await Promise.resolve();await Promise.resolve();tick(1500);expect(players[0].volume).toBeCloseTo(.4);
 mixer.update({src:"second.mp3"});await Promise.resolve();await Promise.resolve();tick(2250);expect(players[0].volume).toBeCloseTo(.2);expect(players[1].volume).toBeCloseTo(.2);
 tick(3000);expect(players[0].paused).toBe(true);expect(players[1].volume).toBeCloseTo(.4);
 mixer.update({studio:true});expect(players[1].volume).toBeCloseTo(.24);mixer.update({hidden:true});expect(players.every(p=>p.paused)).toBe(true);
});
it("ships only approved CC0 files within the size and duration budgets",()=>{
 expect(musicTracks).toHaveLength(5);let size=0;
 for(const track of musicTracks){const file=`public/audio/${track.file}`;expect(existsSync(file)).toBe(true);expect(track.license).toBe("CC0-1.0");expect(track.performer).toBeTruthy();expect(track.source).toMatch(/^https:\/\//);expect(track.duration).toBeGreaterThanOrEqual(120);expect(track.duration).toBeLessThanOrEqual(240);const bytes=statSync(file).size;expect(bytes).toBeLessThanOrEqual(2500000);size+=bytes;}
 expect(size).toBeLessThanOrEqual(12000000);
});
