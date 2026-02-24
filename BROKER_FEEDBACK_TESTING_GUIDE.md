# Broker Feedback System - Testing Guide 🧪

## ✅ Migration Complete!

The database migration has been successfully applied. All tables, columns, policies, triggers, and indexes are now in place.

---

## Step 1: Verify Setup (Optional)

Run `verify_broker_feedback_setup.sql` in Supabase SQL Editor to confirm everything was created correctly.

Expected results:
- ✅ mortgage_profile_feedback table EXISTS
- ✅ review_status column EXISTS
- ✅ last_reviewed_at column EXISTS
- ✅ last_reviewed_by column EXISTS
- ✅ 4 RLS policies created
- ✅ 2 triggers created
- ✅ 4 indexes created
- ✅ Saeid's profile has review_status: pending_review

---

## Step 2: Test as Seeker (Saeid)

### Login Details:
- Email: `saeid.shabani64@gmail.com`
- Password: [your password]

### Testing Steps:

1. **Navigate to Buying Opportunities**
   - Go to dashboard
   - Click "Buying Opportunities" in sidebar
   - You should see 3 tabs at the top:
     - Co-Ownership
     - Mortgage Profile
     - **Broker Feedback** ← NEW!

2. **Click "Broker Feedback" Tab**
   - Should see a beautiful gradient header: "Broker Feedback"
   - Status badge should show: "Pending Review" (gray)
   - Empty message area with text: "No messages yet"
   - Message input box at bottom

3. **Send a Test Message**
   - Type in the message box: "Hi, I've completed my mortgage profile. Please review when you have a chance!"
   - Press Enter or click Send button
   - Message should appear in the thread immediately
   - Your message should have purple/pink gradient background
   - Should show "You" as sender

4. **Check Status**
   - Status should still be "Pending Review" (only changes when broker responds)

---

## Step 3: Test as Broker (You)

### Login Details:
- Email: `chinaplusgroup@gmail.com`
- Password: [your password]

### Testing Steps:

1. **Navigate to Clients Page**
   - Go to dashboard
   - Click "Clients" in sidebar
   - Should see Saeid Shabani's card

2. **View Client Details**
   - Click "View Details" on Saeid's card
   - Modal opens with complete mortgage profile
   - (Note: Feedback integration in modal is a future enhancement)

3. **Access Broker Feedback (Two Options)**

   **Option A: Direct URL**
   - Open new tab
   - Go to: `http://localhost:5173/dashboard/buying-opportunities?tab=broker-feedback`
   - This will show the broker's view of feedback

   **Option B: Switch to Seeker Account Temporarily**
   - For now, you can test by logging in as Saeid
   - Send messages back and forth
   - Then log back in as broker to see the messages

4. **Send Broker Feedback**
   - In the Broker Feedback tab (as broker)
   - You should see Saeid's message
   - Type a response: "Thank you for completing your profile! I've reviewed your information. Your income and savings look good. I recommend we discuss pre-approval options."
   - Press Enter or click Send
   - Message should appear with gray background (broker messages)
   - Should show "Broker" badge next to your name

5. **Approve or Reject Profile**
   - Click "Approve" button (green)
   - Status should change to "Approved" with green badge
   - Or click "Reject" button (red outline)
   - Status would change to "Rejected" with red badge

---

## Step 4: Test Real-Time Updates

1. **Open Two Browser Windows**
   - Window 1: Logged in as Saeid (seeker)
   - Window 2: Logged in as Broker (you)

2. **Both Navigate to Broker Feedback Tab**
   - Window 1: Buying Opportunities → Broker Feedback
   - Window 2: Buying Opportunities → Broker Feedback (or client modal)

3. **Send Messages Back and Forth**
   - Send from Window 1 (Saeid)
   - Should appear in Window 2 (Broker) within 30 seconds
   - Send from Window 2 (Broker)
   - Should appear in Window 1 (Saeid) within 30 seconds

4. **Check Unread Badge**
   - When broker sends message, Saeid should see red badge on "Broker Feedback" tab
   - Badge shows number of unread messages
   - Badge disappears when messages are read

---

## Expected Behavior:

### Status Flow:
1. **Pending Review** (gray) - Initial state when profile created
2. **Under Review** (blue) - Broker is actively reviewing
3. **Feedback Sent** (orange) - Broker sent feedback to seeker
4. **Under Discussion** (purple) - Seeker replied to broker's feedback
5. **Approved** (green) - Broker approved the profile
6. **Rejected** (red) - Broker rejected the profile

### Message Styling:
- **Seeker messages**: Purple/pink gradient background, white text
- **Broker messages**: Gray background, dark text with "Broker" badge
- **Your own messages**: Always show "You" as sender

### Real-Time Features:
- Messages refresh every 30 seconds automatically
- Unread count updates every 30 seconds
- Status changes reflect immediately
- Smooth animations and transitions

---

## Troubleshooting:

### If tabs don't appear:
- Clear browser cache and refresh
- Check browser console for errors (F12)
- Verify you're on the latest code (git pull)

### If messages don't send:
- Check browser console for errors
- Verify RLS policies are active (run verify SQL)
- Check network tab for failed requests

### If real-time updates don't work:
- Wait 30 seconds (that's the refresh interval)
- Check if Supabase realtime is enabled for your project
- Verify subscription is working (check console logs)

### If unread badge doesn't show:
- Refresh the page
- Check if messages are marked as read in database
- Verify getUnreadCount function is working

---

## Next Steps (Future Enhancements):

1. **Add Feedback Button in Client Modal**
   - Add "Send Feedback" button in broker's client details modal
   - Opens feedback dialog without leaving the page

2. **Email Notifications**
   - Send email when broker sends feedback
   - Send email when seeker replies

3. **Push Notifications**
   - Real-time browser notifications
   - Mobile push notifications

4. **File Attachments**
   - Allow uploading documents in feedback
   - Support images, PDFs, etc.

5. **Message Search**
   - Search through feedback history
   - Filter by date, sender, section

---

## Success Criteria:

- ✅ 3 tabs visible on Buying Opportunities page
- ✅ Broker Feedback tab opens without errors
- ✅ Seeker can send messages
- ✅ Broker can send messages
- ✅ Messages appear in thread
- ✅ Status badge shows correct status
- ✅ Approve/Reject buttons work
- ✅ Unread badge appears when needed
- ✅ Real-time updates work (within 30 seconds)
- ✅ Organizational UI colors applied (purple/pink/indigo)

---

**Ready to test!** Start with Step 2 (test as seeker) and let me know if you encounter any issues.
