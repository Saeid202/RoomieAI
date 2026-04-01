import { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PWAReinstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedOrigin?: string;
}

export const PWAReinstallModal = ({ isOpen, onClose, installedOrigin }: PWAReinstallModalProps) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const isWindows = navigator.platform.toUpperCase().indexOf('WIN') > -1;
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') > -1;

  const steps = [
    {
      title: 'Uninstall the Current App',
      description: 'Remove the HomieAI app from your system',
      instructions: isWindows
        ? [
            'Click the Windows Start menu',
            'Search for "Apps & features"',
            'Find "HomieAI" in the list',
            'Click it and select "Uninstall"',
            'Confirm the uninstallation',
          ]
        : isMac
          ? [
              'Open Finder',
              'Go to Applications folder',
              'Find "HomieAI" app',
              'Drag it to Trash',
              'Empty Trash',
            ]
          : [
              'Open your application menu',
              'Find "HomieAI" app',
              'Right-click and select "Uninstall"',
              'Confirm the uninstallation',
            ],
    },
    {
      title: 'Return to This Page',
      description: 'Come back to homieai.ca in your browser',
      instructions: [
        'After uninstalling, return to this browser window',
        'Refresh the page if needed',
        'You should see the "Install App" button again',
      ],
    },
    {
      title: 'Reinstall the App',
      description: 'Install the app from the correct location',
      instructions: [
        'Click the "Install App" button',
        'Confirm the installation when prompted',
        'The app will be installed from homieai.ca',
        'You can now use the app offline',
      ],
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 p-6 flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="text-white flex-shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-white font-bold text-lg">Reinstall HomieAI App</h2>
                <p className="text-white/90 text-sm mt-1">
                  Your app was installed from a different location
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Origin Info */}
            {installedOrigin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Installed from:</span> {installedOrigin}
                </p>
                <p className="text-sm text-amber-800 mt-2">
                  To ensure the app works correctly, please reinstall it from homieai.ca
                </p>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </button>

                  {/* Expanded Instructions */}
                  {expandedStep === index && (
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                      <ol className="space-y-2">
                        {step.instructions.map((instruction, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-700">
                            <span className="text-purple-600 font-semibold flex-shrink-0">
                              {i + 1}.
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Alternative Method */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Alternative Method</h4>
              <p className="text-sm text-blue-800 mb-3">
                You can also create a shortcut using your browser menu:
              </p>
              <ol className="space-y-1 text-sm text-blue-800">
                <li>1. Click the menu icon (⋮) in your browser</li>
                <li>2. Select "More tools" → "Create shortcut"</li>
                <li>3. Check "Open as window"</li>
                <li>4. Click "Create"</li>
              </ol>
            </div>

            {/* Success Tip */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-green-900">After reinstalling</p>
                <p className="text-sm text-green-800 mt-1">
                  The app will work offline and connect to homieai.ca
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-700 hover:via-purple-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all"
            >
              Got it, I'll reinstall
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
