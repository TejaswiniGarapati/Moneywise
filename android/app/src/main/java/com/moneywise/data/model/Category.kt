package com.moneywise.data.model

enum class Category(
    val displayName: String,
    val iconName: String,
    val colorHex: Long
) {
    SALARY("Salary & Wages", "Work", 0xFF10B981),
    FREELANCE("Freelance & Consulting", "Laptop", 0xFF06B6D4),
    INVESTMENT("Investment Returns", "TrendingUp", 0xFF8B5CF6),
    OTHER_INCOME("Other Income", "AttachMoney", 0xFF14B8A6),

    HOUSING("Housing & Rent", "Home", 0xFF6366F1),
    FOOD_DINING("Food & Dining", "Restaurant", 0xFFF59E0B),
    GROCERIES("Groceries", "ShoppingCart", 0xFF84CC16),
    TRANSPORTATION("Transportation", "DirectionsCar", 0xFF3B82F6),
    UTILITIES("Utilities & Bills", "Bolt", 0xFFEC4899),
    ENTERTAINMENT("Entertainment", "Movie", 0xFFA855F7),
    HEALTHCARE("Healthcare", "LocalHospital", 0xFFEF4444),
    SHOPPING("Shopping", "ShoppingBag", 0xFFF97316),
    EDUCATION("Education", "School", 0xFF0EA5E9),
    OTHER_EXPENSE("Other Expense", "MoreHoriz", 0xFF64748B)
}
