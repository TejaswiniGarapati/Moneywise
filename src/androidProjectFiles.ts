export interface ProjectFile {
  path: string;
  filename: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'json';
  category: 'Configuration' | 'Data & Room' | 'MVVM & State' | 'UI & Compose' | 'Theme & Resources';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'settings.gradle.kts',
    filename: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'Configuration',
    description: 'Gradle plugin and dependency management definitions.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MoneyWise"
include(":app")`
  },
  {
    path: 'build.gradle.kts',
    filename: 'build.gradle.kts',
    language: 'kotlin',
    category: 'Configuration',
    description: 'Top-level root build file configuring Android & Kotlin plugins.',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}`
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'Configuration',
    description: 'Module build file: Jetpack Compose, Room SQLite, Coroutines, Material 3, and Gemini SDK.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.moneywise"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.moneywise"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    // AndroidX & Lifecycle
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.2")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.2")
    implementation("androidx.activity:activity-compose:1.9.0")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.2.1")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Room Database with SQLite
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // Google Gemini GenAI SDK for Kotlin
    implementation("com.google.ai.client.generativeai:generativeai:0.7.0")
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    category: 'Configuration',
    description: 'Application manifest registering MainActivity, permissions, and theme.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".MoneyWiseApp"
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="@string/app_name"
        android:roundIcon="@android:drawable/sym_def_app_icon"
        android:supportsRtl="true"
        android:theme="@style/Theme.MoneyWise">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.MoneyWise">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  },
  {
    path: 'app/src/main/java/com/moneywise/data/model/TransactionType.kt',
    filename: 'TransactionType.kt',
    language: 'kotlin',
    category: 'Data & Room',
    description: 'Enum defining INCOME and EXPENSE ledger classifications.',
    content: `package com.moneywise.data.model

enum class TransactionType {
    INCOME,
    EXPENSE
}`
  },
  {
    path: 'app/src/main/java/com/moneywise/data/model/Category.kt',
    filename: 'Category.kt',
    language: 'kotlin',
    category: 'Data & Room',
    description: 'Financial categories tailored for India with display labels and Material 3 color codes.',
    content: `package com.moneywise.data.model

enum class Category(
    val displayName: String,
    val iconName: String,
    val colorHex: Long
) {
    SALARY("Salary & Wages", "Work", 0xFF059669),
    FREELANCE("Freelance & Consulting", "Laptop", 0xFF0284C7),
    INVESTMENT("Mutual Funds & SIP", "TrendingUp", 0xFF7C3AED),
    OTHER_INCOME("Other Income", "AttachMoney", 0xFF10B981),

    HOUSING("Rent & Society Maintenance", "Home", 0xFF4F46E5),
    GROCERIES("Groceries & Kirana", "ShoppingCart", 0xFF65A30D),
    FOOD_DINING("Food & Dining (Swiggy/Zomato)", "Restaurant", 0xFFEA580C),
    TRANSPORTATION("Fuel, Auto & Metro", "DirectionsCar", 0xFF2563EB),
    UTILITIES("Electricity & Water Bills", "Bolt", 0xFFDB2777),
    TELECOM("Mobile & Broadband", "Wifi", 0xFF0891B2),
    HEALTHCARE("Healthcare & Pharmacy", "LocalHospital", 0xFFE11D48),
    SHOPPING("Shopping & E-Commerce", "ShoppingBag", 0xFFD97706),
    EDUCATION("Education & Tuition", "School", 0xFF0284C7),
    ENTERTAINMENT("Entertainment & OTT", "Movie", 0xFF9333EA),
    EMI_LOAN("EMI & Credit Card", "CreditCard", 0xFFDC2626),
    OTHER_EXPENSE("Other Expense", "MoreHoriz", 0xFF64748B)
}`
  },
  {
    path: 'app/src/main/java/com/moneywise/data/local/entity/TransactionEntity.kt',
    filename: 'TransactionEntity.kt',
    language: 'kotlin',
    category: 'Data & Room',
    description: 'Room @Entity mapping transactions table with primary key, timestamps, and demo flag.',
    content: `package com.moneywise.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.moneywise.data.model.Category
import com.moneywise.data.model.TransactionType

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val amount: Double,
    val type: TransactionType,
    val category: Category,
    val timestamp: Long = System.currentTimeMillis(),
    val paymentMode: String = "UPI",
    val notes: String = "",
    val isDemo: Boolean = false
)`
  },
  {
    path: 'app/src/main/java/com/moneywise/data/local/entity/BudgetEntity.kt',
    filename: 'BudgetEntity.kt',
    language: 'kotlin',
    category: 'Data & Room',
    description: 'Room @Entity for category spending caps and percentage alert thresholds.',
    content: `package com.moneywise.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.moneywise.data.model.Category

@Entity(tableName = "budgets")
data class BudgetEntity(
    @PrimaryKey
    val category: Category,
    val monthlyLimit: Double,
    val alertThresholdPercent: Int = 80 // Default alert when 80% consumed
)`
  },
  {
    path: 'app/src/main/java/com/moneywise/data/local/dao/TransactionDao.kt',
    filename: 'TransactionDao.kt',
    language: 'kotlin',
    category: 'Data & Room',
    description: 'Room Data Access Object with reactive Kotlin Coroutines Flow queries.',
    content: `package com.moneywise.data.local.dao

import androidx.room.*
import com.moneywise.data.local.entity.TransactionEntity
import com.moneywise.data.model.TransactionType
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE type = :type ORDER BY timestamp DESC")
    fun getTransactionsByType(type: TransactionType): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentTransactions(limit: Int = 6): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(transactions: List<TransactionEntity>)

    @Update
    suspend fun updateTransaction(transaction: TransactionEntity)

    @Delete
    suspend fun deleteTransaction(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE isDemo = 1")
    suspend fun clearDemoTransactions()

    @Query("DELETE FROM transactions")
    suspend fun clearAll()
}`
  },
  {
    path: 'app/src/main/java/com/moneywise/data/local/MoneyWiseDatabase.kt',
    filename: 'MoneyWiseDatabase.kt',
    language: 'kotlin',
    category: 'Data & Room',
    description: 'Thread-safe Singleton Room SQLite Database initialization.',
    content: `package com.moneywise.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.moneywise.data.local.dao.BudgetDao
import com.moneywise.data.local.dao.TransactionDao
import com.moneywise.data.local.entity.BudgetEntity
import com.moneywise.data.local.entity.TransactionEntity

@Database(
    entities = [TransactionEntity::class, BudgetEntity::class],
    version = 1,
    exportSchema = false
)
abstract class MoneyWiseDatabase : RoomDatabase() {

    abstract fun transactionDao(): TransactionDao
    abstract fun budgetDao(): BudgetDao

    companion object {
        @Volatile
        private var INSTANCE: MoneyWiseDatabase? = null

        fun getDatabase(context: Context): MoneyWiseDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MoneyWiseDatabase::class.java,
                    "moneywise_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/moneywise/data/repository/FinanceRepository.kt',
    filename: 'FinanceRepository.kt',
    language: 'kotlin',
    category: 'Data & Room',
    description: 'Repository managing Indian Rupee transactions, budgets, and demonstration data.',
    content: `package com.moneywise.data.repository

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

    fun getRecentTransactions(limit: Int = 6): Flow<List<TransactionEntity>> {
        return transactionDao.getRecentTransactions(limit)
    }

    suspend fun insertTransaction(transaction: TransactionEntity): Long {
        return transactionDao.insertTransaction(transaction)
    }

    suspend fun updateTransaction(transaction: TransactionEntity) {
        transactionDao.updateTransaction(transaction)
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
     * Seeds initial demonstration dataset in Indian Rupees (INR - ₹).
     */
    suspend fun seedDemonstrationData() {
        val now = System.currentTimeMillis()
        val dayMillis = 86_400_000L

        val demoTransactions = listOf(
            TransactionEntity(
                title = "Infosys Monthly Tech Salary",
                amount = 85000.00,
                type = TransactionType.INCOME,
                category = Category.SALARY,
                timestamp = now - (dayMillis * 1),
                paymentMode = "NET_BANKING",
                notes = "Direct corporate payroll credit (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Mobile App Consulting Freelance",
                amount = 24000.00,
                type = TransactionType.INCOME,
                category = Category.FREELANCE,
                timestamp = now - (dayMillis * 4),
                paymentMode = "UPI",
                notes = "Client milestone payout via UPI (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Apartment Rent & Society Maintenance",
                amount = 22000.00,
                type = TransactionType.EXPENSE,
                category = Category.HOUSING,
                timestamp = now - (dayMillis * 2),
                paymentMode = "NET_BANKING",
                notes = "Monthly flat rent transfer (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "DMart & Local Kirana Monthly Groceries",
                amount = 6850.00,
                type = TransactionType.EXPENSE,
                category = Category.GROCERIES,
                timestamp = now - (dayMillis * 3),
                paymentMode = "UPI",
                notes = "Provisions, vegetables & essentials (DEMO)",
                isDemo = true
            ),
            TransactionEntity(
                title = "Swiggy & Weekend Family Dining",
                amount = 2850.00,
                type = TransactionType.EXPENSE,
                category = Category.FOOD_DINING,
                timestamp = now - (dayMillis * 5),
                paymentMode = "UPI",
                notes = "Weekend dinner & online orders (DEMO)",
                isDemo = true
            )
        )

        val demoBudgets = listOf(
            BudgetEntity(category = Category.HOUSING, monthlyLimit = 25000.00, alertThresholdPercent = 85),
            BudgetEntity(category = Category.GROCERIES, monthlyLimit = 9000.00, alertThresholdPercent = 80),
            BudgetEntity(category = Category.FOOD_DINING, monthlyLimit = 5000.00, alertThresholdPercent = 80),
            BudgetEntity(category = Category.TRANSPORTATION, monthlyLimit = 4000.00, alertThresholdPercent = 75),
            BudgetEntity(category = Category.UTILITIES, monthlyLimit = 3500.00, alertThresholdPercent = 80)
        )

        transactionDao.insertAll(demoTransactions)
        budgetDao.insertAll(demoBudgets)
    }
}`
  },
  {
    path: 'app/src/main/java/com/moneywise/ui/viewmodel/FinanceViewModel.kt',
    filename: 'FinanceViewModel.kt',
    language: 'kotlin',
    category: 'MVVM & State',
    description: 'MVVM Architecture: reactive StateFlow with Indian Numbering calculations.',
    content: `package com.moneywise.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.moneywise.data.local.entity.BudgetEntity
import com.moneywise.data.local.entity.TransactionEntity
import com.moneywise.data.model.Category
import com.moneywise.data.model.TransactionType
import com.moneywise.data.repository.FinanceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

data class CategorySpend(val category: Category, val totalAmount: Double, val percentage: Float)
data class BudgetProgress(val category: Category, val spent: Double, val limit: Double, val percentage: Float, val isOverBudget: Boolean)

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
    val hasDemoData: Boolean = false
)

