-- Check all lawyer messages in the system
SELECT 
  lm.id,
  lm.message,
  lm.read,
  lm.created_at,
  sender.email as sender_email,
  recipient.email as recipient_email,
  lp.full_name as lawyer_name
FROM lawyer_messages lm
LEFT JOIN auth.users sender ON lm.sender_id = sender.id
LEFT JOIN auth.users recipient ON lm.recipient_id = recipient.id
LEFT JOIN lawyer_profiles lp ON lm.lawyer_profile_id = lp.id
ORDER BY lm.created_at DESC;
