package com.moneywise.data.local.entity

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
    val notes: String = "",
    val isDemo: Boolean = false
)
