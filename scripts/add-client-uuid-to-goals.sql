-- Add client_uuid column to cm_goals table for proper client association
-- This ensures goals are uniquely associated with clients since client_name is not unique

ALTER TABLE cm_goals 
ADD COLUMN client_uuid UUID REFERENCES clients(client_uuid);

-- Add index for performance on client_uuid lookups
CREATE INDEX idx_cm_goals_client_uuid ON cm_goals(client_uuid);

-- Add composite index for common query patterns (client_uuid + status)
CREATE INDEX idx_cm_goals_client_uuid_status ON cm_goals(client_uuid, status);
