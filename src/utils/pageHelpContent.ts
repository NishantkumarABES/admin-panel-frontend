import type { HelpContent } from "../components/common/HelpModal";
export const pageHelpContent: Record<string, HelpContent> = {
    "/": {
        name: "Dashboard",
        description: "The Dashboard provides a comprehensive overview of your platform's activity and key performance metrics. Monitor doctors, patients, topics, and products at a glance.",
        features: [
            "View total counts of doctors, patients, topics, and products",
            "Track growth percentages compared to last month",
            "See pending actions requiring your attention",
            "Monitor recent platform activity",
            "Access detailed analytics with charts and visualizations"
        ],
        actions: [
            "Click 'Review' on pending actions to address them immediately",
            "Toggle 'Show Analytics' for detailed charts and trends",
            "Navigate to specific sections using the sidebar"
        ],
        tips: [
            "Check pending actions regularly to keep the platform updated",
            "Use the analytics section to identify growth trends"
        ]
    },
    "/doctors": {
        name: "Doctors",
        description: "Manage all doctor profiles registered on the platform. View, add, edit, and manage doctor information including specializations, contact details, and account status.",
        features: [
            "View statistics: total doctors, active and inactive counts",
            "Search doctors by name, email, phone, or license number",
            "Filter by specialty using the searchable dropdown",
            "Filter by account status (active/inactive)",
            "Sort table columns by clicking column headers",
            "Toggle to show only admin-created accounts"
        ],
        actions: [
            "Click 'Add Doctor' to create a new doctor profile",
            "Click the eye icon to view detailed doctor information",
            "Click the edit icon to modify doctor details",
            "Click the delete icon to remove a doctor profile"
        ],
        tips: [
            "Use the specialty filter to quickly find doctors in specific fields",
            "Admin-created accounts receive a system-generated password",
            "Click column headers to sort the table"
        ]
    },
    "/patients": {
        name: "Patients",
        description: "View and manage patient records on the platform. Access patient profiles, contact information, and account status.",
        features: [
            "View statistics: total patients, active and inactive counts",
            "Search patients by name, email, or phone number",
            "Filter patients by account status",
            "Sort table columns by clicking headers",
            "View detailed patient profiles"
        ],
        actions: [
            "Click the eye icon to view patient details",
            "Use search to quickly find specific patients",
            "Apply status filters to manage patient lists"
        ],
        tips: [
            "Use the search bar for quick patient lookup",
            "Patients are registered through the mobile app"
        ]
    },
    "/products": {
        name: "Products",
        description: "Manage your product catalog and coupon codes. Add products, set pricing, manage inventory levels, and create promotional coupons for customers.",
        features: [
            "View product statistics: total, in-stock, and out-of-stock counts",
            "Search products by name, brand, or description",
            "Filter by category with searchable dropdown",
            "Filter by stock status (in-stock/out-of-stock)",
            "Manage coupon codes with different discount types",
            "Track coupon usage and validity periods"
        ],
        actions: [
            "Click 'Add Product' to add new products to your catalog",
            "Click 'Create Coupon' to create promotional discount codes",
            "Edit products to update pricing, inventory, or details",
            "Toggle coupon status to enable/disable discounts"
        ],
        tips: [
            "Keep inventory levels updated to avoid overselling",
            "Use coupons strategically during promotional periods",
            "Out-of-stock items appear in pending actions on dashboard"
        ]
    },
    "/orders": {
        name: "Orders",
        description: "Track and manage all product orders. Monitor order status, process payments, update shipping information, and handle customer orders efficiently.",
        features: [
            "View order analytics: today's orders, pending payments, processing, delivered, and cancelled orders",
            "Search orders by order ID or customer name",
            "Filter orders by status (pending, paid, processing, shipped, delivered, cancelled, refunded)",
            "Filter by date range to view orders within specific periods",
            "View detailed order information including items and shipping address"
        ],
        actions: [
            "Click 'Add Order' to manually create a new order",
            "Click the eye icon to view complete order details",
            "Click 'Update Status' to change order status",
            "Use 'Clear Filters' to reset all applied filters"
        ],
        tips: [
            "Monitor pending payments to follow up with customers",
            "Use date filters to generate period-specific reports",
            "Update order status promptly to keep customers informed"
        ]
    },
    "/topics": {
        name: "Topics",
        description: "Create and manage educational content topics for doctors and patients. Publish informative articles, videos, and resources on various medical subjects.",
        features: [
            "View topic statistics: total, published, and unpublished counts",
            "Search topics by title or description",
            "Filter topics by publish status",
            "Manage video transcription for topic content",
            "Control topic visibility with publish/unpublish toggles"
        ],
        actions: [
            "Click 'Add Topic' to create new educational content",
            "Click the eye icon to view topic details and transcriptions",
            "Click the edit icon to modify topic content",
            "Use publish/unpublish to control topic visibility",
            "Start transcription for video topics"
        ],
        tips: [
            "Unpublished topics appear in dashboard pending actions",
            "Use video transcription to make content more accessible",
            "Keep topics relevant and up-to-date for better engagement"
        ]
    },
    "/events": {
        name: "Events",
        description: "Schedule and manage medical events, conferences, webinars, and workshops. Target events to specific medical specializations and track attendance.",
        features: [
            "View event statistics: total, upcoming, ongoing, and completed events",
            "Search events by title, description, or specialization",
            "Filter by event type (conference, webinar, workshop, etc.)",
            "Filter by event status (upcoming, ongoing, completed, cancelled)",
            "Set event dates, registration limits, and specialization targeting"
        ],
        actions: [
            "Click 'Add Event' to create a new event",
            "Click the eye icon to view event details",
            "Click the edit icon to modify event information",
            "Manage event registration and attendance"
        ],
        tips: [
            "Schedule events well in advance for better participation",
            "Target events to specific specializations for relevance",
            "Track completed events for reporting purposes"
        ]
    },
    "/advertisements": {
        name: "Advertisements",
        description: "Create and manage promotional advertisements displayed to users. Control ad visibility, target specific medical specialties, and track ad performance.",
        features: [
            "View ad statistics: total, enabled, and disabled ads",
            "Search advertisements by title or URL",
            "Filter by ad status (enabled/disabled)",
            "Target ads to specific medical specializations",
            "Upload custom ad images and set destination URLs"
        ],
        actions: [
            "Click 'Add Advertisement' to create a new ad",
            "Click the edit icon to modify ad settings",
            "Enable/disable ads to control their visibility"
        ],
        tips: [
            "Target ads to relevant specialties for better engagement",
            "Use compelling images and clear call-to-actions",
            "Unpublished ads appear in dashboard pending actions"
        ]
    },
    "/IDI": {
        name: "Indian Drug Index (IDI)",
        description: "Manage the Indian Drug Index database. Add, edit, and organize drug information including generic names, brand names, dosages, therapeutic categories, and clinical information.",
        features: [
            "View drug statistics: total, published, and draft entries",
            "Search drugs by name, class, or brand",
            "Filter by drug class with searchable dropdown",
            "Filter by therapeutic category",
            "Filter by publication status (published/draft)",
            "Manage comprehensive drug information"
        ],
        actions: [
            "Click 'Add Drug' to add new drug entries",
            "Click the eye icon to view complete drug information",
            "Click the edit icon to update drug details",
            "Delete outdated or incorrect drug entries"
        ],
        tips: [
            "Keep drug information accurate and up-to-date",
            "Use draft status for entries under review",
            "Organize drugs by therapeutic categories for easy lookup"
        ]
    },
    "/advisory": {
        name: "Advisory Panel",
        description: "Manage your advisory panel members. Add medical experts, specialists, and advisors who provide guidance and expertise for the platform.",
        features: [
            "View member statistics: total, accepted, and pending invitations",
            "Search members by name, email, or specialization",
            "Filter by member status (active/inactive)",
            "Add existing doctors to the advisory panel",
            "Create new advisory member profiles"
        ],
        actions: [
            "Click 'Add Member' to invite new advisory members",
            "Click the eye icon to view member details",
            "Click the edit icon to update member information",
            "Remove members from the advisory panel if needed"
        ],
        tips: [
            "Invite specialists from diverse medical fields",
            "Keep advisory panel updated with active contributors",
            "Add doctors directly from the registered doctors list"
        ]
    },
    "/settings": {
        name: "Settings",
        description: "Configure application-wide settings and legal documents. Manage privacy policy, terms & conditions, contact information, about us, and cookie policy content.",
        features: [
            "Edit Privacy Policy content",
            "Update Terms & Conditions",
            "Manage Contact Us information",
            "Edit About Us page content",
            "Configure Cookie Policy"
        ],
        actions: [
            "Click each tab to edit the corresponding content",
            "Save changes to update platform-wide documents",
            "Add contact information for user support"
        ],
        tips: [
            "Keep legal documents up-to-date with current regulations",
            "Ensure contact information is accurate for user queries",
            "Use clear, professional language in all content"
        ]
    },
    "/profile": {
        name: "Admin Profile",
        description: "View and manage your admin account settings. Update your password, view your account information, and manage your session.",
        features: [
            "View your profile information (name, email, role)",
            "Change your account password",
            "Password strength validation",
            "Secure session management"
        ],
        actions: [
            "Click 'Change Password' to update your password",
            "Click 'Logout' to end your session",
            "View your current role and account status"
        ],
        tips: [
            "Use a strong password with letters, numbers, and special characters",
            "Change your password regularly for security",
            "Log out when using shared computers"
        ]
    }
};