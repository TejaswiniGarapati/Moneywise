package com.moneywise.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.moneywise.data.model.Category

@Entity(tableName = "budgets")
data class BudgetEntity(
    @PrimaryKey
    val category: Category,
    val monthlyLimit: Double,
    val alertThresholdPercent: Int = 80 // Default alert when 80% consumed
)
