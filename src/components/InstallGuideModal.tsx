import React from 'react';
import { X, Smartphone, Share, PlusSquare, ArrowDown, CheckCircle } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  canInstallPrompt: boolean;
  onTriggerInstall: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  canInstallPrompt,
  onTriggerInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1f2c34] text-gray-900 dark:text-gray-100 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Als App verwenden
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Ohne Browser-Leiste & im Vollbildmodus
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 -mr-1 -mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {canInstallPrompt ? (
          <div className="mt-4 space-y-3 text-xs text-gray-600 dark:text-gray-300">
            <p>
              Tippe auf den Button, um die Schnitzeljagd direkt auf deinem Gerät zu installieren. Sie öffnet sich dann automatisch ohne Browser-Leiste!
            </p>
            <button
              type="button"
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 active:scale-98"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Jetzt als App installieren</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="mt-4 space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
            <p className="leading-relaxed">
              Auf dem <strong>iPhone & iPad</strong> lässt sich die Adressleiste so dauerhaft ausblenden:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl space-y-2.5 border border-gray-100 dark:border-gray-700 text-[11.5px]">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span>Tippe in Safari unten auf das <strong>Teilen-Symbol</strong></span>
                <Share className="w-3.5 h-3.5 text-blue-500 shrink-0 inline ml-0.5" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span>Scrolle nach unten zu <strong>„Zum Home-Bildschirm“</strong></span>
                <PlusSquare className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 shrink-0 inline ml-0.5" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span>Tippe oben rechts auf <strong>„Hinzufügen“</strong></span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              💡 Wenn du das neue Icon auf deinem Home-Bildschirm antippst, startet die Schnitzeljagd im vollen Bildschirm ohne Safari-Leisten.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-xs text-gray-600 dark:text-gray-300">
            <p>
              Tippe im Browser auf <strong>„Vollbild“</strong> (Symbol oben rechts neben dem Telefonhörer) oder nutze das Browser-Menü:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-[11.5px] space-y-1.5">
              <div><strong>Google Chrome:</strong> Dreipunkte-Menü → <em>„App installieren“</em> oder <em>„Zum Startbildschirm hinzufügen“</em>.</div>
              <div><strong>Desktop / Laptop:</strong> Taste <code>F11</code> drücken oder den Vollbild-Knopf oben antippen.</div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};
