"use client";

import { ArrowRight, DoorOpen, Images, House, LockKeyhole, Sparkles } from "lucide-react";
import { CertificateDownload } from "@/features/collection/CertificateDownload";
import { badgeDefinitions } from "@/lib/badges";
import { copy } from "@/data/copy";
import { getEra } from "@/data/eras";
import type { EraId, Language, View } from "@/types/game";

export type Milestone =
  | { type: "unlock" | "eraComplete"; eraId: EraId }
  | { type: "finale" }
  | { type: "badge"; badgeId: string };

/** Explains why a door is closed and leads to the era that opens it. */
export function EraLockedNotice({ eraName, requiredEra, remaining, language, onGo }: {
  eraName: string;
  requiredEra?: EraId;
  remaining: number;
  language: Language;
  onGo: (eraId: EraId) => void;
}) {
  const t = copy[language];
  const required = requiredEra ? getEra(requiredEra).inEra[language] : "";
  return (
    <div className="progress-notice">
      <div className="dialog-illustration">
        <LockKeyhole size={38} strokeWidth={1.2} />
      </div>
      <p className="dialog-intro">{t.lockedBody(eraName, required, remaining)}</p>
      {requiredEra && (
        <button className="primary-button full-width" onClick={() => onGo(requiredEra)}>
          {t.lockedGo(required)}
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}

/** Presents progress that is already saved: a newly opened era, a finished era or the whole house. */
export function MilestoneNotice({ milestone, language, houseImage, collectionSize, onNavigate, onClose }: {
  milestone: Milestone;
  language: Language;
  houseImage: string;
  collectionSize: number;
  onNavigate: (view: View) => void;
  onClose: () => void;
}) {
  const t = copy[language];
  if(milestone.type === "badge") {
    const badge=badgeDefinitions.find(badge=>badge.id===milestone.badgeId);
    return <div className="progress-notice"><div className="dialog-illustration"><Sparkles size={40}/></div><h3>{badge?.title[language]}</h3><p>{badge?.description[language]}</p><button className="primary-button full-width" onClick={()=>onNavigate("library")}>{t.library}</button><button className="secondary-button full-width" onClick={onClose}>{t.stayHere}</button></div>;
  }
  if (milestone.type === "unlock") {
    const era = getEra(milestone.eraId);
    return (
      <div className="progress-notice">
        <div className="dialog-illustration">
          <DoorOpen size={40} strokeWidth={1.1} />
          <Sparkles size={18} />
        </div>
        <p className="dialog-intro">{t.unlockBody(`${era.numeral} · ${era.name[language]}`)}</p>
        <button className="primary-button full-width" onClick={() => onNavigate(era.id)}>
          {t.enterEra(era.name[language])}
          <ArrowRight size={18} />
        </button>
        <button className="secondary-button full-width" onClick={onClose}>{t.stayHere}</button>
      </div>
    );
  }
  const finale = milestone.type === "finale";
  return (
    <div className="progress-notice">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="milestone-house" src={houseImage} alt={t.home} />
      <p className="dialog-intro">
        {finale ? t.finaleBody(collectionSize) : t.eraCompleteBody(getEra(milestone.eraId).name[language])}
      </p>
      <button className="primary-button full-width" onClick={() => onNavigate(finale ? "library" : "home")}>
        {finale ? t.library : t.seeHouse}
        {finale ? <Images size={18} /> : <House size={18} />}
      </button>
      <button className="secondary-button full-width" onClick={onClose}>{t.stayHere}</button>
      {finale && <CertificateDownload count={collectionSize} language={language} />}
    </div>
  );
}
