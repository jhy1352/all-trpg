import React, { useState } from 'react';
import { ParsedMetadata } from '../types';
import { ChevronDown, ChevronUp, Copy, Check, ShieldCheck, Database, Compass, Award } from 'lucide-react';
import { KO } from '../locales/ko';

interface MetadataAccordionProps {
  metadata: ParsedMetadata;
  turnNumber: number;
}

export const MetadataAccordion: React.FC<MetadataAccordionProps> = ({ metadata, turnNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(metadata.rawBlockText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4 rounded-xl border border-stone-800 bg-stone-950/80 text-stone-300 text-xs overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-900/60 hover:bg-stone-900 transition-colors">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left font-mono font-medium text-stone-300 hover:text-amber-400 focus:outline-none transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{KO.metaAccordion.title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 font-mono">
            Turn {turnNumber}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          )}
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all text-[11px]"
          title="원클릭 복사"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">{KO.metaAccordion.copied}</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-stone-400" />
              <span>{KO.metaAccordion.copyBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3.5 border-t border-stone-800/80 space-y-3 bg-stone-950/95 font-sans leading-relaxed">
          {/* 1. Verification Report */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1) 외부 검색 & UI 반영 및 NPC 지식 검증</span>
            </div>
            <p className="text-stone-400 pl-5 whitespace-pre-wrap">{metadata.searchAndVerificationReport}</p>
          </div>

          {/* 2. Active Seeds */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Compass className="w-3.5 h-3.5" />
              <span>2) 활성화된 미회수 복선 씨앗 (최대 3개)</span>
            </div>
            <div className="pl-5 space-y-1">
              {metadata.activeSeeds.length > 0 ? (
                metadata.activeSeeds.map((seed, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-stone-300">
                    <span className="text-emerald-500 font-mono">•</span>
                    <span>{seed}</span>
                  </div>
                ))
              ) : (
                <span className="text-stone-500 italic">미회수 복선 씨앗 없음</span>
              )}
            </div>
          </div>

          {/* 3. Camera Off World Affairs */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <span>3) 카메라 밖 세계 정세 자율 변동</span>
            </div>
            <p className="text-stone-400 pl-5">{metadata.cameraOffAffairs}</p>
          </div>

          {/* 4. Chapter Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 font-medium">
              <span>4) 진행 및 예정 챕터 현황</span>
            </div>
            <p className="text-stone-400 pl-5">{metadata.chapterInfo}</p>
          </div>

          {/* 5. Stats & Inventory */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>5) 주인공 스탯 및 소장품</span>
            </div>
            <p className="text-stone-400 pl-5">{metadata.statsAndInventory}</p>
          </div>

          {/* 6. DC Stats */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-orange-400 font-medium">
              <span>6) DC 누적 통계 관리 (5~15 균등)</span>
            </div>
            <p className="text-stone-400 pl-5 font-mono">{metadata.dcStats}</p>
          </div>

          {/* 7. Adherence Declaration */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-medium">
              <span>7) 개연성/맥락 준수 선언</span>
            </div>
            <p className="text-stone-400 pl-5 italic">{metadata.adherenceDeclaration}</p>
          </div>
        </div>
      )}
    </div>
  );
};
