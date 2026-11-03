import tracks from "../../content/audio.json";
import type { View } from "@/types/game";
export const musicTracks=tracks;
export function musicTrackForView(view:View) {return musicTracks.find(track=>track.scene === (view.startsWith("era-") ? view : "home"))!;}
export interface MusicAudio {src:string;volume:number;loop:boolean;readonly paused:boolean;play:()=>Promise<void>;pause:()=>void}
export interface MusicClock {now:()=>number;request:(callback:(time:number)=>void)=>number;cancel:(id:number)=>void}
interface MusicSettings {src:string;enabled:boolean;volume:number;studio:boolean;hidden:boolean}

/** Two bounded channels; a track starts only after an explicit trusted gesture. */
export function createMusicPlayer(players:[MusicAudio,MusicAudio],clock:MusicClock={now:()=>performance.now(),request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id)}) {
  let settings:MusicSettings={src:"",enabled:false,volume:.35,studio:false,hidden:false};
  let allowed=false,current=-1,activeSrc="",frame:number|null=null,generation=0,waiting=false;
  players.forEach(audio=>{audio.loop=true;audio.volume=0;});
  const volume=()=>Math.max(0,Math.min(1,settings.volume))*(settings.studio ? .6 : 1);
  const cancel=()=>{if(frame!==null)clock.cancel(frame);frame=null;generation++;};
  const stop=()=>{cancel();waiting=false;players.forEach(audio=>audio.pause());};
  const play=(audio:MusicAudio)=>{try{return audio.play().then(()=>true,()=>false);}catch{return Promise.resolve(false);}};
  const apply=(oldVolume=volume())=>{
    if(!allowed || !settings.enabled || settings.hidden || !settings.src){stop();return;}
    if(activeSrc===settings.src && current>=0){
      if(!waiting && frame===null){players[current].volume=volume();if(players[current].paused)void play(players[current]);}
      return;
    }
    cancel();const version=generation,previous=current,next=current===0 ? 1 : 0;
    const ratio=previous<0 ? 0 : players[previous].volume/Math.max(oldVolume,.0001);
    current=next;activeSrc=settings.src;waiting=true;
    const target=players[next];target.pause();target.src=settings.src;target.volume=0;
    void play(target).then(started=>{
      if(version!==generation)return;
      waiting=false;
      if(!started){current=previous;activeSrc=previous<0 ? "" : players[previous].src;return;}
      const start=clock.now();
      const fade=(now:number)=>{
        if(version!==generation)return;
        const progress=Math.min(1,Math.max(0,(now-start)/1500)),gain=volume();
        target.volume=gain*progress;
        if(previous>=0)players[previous].volume=Math.min(1,gain*ratio*(1-progress));
        if(progress<1)frame=clock.request(fade);
        else{frame=null;if(previous>=0)players[previous].pause();}
      };
      frame=clock.request(fade);
    });
  };
  return {
    update(next:Partial<MusicSettings>){const old=volume();settings={...settings,...next};apply(old);},
    unlock(){allowed=true;apply();},
    dispose:stop,
  };
}
