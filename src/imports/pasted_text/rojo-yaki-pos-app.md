Design a modern, clean, responsive desktop web application for a food business called **Rojo-Yaki Takoyaki**.

The application is a **Point of Sale (POS) and Inventory Management System** designed for the business owner and staff to manage sales, products, inventory, and reports.

### BRAND IDENTITY

Use the provided Rojo-Yaki Takoyaki logo as the main branding element throughout the application.

Use these colors inspired by the logo:

* Primary Red: #BA0204
* Secondary Orange: #F99526
* Black: #050608
* White: #FFFFFF
* Light Cream Background: #FFF8F2
* Light Gray: #F5F5F5
* Dark Gray Text: #333333

The overall visual style should be:

* Modern
* Clean
* Professional
* Friendly
* Food-business themed
* Easy to use
* Minimal but visually appealing

Use rounded cards, subtle shadows, clean spacing, readable typography, and clear visual hierarchy.

Do NOT make the interface overly colorful. Red should be the main brand color, while orange should be used for important highlights, buttons, icons, and selected states.

---

# SCREEN 1 — LOGIN

Create a professional login screen.

Layout:

* Centered login card
* Rojo-Yaki Takoyaki logo at the top
* Title: "Welcome Back!"
* Subtitle: "Sign in to manage your business"
* Username or Email input
* Password input
* "Remember me" checkbox
* Red "Login" button
* Small "Forgot Password?" text

Background should use a subtle light cream or white background.

Add a decorative orange/red food-inspired visual element on one side without making the screen too busy.

INTERACTION:

* Clicking Login navigates to Dashboard.
* Password field should have a show/hide password icon.
* Forgot Password can display a small modal.

---

# SCREEN 2 — DASHBOARD

Create the main dashboard after login.

Use a left sidebar navigation.

Sidebar:

* Rojo-Yaki logo
* Dashboard
* Point of Sale
* Products
* Inventory
* Transactions
* Sales Reports
* Settings
* Logout

Highlight the currently selected page with the Rojo-Yaki red color.

Top navigation:

* Page title: "Dashboard"
* Search icon
* Notification icon
* User profile area

Dashboard content:

Greeting:

"Good Morning!"

"Here's your business overview for today."

Create four statistics cards:

1. Today's Sales
   ₱8,450.00
   +12.5%

2. Total Transactions
   48
   +8.2%

3. Products Sold
   126
   +15.4%

4. Low Stock Items
   5
   Needs attention

Use red and orange accents.

Below the statistics, create:

### Sales Overview

A clean line or bar chart showing sales throughout the day.

### Recent Transactions

Display a table containing:

* Transaction ID
* Date
* Customer
* Total
* Payment
* Status

Use small status badges such as:

Completed
Pending
Cancelled

### Low Stock Products

Show products that are almost out of stock.

Each item should display:

* Product name
* Current stock
* Minimum stock
* Status

---

# SCREEN 3 — POINT OF SALE

Create a dedicated POS interface.

The POS screen should be designed for fast order processing.

Layout:

LEFT / MAIN AREA:

* Search products input
* Category filter buttons
* Product cards

Categories:

* Takoyaki
* Snacks
* Drinks
* Add-ons
* Other

Each product card should include:

* Product image or simple food placeholder
* Product name
* Price
* Stock availability
* Add button

Example products:

* Original Takoyaki — ₱80
* Cheese Takoyaki — ₱90
* Spicy Takoyaki — ₱90
* Overload Takoyaki — ₱110
* French Fries — ₱60
* Iced Tea — ₱40
* Soft Drinks — ₱45

RIGHT / ORDER PANEL:

Title:

"Current Order"

Display selected products with:

* Product name
* Quantity controls
* Unit price
* Subtotal
* Remove button

At the bottom:

Subtotal
Discount
Total

Large orange/red:

"Proceed to Payment"

Add a "Clear Order" button.

INTERACTION:

* Clicking a product adds it to the current order.
* Clicking + increases quantity.
* Clicking - decreases quantity.
* Remove removes the product.
* Total automatically updates.
* Proceed to Payment opens the Payment screen/modal.
* Clear Order empties the cart.

---

# SCREEN 4 — PAYMENT / ORDER CONFIRMATION

Create a payment modal or separate screen.

Title:

"Complete Payment"

Show:

Order Summary
Subtotal
Discount
Total Amount

Payment methods:

* Cash
* GCash
* Card

If Cash is selected:

Amount Received
Change

Buttons:

"Confirm Payment"
"Cancel"

After clicking Confirm Payment, show a success state:

"Payment Successful!"

"Transaction #RJ-000124"

Buttons:

"Print Receipt"
"New Order"
"Back to Dashboard"

INTERACTION:

Confirm Payment should navigate to the receipt/success screen and update the transaction.

---

# SCREEN 5 — RECEIPT

Create a simple printable receipt design.

Include:

Rojo-Yaki Takoyaki logo

ROJO-YAKI TAKOYAKI

Transaction Number
Date and Time
Cashier

Items:

Product
Quantity
Price
Subtotal

Then:

Subtotal
Discount
Total
Payment Method
Amount Received
Change

Bottom text:

"Thank you for your order!"

Buttons:

