package com.moneywise.data.repository

import com.moneywise.data.local.dao.BudgetDao
import com.moneywise.data.local.dao.TransactionDao
import com.moneywise.data.local.entity.BudgetEntity
import com.moneywise.data.local.entity.TransactionEntity
import com.moneywise.data.model.Category
import com.moneywise.data.model.TransactionType
import kotlinx.coroutines.flow.Flow

class FinanceRepository(
    private val transactionDao: TransactionDao,
    private val budgetDao: BudgetDao
) {
    val allTransactions: Flow<List<TransactionEntity>> = transactionDao.getAllTransactions()
    val allBudgets: Flow<List<BudgetEntity>> = budgetDao.getAllBudgets()

    fun getTransactionsByType(type: TransactionType): Flow<List<TransactionEntity>> {
        return transactionDao.getTransactionsByType(type)
    }

    fun getRecentTransactions(limit: Int = 5): Flow<List<TransactionEntity>> {
        return transactionDao.getRecentTransactions(limit)
    }

    suspend fun insertTransaction(transaction: TransactionEntity): Long {
        return transactionDao.insertTransaction(transaction)
    }

    suspend fun deleteTransaction(transaction: TransactionEntity) {
        transactionDao.deleteTransaction(transaction)
    }

    suspend fun upsertBudget(budget: BudgetEntity) {
        budgetDao.upsertBudget(budget)
    }

    suspend fun clearDemoTransactions() {
        transactionDao.clearDemoTransactions()
    }

    /**
     * Seeds initial demonstration data for academic CSE evaluation.
     * Clearly flagged with isDemo = true.
     */
    suspend fun seedDemonstrationData() {
        val now = System.currentTimeMillis()
        val dayMillis = 86_400_000L

        val demoTransactions = listOf(
            TransactionEntity(
                title = "Tech Corp Monthly Salary",
                amount = 4500.00,
                type = TransactionType.INCOME,
                category = Category.SALARY,
                timestamp = now - (dayMillis * 2),
                notes = "Direct deposit (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "App Freelance Contract",
                amount = 900.00,
                type = TransactionType.INCOME,
                category = Category.FREELANCE,
                timestamp = now - (dayMillis * 5),
                notes = "Milestone 1 payout (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Apartment Rent & Maintenance",
                amount = 1200.00,
                type = TransactionType.EXPENSE,
                category = Category.HOUSING,
                timestamp = now - (dayMillis * 1),
                notes = "Monthly lease transfer (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Whole Foods Supermarket",
                amount = 184.50,
                type = TransactionType.EXPENSE,
                category = Category.GROCERIES,
                timestamp = now - (dayMillis * 3),
                notes = "Weekly groceries (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Bistro Dinner & Drinks",
                amount = 68.20,
                type = TransactionType.EXPENSE,
                category = Category.FOOD_DINING,
                timestamp = now - (dayMillis * 4),
                notes = "Weekend social dinner (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Metro Transit Pass & Uber",
                amount = 95.00,
                type = TransactionType.EXPENSE,
                category = Category.TRANSPORTATION,
                timestamp = now - (dayMillis * 6),
                notes = "Monthly transit reload (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "High-speed Internet & Power",
                amount = 135.50,
                type = TransactionType.EXPENSE,
                category = Category.UTILITIES,
                timestamp = now - (dayMillis * 8),
                notes = "Broadband & electric bill (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Cloud Course Certification",
                amount = 120.00,
                type = TransactionType.EXPENSE,
                category = Category.EDUCATION,
                timestamp = now - (dayMillis * 10),
                notes = "CSE professional certification (DEMO)",
                isDemo = true
            )
        )

        val demoBudgets = listOf(
            BudgetEntity(category = Category.HOUSING, monthlyLimit = 1300.00, alertThresholdPercent = 85),
            BudgetEntity(category = Category.FOOD_DINING, monthlyLimit = 350.00, alertThresholdPercent = 80),
            BudgetEntity(category = Category.GROCERIES, monthlyLimit = 400.00, alertThresholdPercent = 80),
            BudgetEntity(category = Category.TRANSPORTATION, monthlyLimit = 200.00, alertThresholdPercent = 75),
            BudgetEntity(category = Category.UTILITIES, monthlyLimit = 180.00, alertThresholdPercent = 85),
            BudgetEntity(category = Category.ENTERTAINMENT, monthlyLimit = 150.00, alertThresholdPercent = 75)
        )

        transactionDao.insertAll(demoTransactions)
        budgetDao.insertAll(demoBudgets)
    }
}
