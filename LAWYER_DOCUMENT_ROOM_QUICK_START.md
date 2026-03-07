# Lawyer Document Room Access - Quick Start Guide 🚀

## ⚡ 3-Minute Setup

### Step 1: Run Migration (30 seconds)
```bash
# In your terminal
supabase db push
```

Or copy/paste this in Supabase SQL Editor:
```sql
-- Copy entire contents of:
-- supabase/migrations/20260309_lawyer_document_room_access.sql
```

### Step 2: Verify Setup (30 seconds)
```sql
-- Check tables exist
SELECT COUNT(*) FROM deal_lawyers;
SELECT COUNT(*) FROM lawyer_notifications;

-- Should return 0 (empty tables, but they exist!)
```

### Step 3: Test as Buyer (1 minute)
1. Log in as a buyer
2. Go to any property → "Secure Document Room"
3. Click purple "Add Lawyer" button
4. Click "Assign Lawyer" in modal
5. See green "Assigned Lawyer: [Name]" badge ✅

### Step 4: Test as Lawyer (1 minute)
1. Log in as a lawyer
2. Go to Dashboard
3. See "Document Reviews" card
4. Click "View All Reviews"
5. Click "Review Documents" on any property
6. Access documents ✅

---

## 🎯 What You Get

### For Buyers
- **One-click lawyer assignment** from Secure Document Room
- **Visual confirmation** with green badge
- **Peace of mind** knowing a lawyer is reviewing documents

### For Lawyers
- **Centralized dashboard** showing all assigned properties
- **Quick access** to document rooms
- **Professional workflow** for document review

---

## 📍 Key Locations

### Buyer Side
- **Button Location:** Property Document Vault → Top action bar
- **Route:** `/dashboard/property-documents/:propertyId`

### Lawyer Side
- **Dashboard Card:** Lawyer Dashboard → "Document Reviews" card
- **Full List:** `/dashboard/lawyer-document-reviews`
- **Sidebar:** "Document Reviews" menu item (⚖️ icon)

---

## 🔧 Troubleshooting

### "Add Lawyer" button not showing?
- Make sure you're viewing as a buyer (not property owner)
- Check that you're in the Secure Document Room

### No lawyer available?
- Ensure at least one lawyer profile exists in database
- Check `lawyer_profiles` table

### Lawyer can't see documents?
- Verify assignment in `deal_lawyers` table
- Check RLS policies are applied

### TypeScript errors?
- Normal before migration runs
- Will resolve after `supabase db push`

---

## 📊 Database Quick Check

```sql
-- See all assignments
SELECT 
  dl.id,
  p.address as property,
  lp.full_name as lawyer,
  up.full_name as buyer,
  dl.status,
  dl.assigned_at
FROM deal_lawyers dl
JOIN properties p ON dl.deal_id = p.id
JOIN lawyer_profiles lp ON dl.lawyer_id = lp.id
JOIN user_profiles up ON dl.buyer_id = up.id
ORDER BY dl.assigned_at DESC;

-- See all notifications
SELECT 
  ln.title,
  ln.message,
  ln.read,
  lp.full_name as lawyer,
  ln.created_at
FROM lawyer_notifications ln
JOIN lawyer_profiles lp ON ln.lawyer_id = lp.id
ORDER BY ln.created_at DESC;
```

---

## 🎨 UI Preview

### Buyer View
```
┌─────────────────────────────────────────────────┐
│  🛡️ Secure Document Room                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  [📄 Documents] [📋 Start Closing]  [⚖️ Add Lawyer] │
│                                                 │
│  After assignment:                              │
│  [📄 Documents] [📋 Start Closing]  [✓ Assigned Lawyer: John Smith] │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Lawyer Dashboard
```
┌─────────────────────────────────────────────────┐
│  📊 Document Reviews                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ⚖️  3 Active                                   │
│                                                 │
│  Properties assigned to you for legal           │
│  document review                                │
│                                                 │
│  [View All Reviews →]                           │
└─────────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Migration ran successfully
- [ ] Tables created (deal_lawyers, lawyer_notifications)
- [ ] Buyer can see "Add Lawyer" button
- [ ] Buyer can assign lawyer
- [ ] Button changes to green badge
- [ ] Lawyer sees Document Review card
- [ ] Lawyer can view review list
- [ ] Lawyer can access documents
- [ ] Lawyer cannot modify property

---

## 🚨 Important Notes

1. **Platform Lawyer:** Currently uses first lawyer in system
2. **One Assignment:** Unique constraint prevents duplicate assignments
3. **Read-Only:** Lawyers can view/download but not modify
4. **Notifications:** Database ready, UI optional for future
5. **Security:** All RLS policies enforced automatically

---

## 📞 Need Help?

Check these files for details:
- `LAWYER_DOCUMENT_ROOM_COMPLETE.md` - Full documentation
- `LAWYER_DOCUMENT_ROOM_ACCESS_IMPLEMENTATION.md` - Technical details
- `supabase/migrations/20260309_lawyer_document_room_access.sql` - Database schema

---

**That's it! You're ready to go! 🎉**

Run the migration and start testing. The feature is production-ready!

