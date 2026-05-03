CREATE DATABASE ndis_portal_db;
Go
use ndis_portal_db;
Go

CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('Participant', 'Coordinator')),
    created_date DATETIME NOT NULL DEFAULT GETDATE(),
    modified_date DATETIME NOT NULL DEFAULT GETDATE()
);
Go

CREATE TABLE service_categories (
id INT PRIMARY KEY IDENTITY(1,1),
name NVARCHAR(50) UNIQUE NOT NULL ,
created_date DATETIME NOT NULL DEFAULT GETDATE(),
modified_date DATETIME NOT NULL DEFAULT GETDATE()
);
Go

CREATE TABLE services (
    id INT PRIMARY KEY IDENTITY(1,1),
    category_id INT NOT NULL,
    name NVARCHAR(50) NOT NULL,
    description NVARCHAR(200) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_date DATETIME NOT NULL DEFAULT GETDATE(),
    modified_date DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_services_category 
    FOREIGN KEY (category_id) 
    REFERENCES service_categories(id)
);
Go

CREATE TABLE support_workers(
 id INT PRIMARY KEY IDENTITY(1,1),
 service_id INT NOT NULL,
 first_name NVARCHAR(50) NOT NULL,
 last_name NVARCHAR(50) NOT NULL,
 email NVARCHAR(50) UNIQUE NOT NULL,
 phone NVARCHAR(50),
 created_date DATETIME NOT NULL DEFAULT GETDATE(),
 modified_date DATETIME NOT NULL DEFAULT GETDATE(),

 CONSTRAINT FK_services
 FOREIGN KEY (service_id)
 REFERENCES services(id)
);
Go


CREATE TABLE bookings (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATETIME NOT NULL,
    notes NVARCHAR(500) NULL,
    status TINYINT NOT NULL DEFAULT 0, -- 0=Pending, 1=Approved, 2=Cancelled
    created_date DATETIME NOT NULL DEFAULT GETDATE(),
    modified_date DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_bookings_user 
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_bookings_service 
    FOREIGN KEY (service_id) REFERENCES services(id),
    CONSTRAINT CHK_booking_status 
    CHECK (status IN (0,1,2))
);
Go




INSERT INTO service_categories (name)
VALUES
('Daily Personal Activities'),
('Community Access'),
('Therapy Supports'),
('Respite Care'),
('Support Coordination');
Go

INSERT INTO services (category_id, name, description)
VALUES
(1, 'Personal Hygiene Assistance', 'Help with daily hygiene'),
(1, 'Meal Preparation Support', 'Assist in preparing meals'),

(2, 'Community Participation Program', 'Engage in community activities'),
(2, 'Social Skills Group', 'Improve social interaction skills'),

(3, 'Occupational Therapy', 'Improve daily living skills'),
(3, 'Speech Therapy', 'Enhance communication skills'),

(4, 'Short Term Respite Accommodation', 'Temporary care support'),

(5, 'Plan Management & Coordination', 'Manage and coordinate plans');
Go

INSERT INTO users (first_name, last_name, email, password_hash, role)
VALUES
('System', 'Coordinator', 'coordinator@ndisportal.com', '$2a$11$c2OBknxO3R4fGinSBwVmVeXPiQI4AII2gaXNAbqrbDzdw0j7luUXK', 'Coordinator'),
('Scrum', 'Master', 'participant1@ndisportal.com', '$2a$11$freqKV3v4z4szMDj6kRrxeyDWzMWEyobGwwhWAm/YLQVTv9YH0BmO', 'Participant'),
('Product', 'Owner', 'participant2@ndisportal.com', '$2a$11$PSvudrt1l4Qm.BkzkithyeEu6nbIQ6/yYpUmveBf5R9oagrFVzyXG', 'Participant');

INSERT INTO bookings (user_id, service_id, booking_date, notes, status)
VALUES

(2, 1, '2026-04-20 09:00:00', 'Morning assistance', 0), 
(2, 3, '2026-04-21 10:00:00', 'Community event', 1), 
(3, 2, '2026-04-22 11:00:00', 'Meal prep help', 0), 
(3, 6, '2026-04-23 01:00:00', 'Speech session', 2);
Go

