package com.moneywise.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.moneywise.data.local.entity.BudgetEntity
import com.moneywise.data.local.entity.TransactionEntity
import com.moneywise.data.model.Category
import com.moneywise.data.model.TransactionType
import com.moneywise.data.repository.FinanceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class CategorySpend(
    val category: Category,
    val totalAmount: Double,
    val percentage: Float
)

data class BudgetProgress(
    val category: Category,
    val spent: Double,
    val limit: Double,
    val percentage: Float,
    val isOverBudget: Boolean
)

data class FinanceUiState(
    val totalBalance: Double = 0.0,
    val monthlyIncome: Double = 0.0,
    val monthlyExpenses: Double = 0.0,
    val netSavings: Double = 0.0,
    val savingsRate: Double = 0.0,
    val isBalanceVisible: Boolean = true,
    val categorySpending: List<CategorySpend> = emptyList(),
    val budgetProgressList: List<BudgetProgress> = emptyList(),
    val recentTransactions: List<TransactionEntity> = emptyList(),
    val allTransactions: List<TransactionEntity> = emptyList(),
    val hasDemoData: Boolean = false,
    val selectedTab: TransactionType? = null // null means ALL
)

class FinanceViewModel(
    private val repository: FinanceRepository
) : ViewModel() {

    private val _isBalanceVisible = MutableStateFlow(true)
    private val _selectedTransactionTab = MutableStateFlow<TransactionType?>(null)

    val uiState: StateFlow<FinanceUiState> = combine(
        repository.allTransactions,
        repository.allBudgets,
        _isBalanceVisible,
        _selectedTransactionTab
    ) { transactions, budgets, isVisible, selectedTab ->
        // Calculate Totals
        val income = transactions
            .filter { it.type == TransactionType.INCOME }
            .sumOf { it.amount }

        val expenses = transactions
            .filter { it.type == TransactionType.EXPENSE }
            .sumOf { it.amount }

        val netSavings = income - expenses
        val savingsRate = if (income > 0) ((netSavings / income) * 100.0).coerceAtLeast(0.0) else 0.0

        // Calculate Category Spending Distribution
        val expenseTx = transactions.filter { it.type == TransactionType.EXPENSE }
        val categoryTotals = expenseTx.groupBy { it.category }
            .mapValues { entry -> entry.value.sumOf { it.amount } }

        val totalExpensesSafe = if (expenses > 0) expenses else 1.0
        val categorySpending = categoryTotals.map { (cat, amount) ->
            CategorySpend(
                category = cat,
                totalAmount = amount,
                percentage = ((amount / totalExpensesSafe) * 100).toFloat()
            )
        }.sortedByDescending { it.totalAmount }

        // Calculate Budget Progress
        val budgetProgressList = budgets.map { budget ->
            val spent = categoryTotals[budget.category] ?: 0.0
            val pct = ((spent / budget.monthlyLimit) * 100).toFloat()
            BudgetProgress(
                category = budget.category,
                spent = spent,
                limit = budget.monthlyLimit,
                percentage = pct,
                isOverBudget = spent > budget.monthlyLimit
            )
        }

        val hasDemo = transactions.any { it.isDemo }

        FinanceUiState(
            totalBalance = netSavings,
            monthlyIncome = income,
            monthlyExpenses = expenses,
            netSavings = netSavings,
            savingsRate = savingsRate,
            isBalanceVisible = isVisible,
            categorySpending = categorySpending,
            budgetProgressList = budgetProgressList,
            recentTransactions = transactions.take(5),
            allTransactions = transactions,
            hasDemoData = hasDemo,
            selectedTab = selectedTab
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = FinanceUiState()
    )

    init {
        // In Stage 1, load initial demonstration dataset if empty for CSE showcase
        viewModelScope.launch {
            repository.allTransactions.collect { currentList ->
                if (currentList.isEmpty()) {
                    repository.seedDemonstrationData()
                }
            }
        }
    }

    fun toggleBalanceVisibility() {
        _isBalanceVisible.value = !_isBalanceVisible.value
    }

    fun setTransactionTabFilter(tab: TransactionType?) {
        _selectedTransactionTab.value = tab
    }

    fun addTransaction(
        title: String,
        amount: Double,
        type: TransactionType,
        category: Category,
        notes: String = ""
    ) {
        viewModelScope.launch {
            val entity = TransactionEntity(
                title = title,
                amount = amount,
                type = type,
                category = category,
                notes = notes,
                isDemo = false
            )
            repository.insertTransaction(entity)
        }
    }

    fun deleteTransaction(transaction: TransactionEntity) {
        viewModelScope.launch {
            repository.deleteTransaction(transaction)
        }
    }

    fun clearDemoData() {
        viewModelScope.launch {
            repository.clearDemoTransactions()
        }
    }

    fun restoreDemoData() {
        viewModelScope.launch {
            repository.seedDemonstrationData()
        }
    }
}

class FinanceViewModelFactory(
    private val repository: FinanceRepository
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FinanceViewModel::class.java)) {
            return FinanceViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
