-- Update Occupational Therapy data in contact records
-- 65% get OT requested, 70% get OT provided, with 90% overlap for those who requested

-- First, randomly set occupational_therapy_requested to 1 for 65% of records
UPDATE contact_log 
SET occupational_therapy_requested = 1 
WHERE id IN (
    SELECT id 
    FROM contact_log 
    ORDER BY RANDOM() 
    LIMIT (SELECT CAST(COUNT(*) * 0.65 AS INTEGER) FROM contact_log)
);

-- Then, set occupational_therapy_provided to 1 for 90% of those who requested OT
UPDATE contact_log 
SET occupational_therapy_provided = 1 
WHERE occupational_therapy_requested = 1 
AND id IN (
    SELECT id 
    FROM contact_log 
    WHERE occupational_therapy_requested = 1 
    ORDER BY RANDOM() 
    LIMIT (SELECT CAST(COUNT(*) * 0.90 AS INTEGER) FROM contact_log WHERE occupational_therapy_requested = 1)
);

-- Finally, add additional records to reach 70% total with OT provided
-- This covers the remaining 10% who didn't request but still received OT
WITH ot_provided_count AS (
    SELECT COUNT(*) as current_provided FROM contact_log WHERE occupational_therapy_provided = 1
),
total_count AS (
    SELECT COUNT(*) as total FROM contact_log
),
target_provided AS (
    SELECT CAST(total.total * 0.70 AS INTEGER) as target 
    FROM total_count total
),
additional_needed AS (
    SELECT GREATEST(0, target.target - current.current_provided) as needed
    FROM ot_provided_count current, target_provided target
)
UPDATE contact_log 
SET occupational_therapy_provided = 1 
WHERE occupational_therapy_provided = 0 
AND id IN (
    SELECT id 
    FROM contact_log 
    WHERE occupational_therapy_provided = 0 
    ORDER BY RANDOM() 
    LIMIT (SELECT needed FROM additional_needed)
);

-- Verification query to check the results
SELECT 
    COUNT(*) as total_records,
    SUM(CASE WHEN occupational_therapy_requested = 1 THEN 1 ELSE 0 END) as ot_requested,
    SUM(CASE WHEN occupational_therapy_provided = 1 THEN 1 ELSE 0 END) as ot_provided,
    SUM(CASE WHEN occupational_therapy_requested = 1 AND occupational_therapy_provided = 1 THEN 1 ELSE 0 END) as both_requested_and_provided,
    ROUND(
        SUM(CASE WHEN occupational_therapy_requested = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
        2
    ) as percent_requested,
    ROUND(
        SUM(CASE WHEN occupational_therapy_provided = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
        2
    ) as percent_provided,
    ROUND(
        SUM(CASE WHEN occupational_therapy_requested = 1 AND occupational_therapy_provided = 1 THEN 1 ELSE 0 END) * 100.0 / 
        NULLIF(SUM(CASE WHEN occupational_therapy_requested = 1 THEN 1 ELSE 0 END), 0),
        2
    ) as percent_of_requested_who_received
FROM contact_log;
