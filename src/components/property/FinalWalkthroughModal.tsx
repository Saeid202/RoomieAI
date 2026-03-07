import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Home, 
  Calendar,
  CheckCircle, 
  AlertTriangle,
  Camera,
  FileText,
  ChevronDown,
  ChevronUp,
  Flag,
  Upload,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface FinalWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  closingDate?: Date;
  onComplete: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes: string;
  hasIssue: boolean;
  severity?: 'critical' | 'minor' | 'cosmetic';
}

interface ChecklistCategory {
  name: string;
  icon: any;
  items: ChecklistItem[];
  expanded: boolean;
}

export function FinalWalkthroughModal({ 
  isOpen, 
  onClose, 
  propertyId,
  closingDate,
  onComplete 
}: FinalWalkthroughModalProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'checklist' | 'signoff'>('schedule');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [categories, setCategories] = useState<ChecklistCategory[]>([
    {
      name: 'Exterior',
      icon: Home,
      expanded: true,
      items: [
        { id: 'ext-1', label: 'Roof condition', checked: false, notes: '', hasIssue: false },
        { id: 'ext-2', label: 'Gutters and downspouts', checked: false, notes: '', hasIssue: false },
        { id: 'ext-3', label: 'Siding/exterior walls', checked: false, notes: '', hasIssue: false },
        { id: 'ext-4', label: 'Windows and doors', checked: false, notes: '', hasIssue: false },
        { id: 'ext-5', label: 'Driveway and walkways', checked: false, notes: '', hasIssue: false },
        { id: 'ext-6', label: 'Landscaping/yard', checked: false, notes: '', hasIssue: false },
        { id: 'ext-7', label: 'Garage/carport', checked: false, notes: '', hasIssue: false }
      ]
    },
    {
      name: 'Interior',
      icon: Home,
      expanded: false,
      items: [
        { id: 'int-1', label: 'Walls, ceilings, floors', checked: false, notes: '', hasIssue: false },
        { id: 'int-2', label: 'All doors open/close properly', checked: false, notes: '', hasIssue: false },
        { id: 'int-3', label: 'Windows open/close/lock', checked: false, notes: '', hasIssue: false },
        { id: 'int-4', label: 'Light fixtures work', checked: false, notes: '', hasIssue: false },
        { id: 'int-5', label: 'Outlets work', checked: false, notes: '', hasIssue: false },
        { id: 'int-6', label: 'HVAC system operational', checked: false, notes: '', hasIssue: false },
        { id: 'int-7', label: 'Plumbing (faucets, toilets, drains)', checked: false, notes: '', hasIssue: false }
      ]
    },
    {
      name: 'Appliances',
      icon: Home,
      expanded: false,
      items: [
        { id: 'app-1', label: 'Refrigerator', checked: false, notes: '', hasIssue: false },
        { id: 'app-2', label: 'Stove/oven', checked: false, notes: '', hasIssue: false },
        { id: 'app-3', label: 'Dishwasher', checked: false, notes: '', hasIssue: false },
        { id: 'app-4', label: 'Washer/dryer', checked: false, notes: '', hasIssue: false },
        { id: 'app-5', label: 'Microwave', checked: false, notes: '', hasIssue: false },
        { id: 'app-6', label: 'Garbage disposal', checked: false, notes: '', hasIssue: false }
      ]
    },
    {
      name: 'Systems',
      icon: Home,
      expanded: false,
      items: [
        { id: 'sys-1', label: 'Electrical panel', checked: false, notes: '', hasIssue: false },
        { id: 'sys-2', label: 'Water heater', checked: false, notes: '', hasIssue: false },
        { id: 'sys-3', label: 'Furnace/AC', checked: false, notes: '', hasIssue: false },
        { id: 'sys-4', label: 'Smoke/CO detectors', checked: false, notes: '', hasIssue: false },
        { id: 'sys-5', label: 'Security system', checked: false, notes: '', hasIssue: false }
      ]
    },
    {
      name: 'General',
      icon: FileText,
      expanded: false,
      items: [
        { id: 'gen-1', label: 'Property is clean', checked: false, notes: '', hasIssue: false },
        { id: 'gen-2', label: 'Agreed repairs completed', checked: false, notes: '', hasIssue: false },
        { id: 'gen-3', label: 'No new damage', checked: false, notes: '', hasIssue: false },
        { id: 'gen-4', label: 'All fixtures present', checked: false, notes: '', hasIssue: false },
        { id: 'gen-5', label: 'Keys/remotes provided', checked: false, notes: '', hasIssue: false }
      ]
    }
  ]);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const toggleCategory = (categoryName: string) => {
    setCategories(prev => prev.map(cat => 
      cat.name === categoryName ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };

  const toggleItem = (categoryName: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.name === categoryName) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      }
      return cat;
    }));
  };

  const flagIssue = (categoryName: string, itemId: string, severity: 'critical' | 'minor' | 'cosmetic') => {
    setCategories(prev => prev.map(cat => {
      if (cat.name === categoryName) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, hasIssue: true, severity } : item
          )
        };
      }
      return cat;
    }));
    toast.success(`Issue flagged as ${severity}`);
  };

  const saveNote = (categoryName: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.name === categoryName) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, notes: tempNote } : item
          )
        };
      }
      return cat;
    }));
    setEditingNoteId(null);
    setTempNote('');
    toast.success('Note saved');
  };

  const getTotalItems = () => {
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  };

  const getCheckedItems = () => {
    return categories.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.checked).length, 0
    );
  };

  const getCriticalIssues = () => {
    return categories.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.hasIssue && item.severity === 'critical').length, 0
    );
  };

  const getMinorIssues = () => {
    return categories.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.hasIssue && item.severity === 'minor').length, 0
    );
  };

  const handleComplete = (approved: boolean) => {
    const totalItems = getTotalItems();
    const checkedItems = getCheckedItems();
    const criticalIssues = getCriticalIssues();

    if (checkedItems < totalItems) {
      toast.error('Please complete all checklist items before signing off');
      return;
    }

    if (criticalIssues > 0 && approved) {
      toast.error('Cannot approve with critical issues. Please resolve them first or request fixes.');
      return;
    }

    onComplete();
    onClose();
    toast.success(approved ? 'Property approved! Ready for closing.' : 'Walkthrough completed. Fix requests sent to seller.');
  };

  const progressPercentage = Math.round((getCheckedItems() / getTotalItems()) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Home className="h-6 w-6 text-purple-600" />
            Final Walkthrough
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b-2 border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'schedule'
                ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'checklist'
                ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('signoff')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'signoff'
                ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="h-4 w-4 inline mr-2" />
            Sign-off
          </button>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Schedule Your Final Walkthrough</h3>
              <p className="text-sm text-blue-800 mb-4">
                The final walkthrough should be scheduled 24-48 hours before your closing date to ensure 
                the property is in the agreed-upon condition.
              </p>
              
              {closingDate && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">Closing Date:</span>
                    <span className="text-gray-700">{closingDate.toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Recommended walkthrough window: {new Date(closingDate.getTime() - 48*60*60*1000).toLocaleDateString()} - {new Date(closingDate.getTime() - 24*60*60*1000).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time</label>
                  <select
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Choose a time...</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>

                <Button
                  onClick={() => {
                    if (!selectedDate || !selectedTime) {
                      toast.error('Please select both date and time');
                      return;
                    }
                    toast.success('Walkthrough scheduled! Notification sent to seller.');
                    setActiveTab('checklist');
                  }}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  Schedule Walkthrough
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-900">
                  {getCheckedItems()} of {getTotalItems()} items checked
                </span>
                <span className="text-lg font-bold text-purple-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {(getCriticalIssues() > 0 || getMinorIssues() > 0) && (
                <div className="flex gap-4 mt-3 text-sm">
                  {getCriticalIssues() > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-semibold">{getCriticalIssues()} Critical Issues</span>
                    </div>
                  )}
                  {getMinorIssues() > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Flag className="h-4 w-4" />
                      <span className="font-semibold">{getMinorIssues()} Minor Issues</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Checklist Categories */}
            <div className="space-y-3">
              {categories.map((category) => {
                const CategoryIcon = category.icon;
                const categoryChecked = category.items.filter(i => i.checked).length;
                const categoryTotal = category.items.length;

                return (
                  <div key={category.name} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex items-center justify-between hover:from-purple-50 hover:to-indigo-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="h-5 w-5 text-purple-600" />
                        <span className="font-bold text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-600">
                          ({categoryChecked}/{categoryTotal})
                        </span>
                      </div>
                      {category.expanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    {/* Category Items */}
                    {category.expanded && (
                      <div className="p-4 space-y-3 bg-white">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className={`border-2 rounded-lg p-3 transition-all ${
                              item.hasIssue && item.severity === 'critical'
                                ? 'border-red-300 bg-red-50'
                                : item.hasIssue && item.severity === 'minor'
                                ? 'border-amber-300 bg-amber-50'
                                : item.checked
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => toggleItem(category.name, item.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{item.label}</p>
                                
                                {item.notes && (
                                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                                    <p className="text-xs text-yellow-900">{item.notes}</p>
                                  </div>
                                )}

                                {editingNoteId === item.id ? (
                                  <div className="mt-2 space-y-2">
                                    <Textarea
                                      placeholder="Add notes about this item..."
                                      value={tempNote}
                                      onChange={(e) => setTempNote(e.target.value)}
                                      className="text-sm"
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => saveNote(category.name, item.id)}
                                        className="bg-purple-600 hover:bg-purple-700"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingNoteId(null);
                                          setTempNote('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingNoteId(item.id);
                                        setTempNote(item.notes);
                                      }}
                                      className="text-xs"
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      {item.notes ? 'Edit Note' : 'Add Note'}
                                    </Button>
                                    
                                    {!item.hasIssue && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => flagIssue(category.name, item.id, 'critical')}
                                          className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                                        >
                                          Critical
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => flagIssue(category.name, item.id, 'minor')}
                                          className="text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                                        >
                                          Minor
                                        </Button>
                                      </div>
                                    )}

                                    {item.hasIssue && (
                                      <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                          item.severity === 'critical'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          {item.severity?.toUpperCase()} ISSUE
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setCategories(prev => prev.map(cat => {
                                              if (cat.name === category.name) {
                                                return {
                                                  ...cat,
                                                  items: cat.items.map(i => 
                                                    i.id === item.id ? { ...i, hasIssue: false, severity: undefined } : i
                                                  )
                                                };
                                              }
                                              return cat;
                                            }));
                                            toast.success('Issue cleared');
                                          }}
                                          className="text-xs"
                                        >
                                          Clear
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab('schedule')} className="flex-1">
                Back to Schedule
              </Button>
              <Button 
                onClick={() => setActiveTab('signoff')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                Continue to Sign-off
              </Button>
            </div>
          </div>
        )}

        {/* Sign-off Tab */}
        {activeTab === 'signoff' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Final Walkthrough Sign-off</h3>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-4">Walkthrough Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Items Checked</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getCheckedItems()} / {getTotalItems()}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Completion</p>
                  <p className="text-2xl font-bold text-purple-600">{progressPercentage}%</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Critical Issues</p>
                  <p className={`text-2xl font-bold ${getCriticalIssues() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {getCriticalIssues()}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Minor Issues</p>
                  <p className={`text-2xl font-bold ${getMinorIssues() > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {getMinorIssues()}
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Messages */}
            {getCheckedItems() < getTotalItems() && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Incomplete Checklist</p>
                    <p className="text-xs text-amber-800">
                      Please complete all checklist items before signing off.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {getCriticalIssues() > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900">Critical Issues Detected</p>
                    <p className="text-xs text-red-800">
                      You have {getCriticalIssues()} critical issue(s). These must be resolved before approval.
                      You can request fixes from the seller.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {getCheckedItems() === getTotalItems() && getCriticalIssues() === 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-900">Ready to Approve</p>
                    <p className="text-xs text-green-800">
                      All items have been checked and no critical issues were found. You can approve the property.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Decision Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleComplete(true)}
                disabled={getCheckedItems() < getTotalItems() || getCriticalIssues() > 0}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg font-bold"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Property - Ready for Closing
              </Button>

              <Button
                onClick={() => handleComplete(false)}
                disabled={getCheckedItems() < getTotalItems()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-6 text-lg font-bold"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Request Fixes from Seller
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveTab('checklist')}
                className="w-full"
              >
                Back to Checklist
              </Button>
            </div>

            {/* Digital Signature Placeholder */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Digital Signature</p>
              <p className="text-xs text-gray-500">
                Your approval will be digitally signed and timestamped
              </p>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