"Print Receipt"
"New Transaction"

---

# SCREEN 6 — PRODUCTS

Create a Product Management page.

Header:

"Product Management"

Description:

"Manage your products and pricing."

Top-right button:

"+ Add Product"

Search bar and category filter.

Product table:

* Product
* Category
* Price
* Stock
* Status
* Actions

Actions:

Edit
Delete
View

Use status badges:

Available
Low Stock
Out of Stock

Clicking "Add Product" should open a modal containing:

Product Name
Category
Price
Initial Stock
Minimum Stock
Product Image

Buttons:

Save Product
Cancel

---

# SCREEN 7 — INVENTORY

Create an Inventory Management page.

Header:

"Inventory Management"

Show summary cards:

Total Products
In Stock
Low Stock
Out of Stock

Inventory table:

* Product
* Category
* Current Stock
* Minimum Stock
* Stock Status
* Last Updated
* Actions

Use visual stock indicators.

Example:

Green = In Stock
Orange = Low Stock
Red = Out of Stock

Include a button:

"+ Add Stock"

Clicking Add Stock opens a modal:

Product
Current Stock
Quantity to Add
New Stock

Button:

"Update Inventory"

INTERACTION:

Updating stock should visually change the stock quantity and status.

---

# SCREEN 8 — TRANSACTION HISTORY

Create a transaction history page.

Header:

"Transaction History"

Add:

Search transaction
Date filter
Payment method filter
Status filter

Table:

Transaction ID
Date
Time
Cashier
Items
Total
Payment Method
Status
Action

Clicking a transaction opens a detailed transaction modal.

Modal should display:

Transaction Information
Purchased Items
Subtotal
Discount
Total
Payment Method
Transaction Date

Button:

"Print Receipt"

---

# SCREEN 9 — SALES REPORTS

Create a Sales Reports page.

Header:

"Sales Reports"

Add date range selector.

Summary cards:

Total Sales
Total Transactions
Average Transaction
Best Selling Product

Create:

### Sales Overview Chart

Show sales performance over time.

### Best Selling Products

Use a horizontal bar chart or ranked list.

Example:

1. Original Takoyaki
2. Cheese Takoyaki
3. Spicy Takoyaki
4. Overload Takoyaki
5. French Fries

Add buttons:

"Generate Report"
"Export Report"

---

# SCREEN 10 — SETTINGS

Create a simple Settings page.

Sections:

Account Information
Business Information
System Preferences

Account:

Name
Username
Password

Business:

Business Name
Contact Number
Address

System Preferences:

Receipt settings
Low-stock notification
Currency: PHP ₱

Buttons:

"Save Changes"

---

# NAVIGATION AND INTERACTION

Make the prototype interactive.

Required interactions:

1. Login button → Dashboard
2. Dashboard → POS
3. Dashboard → Inventory
4. Dashboard → Products
5. Dashboard → Transactions
6. Dashboard → Reports
7. POS product → Add to cart
8. Quantity + → Increase quantity
9. Quantity - → Decrease quantity
10. Remove item → Remove from cart
11. Proceed to Payment → Payment screen
12. Confirm Payment → Payment Successful
13. New Order → POS
14. Add Product → Product modal
15. Save Product → Product list
16. Add Stock → Inventory modal
17. Update Inventory → Updated inventory
18. Transaction row → Transaction details
19. Print Receipt → Receipt screen/modal
20. Logout → Login

Use smooth transitions and subtle hover states.

---

# UI DESIGN SYSTEM

Typography:

Use a modern sans-serif font such as Inter, Poppins, or similar.

Headings should be bold.

Body text should be clean and readable.

Buttons:

Primary button:
Rojo-Yaki Red #BA0204

Secondary button:
Orange #F99526

Danger:
Dark Red

Neutral:
Light Gray / White

Cards:

White background
12–16px rounded corners
Subtle shadow
Comfortable padding

Sidebar:

Dark black or very dark charcoal background.

Use white icons and text.

Selected navigation item should use Rojo-Yaki Red or Orange.

Tables:

Use clean white cards with subtle borders.

Use rounded status badges.

---

# RESPONSIVE DESIGN

Create the desktop version first at approximately 1440 × 900.

Also make the layout adaptable for tablet and smaller screens.

The sidebar should collapse on smaller screens.

The POS interface should remain easy to use on smaller screens.

---

# IMPORTANT PROTOTYPE GOAL

The prototype should feel like a REAL working Point of Sale and Inventory Management System rather than a collection of static screens.

Prioritize the following user journey:

LOGIN
↓
DASHBOARD
↓
POINT OF SALE
↓
SELECT PRODUCT
↓
ADD TO CART
↓
PAYMENT
↓
PAYMENT SUCCESS
↓
RECEIPT
↓
NEW ORDER

Also demonstrate the management workflow:

DASHBOARD
↓
INVENTORY
↓
ADD/UPDATE STOCK
↓
PRODUCT MANAGEMENT
↓
SALES REPORTS
↓
TRANSACTION HISTORY

Use realistic sample data and Philippine Peso (₱) currency throughout the prototype.

The final design should look professional enough to be presented as a college IT system proposal while still clearly reflecting the fun and friendly identity of Rojo-Yaki Takoyaki.
