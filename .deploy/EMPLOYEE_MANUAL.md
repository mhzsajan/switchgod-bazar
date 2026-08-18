# Employee Manual — PickBazar Admin Panel

> **v1.1 (Aug 18, 2026):** Since this version, login requires a Turnstile captcha ("I'm human" check) and registration requires email verification. Emails to staff come from `support@switchgod.com.np`. Project docs: `SESSIONS.md`, `.deploy/README.md`.

> **For SwitchGod Company employees.** This manual explains how to manage your departments (shops), products, prices, and orders using the admin dashboard.

---

## Table of Contents

1. [What Is This System?](#1-what-is-this-system)
2. [Login](#2-login)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Understanding the Structure](#4-understanding-the-structure)
5. [Creating a Department (Shop)](#5-creating-a-department-shop)
6. [Creating Product Categories (Types)](#6-creating-product-categories-types)
7. [Creating Sub-Categories](#7-creating-sub-categories)
8. [Adding Products](#8-adding-products)
9. [Managing Prices / Sale Prices](#9-managing-prices--sale-prices)
10. [Managing Orders](#10-managing-orders)
11. [Frequently Asked Tasks](#11-frequently-asked-tasks)
12. [Quick Reference](#12-quick-reference)

---

## 1. What Is This System?

This is your company's e-commerce website (**switchgod.com.np**). It lets you:

- List products for sale (with photos, prices, descriptions)
- Organize products by department and category
- Accept orders from customers
- Manage inventory

**How it's set up for our company:**

Instead of using this as a marketplace for many vendors, we use **each "Shop" as a department**:

| Department (Shop) | Example Products |
|---|---|
| Auto Parts | Car batteries, tires, engine oil |
| Gaming | Consoles, controllers, games |
| Electronics | Laptops, phones, chargers |
| Computer IT | Monitors, keyboards, cables |
| Music | Guitars, headphones, speakers |

When you create a product, you put it under the correct department (shop). Customers see the departments when they visit the website.

---

## 2. Login

**URL:** `https://admin.switchgod.com.np/login`

**Your login credentials** will be provided by your manager. Example:

| Email | Password |
|---|---|
| admin@demo.com | demodemo |

### Steps

1. Open Chrome/Firefox and go to `https://admin.switchgod.com.np/login`
2. Enter your email and password
3. Click **"Login"**
4. You'll see the Dashboard with a sidebar menu on the left

> If you can't login, contact your manager.

---

## 3. Dashboard Overview

After login, you'll see:

### Left Sidebar (Main Menu)

The sidebar has sections. The ones you'll use most:

| Section | What's Inside |
|---|---|
| **Dashboard** | Home screen with stats |
| **Shop Management** → All Shops | View/edit your departments |
| **Product Management** → All Products | Add/edit products |
| **Product Management** → Categories | Organize products into categories |
| **Product Management** → Groups | Manage top-level categories (Types) |
| **Order Management** → Orders | See customer orders |
| **Settings** → General Settings | Site currency, tax, etc. (admin only) |

### Top Bar

- Search bar (top right)
- Notification bell
- Your name/avatar → logout

---

## 4. Understanding the Structure

Here's how products are organized:

```
TYPE (Group) ─── e.g., "Auto Parts", "Gaming", "Electronics"
    │                 (controls how the page looks)
    │
    ├── CATEGORY ─── e.g., "Car Batteries" (under Auto Parts)
    │     │               "PlayStation" (under Gaming)
    │     │
    │     └── Subcategory ─── e.g., "Lead Acid" (under Car Batteries)
    │
    └── PRODUCT ─── The actual item for sale
```

Plus:

```
SHOP (Department) ─── e.g., "Auto Parts Shop", "Gaming Shop"
    │                    (your department/brand)
    │
    └── PRODUCT ─── Each product belongs to one department
```

### Quick explanation:

- **Type (Group):** A broad product category. "Auto Parts", "Gaming", "Electronics". Each Type has its own page layout on the website.
- **Category:** A sub-group within a Type. "Car Batteries" under "Auto Parts".
- **Shop (Department):** Your department/brand. Products belong to one shop.
- **Product:** The actual item. It must have a Type and a Shop.

**Cheat sheet example:**

| Product | Type | Category | Shop |
|---|---|---|---|
| Sony WH-1000XM5 Headphones | Electronics | Headphones | Electronics Shop |
| Logitech G Pro Mouse | Gaming | Accessories | Gaming Shop |
| Exide 12V Car Battery | Auto Parts | Car Batteries | Auto Parts Shop |

---

## 5. Creating a Department (Shop)

> Only needed once per department. If your department already exists, skip this.

**Path:** Sidebar → Shop Management → All Shops → **"Add Shop"** button (top right)

**URL:** `https://admin.switchgod.com.np/shops/create`

### What to fill:

| Section | Field | Required? | Example |
|---|---|---|---|
| Logo | Upload your department logo | No | gaming-logo.png |
| Cover Image | Upload cover photo (1170x435px) | No | gaming-banner.jpg |
| **Basic Info** | **Name** | **Yes** | Gaming Shop |
| | Slug | Auto-filled | gaming-shop |
| | Description | No | "Best gaming products in Nepal" |
| **Payment Info** | Account Holder Name | **Yes** | Your Name |
| | Account Holder Email | **Yes** | your@email.com |
| | Bank Name | **Yes** | Global IME Bank |
| | Account Number | **Yes** | 1234567890 |
| **Contact** | Contact Phone | **Yes** | 9801234567 |
| | Website | **Yes** | https://switchgod.com.np |
| **Address** | Country / City / State / ZIP | No | Nepal / Kathmandu |

### After creation:

1. The shop/department will be **inactive** (pending approval)
2. An admin must **approve** it:
   - Go to **Shop Management → Inactive Shops**
   - Click **"Approve"** on your shop
   - Set **Commission Rate** (e.g., 0 for now)
   - Confirm

3. Once approved, it appears on the website at `switchgod.com.np` (may take ~2 minutes)

---

## 6. Creating Product Categories (Types)

> Before you can add products, you need a **Type**. Create one per main department.

**Path:** Sidebar → Page Control → Groups → **"Add Group"** button

**URL:** `https://admin.switchgod.com.np/groups/create`

### What to fill:

| Field | Required? | Example |
|---|---|---|
| **Name** | **Yes** | "Gaming" |
| Slug | Auto | "gaming" |
| Icon | No | Pick from list |
| Is Home? | No | Only one type should be "home" |
| **Layout Type** | **Yes** | Choose "Classic" (simplest) |
| **Product Card** | **Yes** | Choose "Helium" |
| **Banners** | **Yes (at least 1)** | Add a banner image + title + description |

> **Tip:** For Layout Type, start with **"Classic"** — it works well for all departments. For Product Card, **"Helium"** is clean and simple.

### After creating a Type:

- The Type appears in the navigation dropdown on the website
- Customers can click "Gaming" to see all gaming products
- You can now create Categories under this Type (next step)

---

## 7. Creating Sub-Categories

**Path:** Sidebar → Product Management → Categories → **"Add Category"** button

**URL:** `https://admin.switchgod.com.np/categories/create`

### What to fill:

| Field | Required? | Example |
|---|---|---|
| Image | No | Upload a small icon |
| **Name** | **Yes** | "PlayStation" |
| Slug | Auto | "playstation" |
| Details | No | "PlayStation consoles and accessories" |
| Icon | No | Pick from list |
| **Type** | **Yes** | Select "Gaming" (the Type you created) |
| Parent Category | No | Leave blank for top-level category |

### Sub-categories:

To make a sub-category (e.g., "PS5 Games" under "PlayStation"):
- Create "PlayStation" first
- Then create another Category
- Set Parent Category to "PlayStation"

### Hierarchy example:

```
Gaming (Type)
├── PlayStation (Category)
│   ├── PS5 Consoles (Sub-category)
│   ├── PS5 Games (Sub-category)
│   └── Accessories (Sub-category)
├── Xbox (Category)
│   ├── Xbox Series X (Sub-category)
│   └── Xbox Games (Sub-category)
└── PC Gaming (Category)
    ├── Graphics Cards (Sub-category)
    └── Gaming Mice (Sub-category)
```

---

## 8. Adding Products

**Path:** Sidebar → Product Management → All Products → **"Add Product"** button

**URL:** `https://admin.switchgod.com.np/products/create`

### Step-by-step:

#### Section 1: Images & Video

| Field | Required? | Notes |
|---|---|---|
| Featured Image | Recommended | Main product photo |
| Gallery Images | No | Additional photos |
| Video Embed URL | No | YouTube link for product video |

#### Section 2: Organization

| Field | Required? | Notes |
|---|---|---|
| **Type (Group)** | **Yes** | Select your Type (e.g., "Gaming") |
| Category | No | Select a sub-category |
| Author | No | Skip unless it's a book/music |
| Manufacturer | No | Select if available |
| Tags | No | Search terms customers might use |

#### Section 3: Product Info

| Field | Required? | Notes |
|---|---|---|
| **Name** | **Yes** | "Sony WH-1000XM5 Wireless Headphones" |
| Slug | Auto | sony-wh-1000xm5-wireless-headphones |
| **Unit** | **Yes** | "1 pc" or "1 kg" or "1 box" |
| Description | No | Full product description (WYSIWYG editor) |
| **Status** | **Yes** | Choose **"Published"** to show on website |

> **Important:** If the product is not Published, customers won't see it. "Draft" = hidden, "Under Review" = waiting for approval.

#### Section 4: Product Type

Choose one:

- **Simple Product** (most common) — One price, one SKU
- **Variable Product** — Multiple sizes/colors (e.g., S/M/L each with own price)

Pick **Simple Product** for now.

#### Section 5: Simple Product Details

| Field | Required? | Notes |
|---|---|---|
| **Price** | **Yes** | Regular selling price (e.g., 45000) |
| Sale Price | No | Discount price (must be less than Price) |
| **Quantity** | **Yes** | How many in stock |
| **SKU** | **Yes** | Your internal product code (e.g., SONY-WH1000-001) |
| Width / Height / Length | No | Package dimensions |
| Is Digital? | No | Check if downloadable |
| Is External? | No | Check if product is on another site |

#### Section 6: Shop (Department)

At the very bottom, you need to assign the product to a shop. Look for the **"Shop"** field and select your department (e.g., "Gaming Shop").

### After saving:

- If status = **Published** and the product Type + Shop are set correctly, it will appear on the website within ~2 minutes
- You can always edit the product later

---

## 9. Managing Prices / Sale Prices

### Setting a regular price

Enter the price in the **"Price"** field. This is the normal selling price. Currency is NPR (Nepalese Rupee), already set by admin.

### Setting a sale/discount price

1. Enter a lower amount in **"Sale Price"**
2. It must be **less than** the regular Price
3. The website will show both prices with the original crossed out

Example:
```
Price: 50,000
Sale Price: 45,000
```

The website shows: ~~Rs. 50,000~~ **Rs. 45,000**

### Editing prices later

1. Go to **Product Management → All Products**
2. Find the product (search by name)
3. Click the **pencil/edit** icon
4. Change the Price or Sale Price
5. Click **Save**

---

## 10. Managing Orders

**Path:** Sidebar → Order Management → Orders

**URL:** `https://admin.switchgod.com.np/orders`

### What you see

A list of all customer orders showing:

| Column | Meaning |
|---|---|
| Tracking Number | Unique order ID |
| Customer | Who ordered |
| Amount | Total paid |
| Status | Processing / Shipped / Completed / Cancelled |
| Payment Status | Paid / Pending / Failed |
| Date | When ordered |

### Viewing an order

Click any order to see:

- **Order Timeline** — Status changes over time
- **Products ordered** — What was bought
- **Customer info** — Name, email, phone
- **Shipping address** — Where to deliver
- **Billing address** — Invoice address

### Changing order status

1. Open the order details
2. Click the status dropdown
3. Choose new status:

| Status | When to use |
|---|---|
| Order Processing | New order received |
| Order Confirmed | Verified and accepted |
| Order Shipped | Sent to customer |
| Order Delivered | Customer received it |
| Order Completed | Fully done |
| Order Cancelled | Customer cancelled / cannot fulfill |
| Order Refunded | Money returned to customer |

---

## 11. Frequently Asked Tasks

### "How do I change the currency?"

Only admin can do this:
1. Go to **Settings → General Settings**
2. Find **Currency** option
3. Change to NPR (Nepalese Rupee)
4. Save

### "A product I added isn't showing on the website"

Check these:

1. **Status** — Is it set to "Published"? Go to All Products → check the status column
2. **Type** — Does the product have a Type assigned?
3. **Shop** — Is the correct department/shop selected?
4. **Wait 2 minutes** — The website caches pages for 2 minutes before updating
5. **Hard refresh** — Press Ctrl+Shift+R in your browser

### "How do I hide a product temporarily?"

1. Go to **All Products**
2. Find the product
3. Edit it
4. Change **Status** from "Published" to **"Draft"**
5. Save → Product disappears from website

### "How do I delete a product?"

1. Go to **All Products**
2. Find the product
3. Click the trash/delete icon
4. Confirm deletion

### "How do I see low stock products?"

1. Go to **Product Management → Out of Stock / Low Stock**
2. Shows all products with low or zero stock

### "I need to add images. What size?"

- **Product featured image:** Any size, but square works best (e.g., 800×800px)
- **Category image:** Small icon, ~100×100px
- **Shop logo:** ~138×34px
- **Shop cover:** 1170×435px
- **Type banner:** 1920×400px

### "How do I add my staff so they can also manage products?"

Contact your admin. They can create staff accounts.

---

## 12. Quick Reference

### Admin URLs

| Page | URL |
|---|---|
| Login | `/login` |
| All Products | `/products` |
| Add Product | `/products/create` |
| All Categories | `/categories` |
| Add Category | `/categories/create` |
| Groups (Types) | `/groups` |
| All Shops | `/shops` |
| Add Shop | `/shops/create` |
| Inactive Shops | `/new-shops` |
| Orders | `/orders` |
| Settings | `/settings` |

### Workflow checklist (new product)

- [ ] 1. Type exists? If not, create one (Groups → Add Group)
- [ ] 2. Category exists? If not, create one (Categories → Add Category)
- [ ] 3. Shop exists and is approved? If not, create + approve
- [ ] 4. Add product with: Name, Price, Quantity, SKU, Type, Shop
- [ ] 5. Set Status = "Published"
- [ ] 6. Wait 2 minutes
- [ ] 7. Check website at switchgod.com.np

### Key rules

- **Published** = visible. **Draft** = hidden.
- **Sale Price** must be lower than **Price**.
- Each product needs a **Type** and a **Shop**.
- New shops need **admin approval** before appearing.
- Changes take **~2 minutes** to appear on the website.

---

*Last updated: July 17, 2026*
