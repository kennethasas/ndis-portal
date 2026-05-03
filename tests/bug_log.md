# Bug Log

**Project:** NDIS Portal
**Version:** 1.0
**Date:** May 3, 2026
**Prepared by:** QA Team

## NOVA-80: Register Email with Invalid Domain Name 
https://thrivesolutions-team.atlassian.net/browse/NOVA-80

### Steps to Reproduce
1. Open the registration page.
2. Enter valid first name and last name. 
3. Enter an email with an invalid domain format such as `Juancruz@com.gmail`. 
4. Enter the required password and other required fields. 
5. Click Sign Up. 

### Expected Result
- The system should reject the email because the domain format is invalid.

### Actual Result
- The system allows registration even if the email domain is invalid.

### Severity
- Medium

### Status
- Done


## NOVA-81: Mismatch Between API Documentation and Actual Validation for POST /api/services
 https://thrivesolutions-team.atlassian.net/browse/NOVA-81

### Steps to Reproduce
1. Open Postman.
2. Set method to POST.
3. Enter `/api/services`.
4. Add valid Coordinator bearer token.
5. Send request body based on API documentation.
6. Click Send.

### Expected Result
- The API validation should match the API documentation.

### Actual Result
- API validation result does not match the API documentation. 

### Severity
- Medium

### Status
- Done


## NOVA-161: Strict Email Validation Only Accepts Gmail Domain 
https://thrivesolutions-team.atlassian.net/browse/NOVA-161

### Steps to Reproduce
1. Open the registration page. 
2. Enter valid registration details. 
3. Enter an email using a valid non-Gmail domain, such as `user@yahoo.com`. 
4. Click Register.

### Expected Result
- The system should accept valid email formats from different domains, such as `@yahoo.com`, or display a clear validation message like `Invalid email format` only when the email format is invalid. 

### Actual Result
- The system only accepts `@gmail.com` and rejects valid domains like `@yahoo.com` with a generic `Bad request` error message.

### Severity
- Medium

### Status
- Done


## NOVA-163: Breadcrumb Displays Service ID Instead of Selected Service Name on Mobile
https://thrivesolutions-team.atlassian.net/browse/NOVA-163

### Steps to Reproduce  
 1. Log in as a Participant.  
 2. Go to the Services page. 
 3. Select any service, such as `Community Participation Program`.  
 4. Proceed to the booking page. 
 5. Check the breadcrumb navigation. 

### Expected Result
- The breadcrumb should display the actual selected service name, such as `Community Participation Program`.

### Actual Result
-  The breadcrumb displays `Book new?serviceId=3` instead of the selected service name.

### Severity
- Medium

### Status
- Done


## NOVA-165: Registration Page Is Not Responsive in Mobile View
https://thrivesolutions-team.atlassian.net/browse/NOVA-165

### Steps to Reproduce
 1. Open the NDIS portal in a browser. 
 2. Go to the Registration page. 
 3. Open Developer Tools.  
 4. Set the screen size to mobile view, such as width `360px` and height `800px`. 
 5. Observe the layout of the registration form.

### Expected Result
- The registration page should properly adjust to mobile view. The form, image, input fields, and buttons should be readable, aligned, and usable without layout issues.

### Actual Result
-  The registration page is not responsive in mobile view. The layout does not properly fit the `360px x 800px` screen size. 

### Severity
- Medium

### Status
- Done


## NOVA-166: Breadcrumb Does Not Update After Changing Selected Service 
https://thrivesolutions-team.atlassian.net/browse/NOVA-166

### Steps to Reproduce
1. Open the Book a Service page. 
2. Start booking a service, such as `Personal Hygiene Assistance`. 
3. Check the breadcrumb showing the selected service or `serviceId=1/service name`. 
4. Change the selected service using the dropdown, such as switching to `Speech Therapy`. 
5. Observe the breadcrumb.

### Expected Result
- The breadcrumb should update based on the newly selected service, such as `Speech Therapy`.

### Actual Result
- The breadcrumb does not update and still shows the previous selected service or service ID/name.

### Severity
- Medium

### Status
- Done


## NOVA-170: Bookings Page Header Not Visible When Booking List Is Long 
https://thrivesolutions-team.atlassian.net/browse/NOVA-170

### Steps to Reproduce
 1. Log in as a Participant. 
 2. Go to the `My Bookings` page. 
 3. Make sure there are many booking records displayed.  
 4. Scroll down the booking list.  
 5. Observe the page header section, including the title and status filter.

