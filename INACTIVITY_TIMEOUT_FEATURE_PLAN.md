# Inactivity Timeout Feature - Implementation Plan

## Concept Overview
Add a 5-minute auto-close timer to the Secure Document Viewer that automatically closes the viewer when the user is inactive, preventing sensitive documents from being left open unattended (e.g., laptop left open in a coffee shop).

## Security Rationale
- **Prevents Idle Leaks**: Protects sellers from situations where buyers leave laptops open with sensitive documents (Tax Bills, Disclosures, Title Deeds) visible to passersby
- **Compliance**: Demonstrates due diligence in protecting confidential information
- **Best Practice**: Similar to banking apps and other secure document systems

## Feature Requirements

### 1. Inactivity Detection
**Timer Duration**: 5 minutes (300 seconds)

**Activity Events to Monitor**:
- `mousemove` - Mouse movement
- `scroll` - Scrolling the document
- `keypress` - Any keyboard input
- `touchstart` - Touch interactions (mobile)
- `wheel` - Mouse wheel scrolling

**Implementation**:
```typescript
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_BEFORE_CLOSE = 30 * 1000; // 30 seconds warning

const [lastActivity, setLastActivity] = useState(Date.now());
const [showWarning, setShowWarning] = useState(false);
const [secondsRemaining, setSecondsRemaining] = useState(30);
```

### 2. Warning System
**Timing**: 30 seconds before auto-close (at 4:30 mark)

**Warning UI**:
- Small countdown banner at the top of the viewer
- Message: "For your security, this session will expire in {X} seconds due to inactivity."
- Color: Amber/yellow background (matches security notice)
- Position: Below the security notice banner
- Countdown: Live updating seconds (30, 29, 28...)

**User Actions**:
- Any activity (mouse move, scroll, click) resets the timer
- Warning disappears when activity is detected
- Timer resets to 5 minutes

### 3. Auto-Close Behavior
**When Timer Expires**:
1. Automatically call `onClose()` function
2. Log the session timeout to `document_access_logs` table with `access_type: 'session_timeout'`
3. Show toast notification: "Document viewer closed due to inactivity"
4. Return user to the document list

**No Confirmation Dialog**: 
- Silent auto-close (no "Are you sure?" prompt)
- This is intentional for security - we don't want to keep the document open longer

### 4. Implementation Details

#### State Management
```typescript
const [lastActivity, setLastActivity] = useState(Date.now());
const [showWarning, setShowWarning] = useState(false);
const [secondsRemaining, setSecondsRemaining] = useState(30);
const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
```

#### Activity Listener Setup
```typescript
useEffect(() => {
  if (!isOpen) return;

  const resetActivityTimer = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
    
    // Clear existing timers
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    
    // Set warning timer (4.5 minutes)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_CLOSE);
    
    // Set auto-close timer (5 minutes)
    activityTimerRef.current = setTimeout(() => {
      handleInactivityClose();
    }, INACTIVITY_TIMEOUT);
  };

  // Activity event listeners
  const events = ['mousemove', 'scroll', 'keypress', 'touchstart', 'wheel'];
  events.forEach(event => {
    document.addEventListener(event, resetActivityTimer);
  });

  // Initialize timer
  resetActivityTimer();

  return () => {
    events.forEach(event => {
      document.removeEventListener(event, resetActivityTimer);
    });
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  };
}, [isOpen]);
```

#### Countdown Display
```typescript
const startCountdown = () => {
  let seconds = 30;
  setSecondsRemaining(seconds);
  
  const countdownInterval = setInterval(() => {
    seconds--;
    setSecondsRemaining(seconds);
    
    if (seconds <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
};
```

#### Auto-Close Handler
```typescript
const handleInactivityClose = async () => {
  // Log the timeout event
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("document_access_logs" as any).insert({
        document_id: documentId,
        property_id: propertyId,
        viewer_id: user.id,
        viewer_email: viewerEmail,
        viewer_name: viewerName,
        access_type: "session_timeout",
      });
    }
  } catch (error) {
    console.error("Failed to log session timeout:", error);
  }
  
  // Show notification
  toast.info("Document viewer closed due to inactivity", {
    duration: 3000,
  });
  
  // Close the viewer
  onClose();
};
```

#### Warning Banner UI
```tsx
{/* Inactivity Warning Banner */}
{showWarning && (
  <div className="h-12 bg-amber-400 flex items-center justify-center px-6 animate-pulse">
    <div className="flex items-center gap-2 text-amber-950">
      <Clock className="h-4 w-4 shrink-0" />
      <p className="text-sm font-semibold">
        For your security, this session will expire in {secondsRemaining} seconds due to inactivity.
      </p>
    </div>
  </div>
)}
```

### 5. Database Schema Update
Add new access_type to document_access_logs:
```sql
-- Already supports any text value, just document the new type:
-- access_type values:
--   'view' - Document opened
--   'download' - Document downloaded (if allowed)
--   'print_attempt' - User tried to print
--   'session_timeout' - Viewer closed due to inactivity
```

### 6. User Experience Flow

**Normal Usage**:
1. User opens document → Timer starts (5 min)
2. User scrolls/reads → Timer resets to 5 min
3. User continues interacting → Timer keeps resetting
4. User closes document manually → Normal close

**Inactivity Scenario**:
1. User opens document → Timer starts (5 min)
2. User reads for 2 minutes, then gets distracted
3. At 4:30 mark → Warning banner appears with 30-second countdown
4. User doesn't return → At 5:00 mark, viewer auto-closes
5. User returns to see document list with toast notification

**Warning Dismissal**:
1. Warning appears at 4:30 mark
2. User moves mouse or scrolls
3. Warning disappears immediately
4. Timer resets to 5 minutes

### 7. Configuration Options (Future Enhancement)
Could make timeout configurable per document type:
- High sensitivity (Title Deed, Tax Bills): 3 minutes
- Medium sensitivity (Disclosures): 5 minutes
- Low sensitivity (Photos): 10 minutes

### 8. Testing Checklist
- [ ] Timer starts when viewer opens
- [ ] Timer resets on mouse movement
- [ ] Timer resets on scrolling
- [ ] Timer resets on keyboard input
- [ ] Warning appears at 4:30 mark
- [ ] Countdown updates every second
- [ ] Warning disappears when user is active
- [ ] Viewer auto-closes at 5:00 mark
- [ ] Toast notification shows on auto-close
- [ ] Session timeout logged to database
- [ ] Timer cleans up when viewer closes manually
- [ ] Works on mobile (touch events)

### 9. Analytics & Monitoring
Track in database:
- How often sessions timeout vs manual close
- Average session duration before timeout
- Documents with highest timeout rates
- Time of day patterns for timeouts

This data helps understand user behavior and optimize timeout duration.

### 10. Accessibility Considerations
- Screen reader announcement when warning appears
- Keyboard navigation still resets timer
- High contrast warning banner
- Clear, simple language in warning message

## Implementation Priority
**Status**: PLANNED (Not yet implemented)
**Priority**: MEDIUM-HIGH (Security feature)
**Estimated Time**: 2-3 hours
**Dependencies**: None (can be added to existing SecureDocumentViewer)

## Notes
- This feature complements the existing security measures (right-click blocking, watermarks, keyboard shortcuts)
- Does NOT prevent screenshots or screen recording (OS-level, cannot be prevented)
- Watermark still serves as deterrent even if document is photographed during active session
- Consider adding user preference to disable timeout for accessibility needs (with appropriate warnings)