fun formatINR(amount: Double): String {
    val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
    return format.format(amount)
}

class FinanceViewModel(private val repository: FinanceRepository) : ViewModel() {
    private val _isBalanceVisible = MutableStateFlow(true)

    val uiState: StateFlow<FinanceUiState> = combine(
        repository.allTransactions,
        repository.allBudgets,
        _isBalanceVisible
    ) { transactions, budgets, isVisible ->
        val income = transactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
        val expenses = transactions.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
        val net = income - expenses
        val rate = if (income > 0) ((net / income) * 100.0).coerceAtLeast(0.0) else 0.0

        val expenseTx = transactions.filter { it.type == TransactionType.EXPENSE }
        val categoryTotals = expenseTx.groupBy { it.category }
            .mapValues { entry -> entry.value.sumOf { it.amount } }

        val totalExpensesSafe = if (expenses > 0) expenses else 1.0
        val categorySpending = categoryTotals.map { (cat, amount) ->
            CategorySpend(cat, amount, ((amount / totalExpensesSafe) * 100).toFloat())
        }.sortedByDescending { it.totalAmount }

        val budgetProgress = budgets.map { b ->
            val spent = categoryTotals[b.category] ?: 0.0
            BudgetProgress(b.category, spent, b.monthlyLimit, ((spent / b.monthlyLimit) * 100).toFloat(), spent > b.monthlyLimit)
        }

        FinanceUiState(
            totalBalance = net,
            monthlyIncome = income,
            monthlyExpenses = expenses,
            netSavings = net,
            savingsRate = rate,
            isBalanceVisible = isVisible,
            categorySpending = categorySpending,
            budgetProgressList = budgetProgress,
            recentTransactions = transactions.take(6),
            allTransactions = transactions,
            hasDemoData = transactions.any { it.isDemo }
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), FinanceUiState())

