package com.moneywise

import android.app.Application
import com.moneywise.data.local.MoneyWiseDatabase
import com.moneywise.data.repository.FinanceRepository

class MoneyWiseApp : Application() {
    val database by lazy { MoneyWiseDatabase.getDatabase(this) }
    val repository by lazy { FinanceRepository(database.transactionDao(), database.budgetDao()) }
}
