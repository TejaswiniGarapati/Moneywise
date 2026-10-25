package com.moneywise.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.moneywise.ui.components.formatCurrency

@Composable
fun GoalsScreen(modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Financial Goals",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Long-term wealth targets & contingency reserves",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Demo Goals Cards
        item {
            GoalCard(
                title = "Emergency Fund (6 Months)",
                current = 8500.0,
                target = 12000.0,
                icon = Icons.Default.Security,
                badgeColor = Color(0xFF0284C7)
            )
        }

        item {
            GoalCard(
                title = "Index Fund Retirement Nest Egg",
                current = 14200.0,
                target = 25000.0,
                icon = Icons.Default.TrendingUp,
                badgeColor = Color(0xFF10B981)
            )
        }

        item {
            GoalCard(
                title = "CSE Capstone Project & Hardware Lab",
                current = 1200.0,
                target = 1500.0,
                icon = Icons.Default.Flag,
                badgeColor = Color(0xFF8B5CF6)
            )
        }
    }
}

@Composable
fun GoalCard(
    title: String,
    current: Double,
    target: Double,
    icon: ImageVector,
    badgeColor: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                Icon(imageVector = icon, contentDescription = null, tint = badgeColor)
            }

            Spacer(modifier = Modifier.height(10.dp))

            val progress = (current / target).toFloat().coerceIn(0f, 1f)
            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = badgeColor
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${(progress * 100).toInt()}% Achieved",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = badgeColor
                )
                Text(
                    text = "${formatCurrency(current)} of ${formatCurrency(target)}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