    fun toggleBalanceVisibility() {
        _isBalanceVisible.value = !_isBalanceVisible.value
    }

    fun addTransaction(title: String, amount: Double, type: TransactionType, category: Category, paymentMode: String = "UPI") {
        viewModelScope.launch {
            repository.insertTransaction(
                TransactionEntity(
                    title = title,
                    amount = amount,
                    type = type,
                    category = category,
                    paymentMode = paymentMode,
                    isDemo = false
                )
            )
        }
    }

    fun deleteTransaction(transaction: TransactionEntity) {
        viewModelScope.launch {
            repository.deleteTransaction(transaction)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/moneywise/ui/theme/Theme.kt',
    filename: 'Theme.kt',
    language: 'kotlin',
    category: 'Theme & Resources',
    description: 'Clean White Professional Material 3 Theme with Emerald accents.',
    content: `package com.moneywise.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Clean White & Emerald Palette (Requirement 1)
val WhiteBackground = Color(0xFFFFFFFF)
val SurfaceLight = Color(0xFFFFFFFF)
val SurfaceSubtle = Color(0xFFF8FAFC)
val GreyOutline = Color(0xFFE2E8F0)

val EmeraldPrimary = Color(0xFF059669)
val EmeraldContainer = Color(0xFFECFDF5)
val EmeraldOnContainer = Color(0xFF065F46)

val IncomeGreen = Color(0xFF10B981)
val ExpenseRed = Color(0xFFEF4444)
val WarningAmber = Color(0xFFF59E0B)

private val LightColorScheme = lightColorScheme(
    primary = EmeraldPrimary,
    onPrimary = Color.White,
    primaryContainer = EmeraldContainer,
    onPrimaryContainer = EmeraldOnContainer,
    background = WhiteBackground,
    surface = SurfaceLight,
    surfaceVariant = SurfaceSubtle,
    outline = GreyOutline
)

@Composable
fun MoneyWiseTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}`
  },
  {
    path: 'app/src/main/java/com/moneywise/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    category: 'UI & Compose',
    description: 'ComponentActivity, Jetpack Navigation Compose, and White Material 3 BottomBar.',
    content: `package com.moneywise

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.moneywise.ui.navigation.Screen
import com.moneywise.ui.screens.*
import com.moneywise.ui.theme.MoneyWiseTheme
import com.moneywise.ui.viewmodel.FinanceViewModel
import com.moneywise.ui.viewmodel.FinanceViewModelFactory

class MainActivity : ComponentActivity() {
    private val viewModel: FinanceViewModel by viewModels {
        FinanceViewModelFactory((application as MoneyWiseApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MoneyWiseTheme {
                val navController = rememberNavController()
                Scaffold(
                    bottomBar = {
                        NavigationBar {
                            Screen.bottomNavItems.forEach { screen ->
                                NavigationBarItem(
                                    icon = { Icon(screen.icon, contentDescription = screen.title) },
                                    label = { Text(screen.title) },
                                    selected = false,
                                    onClick = { navController.navigate(screen.route) }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(navController, startDestination = Screen.Home.route, modifier = Modifier.padding(innerPadding)) {
                        composable(Screen.Home.route) { DashboardScreen(viewModel, {}, {}) }
                        composable(Screen.Transactions.route) { TransactionsScreen(viewModel) }
                        composable(Screen.Budgets.route) { BudgetsScreen(viewModel) }
                        composable(Screen.Goals.route) { GoalsScreen() }
                        composable(Screen.Reports.route) { ReportsScreen(viewModel) }
                    }
                }
            }
        }
    }
}`
  }
];
