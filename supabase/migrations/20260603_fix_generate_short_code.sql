-- Make short_code auto-generation robust against non-numeric short_codes.
-- The BEFORE INSERT trigger generate_short_code() computed
-- MAX(short_code::INTEGER) over ALL rows. A legacy/test value like "TEST-104"
-- could not be cast to integer, which made EVERY insert into task_jobs fail
-- (including the Zapier webhook and the app's own job creation).
-- Fix: only consider purely numeric short_codes when computing the next code.
CREATE OR REPLACE FUNCTION public.generate_short_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  max_code INTEGER;
BEGIN
  IF NEW.short_code IS NULL THEN
    SELECT COALESCE(MAX(short_code::INTEGER), 0) INTO max_code
    FROM task_jobs
    WHERE short_code ~ '^[0-9]+$';
    NEW.short_code := LPAD((max_code + 1)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$function$;