### Expected Result
- The page header, including the title and status filter, should remain visible or easily accessible even when the booking list is long.

### Actual Result
- The table content takes over the screen when there are many booking records, and the header is no longer visible unless the user scrolls all the way up.

### Severity
- Medium

### Status
- Done


## NOVA-171: Action Column Should Display Three-Dot Menu Before Approve and Cancel Buttons
https://thrivesolutions-team.atlassian.net/browse/NOVA-171

### Steps to Reproduce
1. Log in as a Coordinator.  
2. Navigate to the bookings management page. 
3. Check the `Action` column for any booking record. 
4. Observe how the `Approve` and `Cancel` buttons are displayed.

### Expected Result
- The `Action` column should display a three-dot menu first, and the `Approve` and `Cancel` buttons should only appear after clicking the three-dot menu.

### Actual Result
- The `Approve` and `Cancel` buttons are shown directly without the three-dot menu.

### Severity
- Low

### Status
- Done


## NOVA-172:  No “All Bookings” in Sidebar Menu of Coordinator Dashboard
https://thrivesolutions-team.atlassian.net/browse/NOVA-172

### Steps to Reproduce
1. Log in as a Coordinator. 
2. Navigate to the Coordinator Dashboard.  
3. Check the sidebar menu options. 
4. Look for the `All Bookings` menu item.

### Expected Result
- The sidebar menu should display an `All Bookings` option so the Coordinator can easily access and manage all participant bookings. 

### Actual Result
- The `All Bookings` option is not displayed in the Coordinator Dashboard sidebar menu.
 
### Severity
- Medium

### Status
- Done


## NOVA-173: Multiple Bookings Created Due to Repeated Click on Submit Button
https://thrivesolutions-team.atlassian.net/browse/NOVA-173

### Steps to Reproduce
1. Log in as a Participant. 
2. Go to the Services page. 
3. Select a service and open the booking form.  
4. Fill in all required booking details. 
5. Click the `Book This Service` button.  
6. While the page is still redirecting, click the `Book This Service` button multiple times.  
7. Go to the My Bookings page and check the created bookings

### Expected Result
- After clicking `Book This Service`, the button should be disabled or a loading indicator should appear to prevent repeated submissions. Only one booking should be created. 

### Actual Result
- The button remains clickable during the delay, allowing multiple clicks and creating duplicate bookings without warning.

### Severity
- High

### Status
- Done


## NOVA-174: Missing Book a Service Button in Sidebar Menu
https://thrivesolutions-team.atlassian.net/browse/NOVA-174

### Steps to Reproduce
1. Log in as a Participant. 
2. Navigate to the dashboard or main page.  
3. Check the sidebar menu.  
4. Look for a button or menu option for booking a service. 

### Expected Result
- he sidebar menu should include a clear `Book a Service` button or menu option so the participant can easily start booking a service. 

### Actual Result
- There is no other button or menu option in the sidebar for booking a service.

### Severity
- Medium

### Status
- Done


## NOVA-175:  Multiple Sidebar Items Highlighted as Active at the Same Time
https://thrivesolutions-team.atlassian.net/browse/NOVA-175

### Steps to Reproduce
1. Log in as a Coordinator. 
2. Go to the Coordinator Dashboard.  
3. Navigate to the `Manage Services` page from the sidebar.  
4. Observe the active/highlighted sidebar items. 

### Expected Result
- Only the current page, `Manage Services`, should be highlighted as active in the sidebar.

### Actual Result
-  Both `Dashboard` and `Manage Services` sidebar items appear highlighted as active at the same time.

### Severity
- Low

### Status
- Done


## NOVA-176: No Confirmation Message and Newly Added Service Not Visible Immediately
https://thrivesolutions-team.atlassian.net/browse/NOVA-176 

### Steps to Reproduce
1. Log in as a Coordinator.  
2. Go to the Service Management page.  
3. Click the button to add a new service.  
4. Enter all required service details.
5. Save the new service. 
6. Observe if a confirmation message appears.  
7. Check where the newly added service appears in the list.

### Expected Result
-  The system should display a confirmation message after the service is successfully saved, and the newly added service should appear at the top of the list for easier verification. 

### Actual Result
- No confirmation message is displayed after saving, and the newly added service appears at the bottom of the list, making it difficult to immediately verify if it was saved.

### Severity 
- Medium

### Status
- Done



