

\# Project Briefing: Custom E-commerce Printing Platform (Based on Current Requirements)

**\*\*\\*\*\\\**Last Updated:\\*\*\\\*\*\* May 30, 2025***

***\#\# 1\\. Introduction & Vision***

***\*\*\\\*\\\*Project Core:\\\*\\\*\*\* To develop a bespoke e-commerce platform specifically designed for selling highly configurable printing products online. The platform will operate on a vendor-broker model, where the business (uvcoatedclubflyers.com) acts as the primary printer/interface to the customer, while actual print production is outsourced to various external vendors.***

***\*\*\\\*\\\*Vision (Integrating Advanced Capabilities):\\\*\\\*\*\* The immediate goal is a robust e-commerce printing site with advanced product configuration, dynamic pricing, comprehensive order management, strong SEO, and PWA capabilities. The longer-term vision, guided by the user-provided "Custom CMS E-commerce & Marketing Automation Platform PRD & MVP Blueprint", is to integrate a powerful suite of features including sophisticated sales funnel management, optimized checkout experiences, CRM, and targeted marketing automation, all managed from a unified admin dashboard and deeply integrated with \\\`n8n.io\\\` for extensibility and automation.***

***\*\*\\\*\\\*Purpose of this Briefing:\\\*\\\*\*\* To summarize the key requirements defined to date for the core e-commerce printing platform.***

***\#\# 2\\. Target Audience / Users***

***\* \*\*\\\*\\\*End Customers:\\\*\\\*\*\* Individuals and businesses seeking custom-printed materials.***  
***\* \*\*\\\*\\\*Brokers:\\\*\\\*\*\* Resellers or trade clients who receive specialized pricing.***  
***\* \*\*\\\*\\\*Administrators:\\\*\\\*\*\* Site owners and staff responsible for managing products, options, pricing, orders, vendors, brokers, content, SEO, system settings, and (eventually) the marketing automation suite.***

***\#\# 3\\. Key Features & Scope (MVP \- Based on Defined Requirements)***

***\#\#\# 3.1. Core Product Configuration***

***\* \*\*\\\*\\\*Product Attributes:\\\*\\\*\*\* Customers can configure products based on:***  
    ***\* \*\*\\\*\\\*Paper Stocks:\\\*\\\*\*\* Defined by Name, Base Price/sq inch, Weight/sq inch, 2nd Side Markup %, Compatible Coatings, Default Coating. Admins have full CRUD+Duplicate capabilities. Initial defaults to be pre-loaded.***  
    ***\* \*\*\\\*\\\*Print Sizes:\\\*\\\*\*\* Global list of standard sizes (Name, Width, Height, Area) and a "Custom..." option for user-defined dimensions (with min/max limits). Products have curated lists of available sizes and a default size. Admins have CRUD for global sizes. Special frontend UI for products with "Custom Size Only."***  
    ***\* \*\*\\\*\\\*Coatings:\\\*\\\*\*\* Global list of options (e.g., "High Gloss UV," "No Coating") with Name, Description, Tooltip. Free to customer. Associated with Paper Stocks.***  
    ***\* \*\*\\\*\\\*Sides:\\\*\\\*\*\* Customer selection (e.g., "Single Sided," "Double Sided (4/4)"). Cost implication via Paper Stock's markup rule.***  
    ***\* \*\*\\\*\\\*Quantity:\\\*\\\*\*\* Global standard tiers and a "Custom..." option (min 5,000, multiples of 5,000). Products have curated lists and a default quantity.***  
    ***\* \*\*\\\*\\\*Turnaround Time:\\\*\\\*\*\* Global options (Name, Markup %, Base Timeframe Description, Tooltip). Products have curated lists and a default. Base timeframe can be modified by add-ons. Disclaimer: "Turnaround estimates do not include shipping."***  
***\* \*\*\\\*\\\*Tooltips:\\\*\\\*\*\* All customer-facing options have admin-editable, click-to-show/hide tooltips. Specific texts captured for Sides, Paper, Coating, Print Size, Quantity, Turnaround Time.***

***\#\#\# 3.2. Add-on Services***

***\* \*\*\\\*\\\*Admin Capability:\\\*\\\*\*\* Admins can create entirely new Add-on Services using a defined template (Name, Tooltip, Pricing Method, Price Values, Dependencies, Sub-Options, Admin-settable "Additional Turnaround Days," Active status, CRUD+Duplicate).***  
***\* \*\*\\\*\\\*General Rules:\\\*\\\*\*\* Product-level price overrides for add-ons. Admins can mark options as mandatory (double-click UI, red for admin). Admins set default selections explicitly.***  
***\* \*\*\\\*\\\*Defined Add-ons (Additional Turnaround Days for each are admin-settable):\\\*\\\*\*\****  
    ***\* \*\*\\\*\\\*Digital Proof:\\\*\\\*\*\* Checkbox; $5.00 Fixed Fee.***  
    ***\* \*\*\\\*\\\*Our Tagline:\\\*\\\*\*\* Checkbox; 5% discount off \\\`Base\\\_Paper\\\_Print\\\_Price\\\` (before Turnaround markup). Hidden for Brokers with assigned discount. No turnaround impact. Admin can exclude from products.***  
    ***\* \*\*\\\*\\\*Perforation:\\\*\\\*\*\* Checkbox; $20.00 Fixed Fee \\+ $0.01/piece. Sub-options for Number (Vertical/Horizontal) & Positions with tooltips.***  
    ***\* \*\*\\\*\\\*Score Only:\\\*\\\*\*\* Checkbox; $17.00 Fixed Fee \\+ ($0.01 \\\*\\\* Number of Scores)/piece. Sub-options: "How many scores" (drives variable price) & "Score Position," both with tooltips. Standalone.***  
    ***\* \*\*\\\*\\\*Folding:\\\*\\\*\*\* Checkbox; 3 Additional Turnaround Days. Min print size 5"x6". Dropdown of Fold Types (Half Fold, Tri Fold, etc. \- no individual tooltips/price/turnaround impact per type). Main tooltip provided.***  
        ***\* Text Paper: $0.17 Fixed Fee \\+ $0.01/piece (folding only). No optional basic score. If score desired, customer uses "Score Only" add-on.***  
        ***\* Card Stock: $0.34 Fixed Fee \\+ $0.02/piece (includes mandatory, non-configurable basic score; production infers scores from fold type).***  
    ***\* \*\*\\\*\\\*Design:\\\*\\\*\*\* Main "Design" option (checkbox/activator) with shared main tooltip. Leads to dropdown of services. Prices are global defaults, overridable per product. Design time is separate from print production.***  
        ***\* "Upload My Artwork": No Price. 0 Design Turnaround (leads to "Upload Files" section).***  
        ***\* "Standard Custom Design": One Side $90.00 / Two Sides $135.00 (customer makes secondary choice). Turnaround: 48-72 hours.***  
        ***\* "Rush Custom Design": One Side $160.00 / Two Sides $240.00 (customer makes secondary choice). Turnaround: 24-36 hours.***  
        ***\* "Design Changes \- Minor": $22.50. Turnaround: \\\~1 day.***  
        ***\* "Design Changes \- Major": $45.00. Turnaround: \\\~2 days.***  
    ***\* \*\*\\\*\\\*Exact Size:\\\*\\\*\*\* Checkbox; \\+12.5% markup on \\\`Adjusted\\\_Base\\\_Price\\\`. 0 Additional Turnaround Days.***  
    ***\* \*\*\\\*\\\*Banding:\\\*\\\*\*\* Checkbox; $0.75/bundle. Sub-options: "Banding Type" (Dropdown: Paper Bands, Rubber Bands \- no price difference), "Items/Bundle" (Number input, default 100).***  
    ***\* \*\*\\\*\\\*Shrink Wrapping:\\\*\\\*\*\* Checkbox; $0.30/bundle. Sub-option: "Items/Bundle" (Text input for number).***  
    ***\* \*\*\\\*\\\*QR Code:\\\*\\\*\*\* Checkbox; $5.00 Fixed Fee. Admin manually creates from customer's "Code Content" (Text input). No customer QR upload for this add-on. Tooltips revised accordingly.***  
    ***\* \*\*\\\*\\\*Postal Delivery (DDU):\\\*\\\*\*\* Checkbox; $30.00/box. Number of boxes via shipping logic. For EDDM-eligible products. Printer handles PO delivery.***  
    ***\* \*\*\\\*\\\*EDDM Process & Postage:\\\*\\\*\*\* Checkbox; $50.00 Fixed Fee \\+ $0.239/piece. Mandatory "Paper Banding" auto-selected & costed. Sub-options for Route Selection (Let Us Select vs. I Provide Routes with upload/text input/contact request).***  
    ***\* \*\*\\\*\\\*Hole Drilling:\\\*\\\*\*\* Checkbox; $20.00 Fixed Fee. Variable per-piece: Custom holes ("1"-"5") add \\\`(No. selected) \\\* $0.02/pc\\\`; any "Binder Punch" option adds flat \\\`$0.01/pc\\\`. Sub-options: "Number of Holes" (Dropdown), "Size of Holes" (Dropdown, no price impact), "Position of Holes" (Text input, no price impact). All sub-options have tooltips.***

***\#\#\# 3.3. Dynamic Pricing Engine***

***\* \*\*\\\*\\\*Formula (Calculates \\\`Calculated\*\\\_Product\\\_\*Subtotal\*\\\_Before\\\_\*Shipping\*\\\_Tax\\\` for dynamic display on product page):\\\*\\\*\*\****  
    ***\*\*\*1\\.  \\\`Base\\\_Paper\\\_Print\\\_Price \\= EffectiveQuantity \\\* EffectiveArea \\\* PaperStock\\\_BasePrice\\\_PerSqInch \\\* SidesFactor\\\`\*\*\****  
    ***\*\*\*2\\.  \\\`Adjusted\\\_Base\\\_Price \\= Base\\\_Paper\\\_Print\\\_Price\\\`\*\*\****  
        ***\*\*\*\\\* If Broker with discount: \\\`Adjusted\\\_Base\\\_Price \\= Base\\\_Paper\\\_Print\\\_Price \\\* (1 \- BrokerDiscountPercentage)\\\`\*\*\****  
        ***\*\*\*\\\* Else if "Our Tagline" selected & visible: \\\`Adjusted\\\_Base\\\_Price \\-= (Base\\\_Paper\\\_Print\\\_Price \\\* TaglineDiscountPercentage)\\\`\*\*\****  
    ***\*\*\*3\\.  \\\`Price\\\_After\\\_Base\\\_Percentage\\\_Modifiers \\= Adjusted\\\_Base\\\_Price\\\`\*\*\****  
        ***\*\*\*\\\* If "Exact Size" selected: \\\`Price\\\_After\\\_Base\\\_Percentage\\\_Modifiers \\+= (Adjusted\\\_Base\\\_Price \\\* ExactSizeMarkupPercentage)\\\`\*\*\****  
    ***\*\*\*4\\.  \\\`Price\\\_After\\\_Turnaround \\= Price\\\_After\\\_Base\\\_Percentage\\\_Modifiers \\\* (1 \\+ Selected\\\_Turnaround\\\_Markup\\\_Percentage)\\\`\*\*\****  
    ***\*\*\*5\\.  \\\`Calculated\\\_Product\\\_Subtotal\\\_Before\\\_Shipping\\\_Tax \\= Price\\\_After\\\_Turnaround\\\` \\+ Sum of costs from all selected discrete Add-on Services. (Brokers pay retail for discrete add-ons & turnaround).\*\*\****  
***\*\*\*\\\* Price updates dynamically on the product page as options are selected.\*\*\****

***\*\*\*\#\#\# 3.4. Cart & Checkout\*\*\****

***\*\*\*\\\* \\\*\\\*Cart Page:\\\*\\\* After configuring a single product, customer goes to a Cart Page. Cart page displays the single configured job, allows quantity updates for it, and removal. Shows subtotal and "Proceed to Checkout" button. (This replaces the "Dynamic Side Cart" concept for single-product orders but the user later reinstated multi-job orders so cart behavior is more traditional).\*\*\****  
***\*\*\*\\\* \\\*\\\*Multi-Job Orders:\\\*\\\* Customers CAN add multiple distinct configured "jobs" to their cart in a single session.\*\*\****  
***\*\*\*\\\* \\\*\\\*Dynamic Side Cart:\\\*\\\* Will be present to view multiple jobs, update quantities for each, or remove them.\*\*\****  
***\*\*\*\\\* \\\*\\\*Checkout Page (Post-Cart):\\\*\\\*\*\*\****  
    ***\*\*\*\\\* Layout: MVP preference (one-page vs. two-step) TBD.\*\*\****  
    ***\*\*\*\\\* Field Editor: Admin can show/hide/require standard checkout fields (list of fields TBD).\*\*\****  
    ***\*\*\*\\\* Payment Gateway: Integration with one primary gateway for MVP (specific gateway TBD, Stripe as example).\*\*\****  
    ***\*\*\*\\\* Order Bump: One per checkout, admin assigns pre-selected product.\*\*\****  
    ***\*\*\*\\\* Google Address Autocomplete.\*\*\****  
***\*\*\*\\\* \\\*\\\*Shipping at Checkout:\\\*\\\*\*\*\****  
    ***\*\*\*\\\* Calculated \\\*separately for each job\\\* in the cart.\*\*\****  
    ***\*\*\*\\\* Customer sees \\\*\\\*one summed total shipping charge.\\\*\\\*\*\*\****  
    ***\*\*\*\\\* Shipping options displayed are based on the product's (and its vendor's) allowed carriers.\*\*\****  
***\*\*\*\\\* \\\*\\\*Sales Tax:\\\*\\\* Calculated at checkout. Admin can turn state tax calculation on/off and configure rates (or use a service).\*\*\****

***\*\*\*\#\#\# 3.5. Broker System\*\*\****

***\*\*\*\\\* \\\*\\\*Activation & Management:\\\*\\\*\*\* On user's admin info page. Admin activates "Broker" status.\*\*\****  
***\*\*\*\\\* \\\*\\\*Discount Structure:\\\*\\\*\*\* Category-specific percentages off \\\`Base\\\_Paper\\\_Print\\\_Price\\\`.\*\*\****  
    ***\*\*\*\\\* System-Wide Defaults: Admin section "Broker Pricing per Category" sets default discount % per product category.\*\*\****  
    ***\*\*\*\\\* Individual Overrides: Admin can set custom discount % per category for specific brokers on their account page.\*\*\****  
    ***\*\*\*\\\* If no discount % found for a category for an active broker, they get 0% for that category.\*\*\****

***\*\*\*\#\#\# 3.6. Vendor Management\*\*\****

***\*\*\*\\\* \\\*\\\*Admin "Vendor's List":\\\*\\\* Stores Vendor Name, Incoming Email Address(es) (for \\\`n8n.io\\\`), Supported Shipping Carriers (FedEx, UPS, Southwest Cargo).\*\*\****  
***\*\*\*\\\* \\\*\\\*Product Assignment:\\\*\\\* Each product in the system is assigned to a Vendor. The product's available shipping options are filtered by its Vendor's supported carriers. Admin selects from these filtered options for the product.\*\*\****

***\*\*\*\#\#\# 3.7. Order Management System\*\*\****

***\*\*\*\\\* \\\*\\\*Defined Order Statuses:\\\*\\\* Confirmation, Pre-press: Reviewing Your Order, On Hold (with dynamic text reason from admin/\\\`n8n.io\\\`, link back to website for customer action, moves to Pre-press after fix), Production (files locked), Bindery, Shipped (detailed notifications with carrier-specific tracking & Southwest Cargo pickup info), Delivered (\\\`n8n.io\\\` automated), Cancelled/Refunded (combined final status).\*\*\****  
***\*\*\*\\\* \\\*\\\*Admin Dashboard:\\\*\\\* Color-coded statuses.\*\*\****  
***\*\*\*\\\* \\\*\\\*Notifications:\\\*\\\* Email & PWA for all status changes. Main app sends emails.\*\*\****  
***\*\*\*\\\* \\\*\\\*Google Review Request Email:\\\*\\\* Sent 3 days after "Delivered" status, using admin-set Google Review link.\*\*\****

***\*\*\*\#\#\# 3.8. File Upload System\*\*\****

***\*\*\*\\\* \\\*\\\*Mechanism:\\\*\\\*\*\* Browse, Drag & Drop, progress bar, thumbnails.\*\*\****  
***\*\*\*\\\* \\\*\\\*Accepted Types:\\\*\\\*\*\* Defined list (JPEG, PNG, PDF, etc.).\*\*\****  
***\*\*\*\\\* \\\*\\\*Limits:\\\*\\\*\*\* No limit on number of files; Max 30MB per file.\*\*\****  
***\*\*\*\\\* \\\*\\\*Handling:\\\*\\\*\*\* Oversized file error \\+ email instruction. Checkout without files allowed (triggers email). Verification at checkout. Customer can delete/replace files until "Production." Admin/\\\`n8n.io\\\` sets "On Hold" with "Pending Files" reason allowing re-upload via website. Admin notified of updated files.\*\*\****  
***\*\*\*\\\* \\\*\\\*File Retention Policy:\\\*\\\*\*\* 1 year from order, then deleted.\*\*\****  
***\*\*\*\\\* \\\*\\\*User Dashboard:\\\*\\\*\*\* Reorder/re-customize from past orders, view files.\*\*\****  
***\*\*\*\\\* \\\*\\\*Instructional Text:\\\*\\\*\*\* Visible in upload area: "Only upload your files, max 30 MB per file..."\*\*\****

***\*\*\*\#\#\# 3.9. SEO Features\*\*\****

***\*\*\*\\\* \\\*\\\*Overarching Principle:\\\*\\\*\*\* Follow current Google best practices.\*\*\****  
***\*\*\*\\\* \\\*\\\*Technical SEO Foundation:\\\*\\\*\*\* XML Sitemaps (auto-gen daily, specific content, image info embedded), HTML Sitemap, \\\`robots.txt\\\` (standard setup), SEO-Friendly URLs (defined structures, auto-slugs \\+ admin edit), HTTPS. Crawlability & Indexability best practices. Site Speed & Core Web Vitals.\*\*\****  
***\*\*\*\\\* \\\*\\\*On-Page SEO Content Management (Admin Controls):\\\*\\\*\*\* Meta Titles/Descriptions (fields, char counts, default gen \\+ override), Header Tags (H1 from title, H2-H6 in editors), Image Alt Text (dedicated field, default gen \\+ override), Internal Linking (breadcrumbs, hybrid related products, easy linking in editors).\*\*\****  
***\*\*\*\\\* \\\*\\\*Structured Data (Schema.org Markup):\\\*\\\*\*\* Product Schema (all key attributes defined), Organization Schema (fed from admin company profile), BreadcrumbList Schema, BlogPosting Schema, FAQPage Schema (on dedicated FAQ pages, only unique product-specific FAQs on product pages if any).\*\*\****  
***\*\*\*\\\* \\\*\\\*Product Syndication (Google Shopping Feed):\\\*\\\*\*\* Base variant strategy. SKU as \\\`id\\\`. XML format. Daily gen. Admin assigns GPC via category mapping (with product override & GPC browser). MPN (\\\`UVC-\\\`prefix \\+ descriptive). \\\`identifier\\\_exists: false\\\` for custom goods.\*\*\****  
***\*\*\*\\\* \\\*\\\*"AI Chat SEO Methods" & Advanced Considerations:\\\*\\\*\*\* Multi-persona AI (SEO Expert, Lead Gen Expert, Skilled Writer \\+ Summarizing Agent) via Gemini API (\\\`n8n.io\\\` orchestrated) to generate drafts for product descriptions, meta tags, product FAQs, blog posts, lead gen pages. Admin review/edit/publish. AI informed by GSC & Google Ads Keyword Planner API.\*\*\****

***\*\*\*\#\#\# 3.10. PWA Features (MVP)\*\*\****

***\*\*\*\\\* \*\*\\\*\\\*Core Requirement:\\\*\\\*\*\* Application will be a PWA.\*\*\****  
***\*\*\*\\\* \*\*\\\*\\\*Installability:\\\*\\\*\*\* "Add to Home Screen" capability.\*\*\****  
***\*\*\*\\\* \*\*\\\*\\\*Push Notifications:\\\*\\\*\*\* For order status changes and other relevant processes.\*\*\****  
***\*\*\*\\\* \*\*\\\*\\\*Performance:\\\*\\\*\*\* Leverages Site Speed & Core Web Vitals optimizations.\*\*\****  
***\*\*\*\\\* \*\*\\\*\\\*Offline Capabilities (MVP):\\\*\\\*\*\* Custom Branded Offline Page, App Shell Caching, Key Static Info Page Caching, Cached Order History for logged-in users.\*\*\****

***\*\*\*\#\#\# 3.11. Admin & System Features\*\*\****

***\*\*\*\\\* \\\*\\\*Admin Interface Principles:\\\*\\\*\*\* CRUD \\+ Duplicate for global entities. Mandatory options via double-click (red). Explicit "Mark as Default."\*\*\****  
***\*\*\*\\\* \\\*\\\*Admin Section for Core Company Branding:\\\*\\\*\*\* For Name, Address, Email, Phone, Logo, Social Links, Google Review Link. Feeds Organization Schema, supports white-labeling.\*\*\****  
***\*\*\*\\\* \\\*\\\*Admin Analytics Dashboard:\\\*\\\*\*\* To display key metrics from Google Analytics & Ahrefs API (details TBD).\*\*\****  
***\*\*\*\\\* \\\*\\\*List of Static/Informational Pages:\\\*\\\*\*\* Privacy, Terms, Locations, Quote (purpose TBD), Contact, Resolution, Bleed, Specials, Design Guidelines, Design Gallery, Commercial Printing, Equipment.\*\*\****  
***\*\*\*\\\* \\\*\\\*Blog Functionality Required.\\\*\\\*\*\*\****

***\*\*\*\\---\*\*\****

***\*\*\*\#\#\# 4\\. Features for Future Detailed Discussion (Many from User's PRD)\*\*\****

***\*\*\*\\\* Full implementation of \\\*\\\*Funnel Management Module\\\*\\\* (visual builder, advanced A/B testing, broader analytics).\*\*\****  
***\*\*\*\\\* \\\*\\\*Advanced Checkout Features\\\*\\\* (beyond current MVP, e.g., multi-step conditional fields, more payment gateways, detailed cart recovery).\*\*\****  
***\*\*\*\\\* Full \\\*\\\*Marketing Automations & CRM Module\\\*\\\* (contact mgt, email marketing beyond basic broadcasts, visual workflow builder for automations, lead scoring).\*\*\****  
***\*\*\*\\\* Advanced \\\*\\\*Analytics & Reporting Dashboard\\\*\\\* (as per PRD).\*\*\****  
***\*\*\*\\\* Advanced \\\*\\\*CMS/Layout Customization Features\\\*\\\* (for homepage, product pages, etc.).\*\*\****  
***\*\*\*\\\* Detailed \\\*\\\*\\\`n8n.io\\\` Workflow\\\*\\\* specifications (for quotes, advanced support, etc.).\*\*\****  
***\*\*\*\\\* \\\*\\\*Built-in Chat Line\\\*\\\* full specification (platform, features, AI integration details).\*\*\****  
***\*\*\*\\\* Post-MVP \\\*\\\*PWA Features\\\*\\\* (e.g., background sync, advanced offline).\*\*\****  
***\*\*\*\\\* Full review of all \\\*\\\*Email Notification Content & Templates.\\\*\\\*\*\*\****  
***\*\*\*\\\* Detailed \\\*\\\*Shipping Cost Calculation Module.\\\*\\\*\*\*\****  
***\*\*\*\\\* \*\*\\\*\\\*Sales Tax Module\\\*\\\* detailed configuration.\*\*\****  
***\*\*\*\\\* \*\*\\\*\\\*White-Label Capability\\\*\\\* architectural design.\*\*\****

***\*\*\*\\---\*\*\****

***\*\*\*This summary should serve as a comprehensive snapshot of our progress and defined requirements.\*\*\****  
