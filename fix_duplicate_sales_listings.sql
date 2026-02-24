-- Find duplicate sales listings
SELECT id, COUNT(*) as count
FROM sales_listings
GROUP BY id
HAVING COUNT(*) > 1;

-- If duplicates found, keep only the most recent one
-- (Run this AFTER checking the results above)
/*
DELETE FROM sales_listings
WHERE ctid NOT IN (
  SELECT MAX(ctid)
  FROM sales_listings
  GROUP BY id
);
*/
