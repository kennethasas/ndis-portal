USE ndis_portal_db;
GO

-- 1. List all services with their category name
SELECT 
    s.id AS service_id,
    s.name AS service_name,
    sc.name AS category_name,
    s.description,
    s.is_active
FROM services s
INNER JOIN service_categories sc
    ON s.category_id = sc.id;


-- 2. List all bookings with participant full name and service name
SELECT 
    b.id AS booking_id,
    CONCAT(u.first_name, ' ', u.last_name) AS participant_full_name,
    s.name AS service_name,
    b.booking_date AS preferred_date,
    b.status,
    b.notes
FROM bookings b
INNER JOIN users u
    ON b.user_id = u.id
INNER JOIN services s
    ON b.service_id = s.id;


-- 3. Count of bookings grouped by status
SELECT 
    b.status,
    COUNT(*) AS total_bookings
FROM bookings b
GROUP BY b.status;


-- 4. List all Pending bookings ordered by preferred date ascending
SELECT 
    b.id AS booking_id,
    CONCAT(u.first_name, ' ', u.last_name) AS participant_full_name,
    s.name AS service_name,
    b.booking_date AS preferred_date,
    b.status
FROM bookings b
INNER JOIN users u
    ON b.user_id = u.id
INNER JOIN services s
    ON b.service_id = s.id
WHERE b.status = 0
ORDER BY b.booking_date ASC;


-- 5. List services that have never been booked
SELECT 
    s.id AS service_id,
    s.name AS service_name,
    sc.name AS category_name
FROM services s
INNER JOIN service_categories sc
    ON s.category_id = sc.id
LEFT JOIN bookings b
    ON s.id = b.service_id
WHERE b.id IS NULL;


-- 6. Count of bookings per participant
SELECT 
    u.id AS participant_id,
    CONCAT(u.first_name, ' ', u.last_name) AS participant_full_name,
    COUNT(b.id) AS total_bookings
FROM users u
LEFT JOIN bookings b
    ON u.id = b.user_id
WHERE u.role = 'Participant'
GROUP BY 
    u.id,
    u.first_name,
    u.last_name;


-- 7. List all active services in the Therapy Supports category
SELECT 
    s.id AS service_id,
    s.name AS service_name,
    s.description,
    sc.name AS category_name
FROM services s
INNER JOIN service_categories sc
    ON s.category_id = sc.id
WHERE 
    s.is_active = 1
    AND sc.name = 'Therapy Supports';


-- 8. List bookings where preferred date is in the next 30 days
SELECT 
    b.id AS booking_id,
    CONCAT(u.first_name, ' ', u.last_name) AS participant_full_name,
    s.name AS service_name,
    b.booking_date AS preferred_date,
    b.status
FROM bookings b
INNER JOIN users u
    ON b.user_id = u.id
INNER JOIN services s
    ON b.service_id = s.id
WHERE 
    b.booking_date >= GETDATE()
    AND b.booking_date < DATEADD(DAY, 30, GETDATE())
ORDER BY b.booking_date ASC;


-- 9. List all coordinators in the Users table
SELECT 
    id AS user_id,
    CONCAT(first_name, ' ', last_name) AS coordinator_full_name,
    email,
    role
FROM users
WHERE role = 'Coordinator';


-- 10. List participants who have at least one Approved booking
SELECT DISTINCT
    u.id AS participant_id,
    CONCAT(u.first_name, ' ', u.last_name) AS participant_full_name,
    u.email
FROM users u
INNER JOIN bookings b
    ON u.id = b.user_id
WHERE 
    u.role = 'Participant'
    AND b.status = 1;