package com.moneywise

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
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
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination

                var showAddDialog by remember { mutableStateOf(false) }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        NavigationBar {
                            Screen.bottomNavItems.forEach { screen ->
                                val selected = currentDestination?.route == screen.route
                                NavigationBarItem(
                                    icon = { Icon(screen.icon, contentDescription = screen.title) },
                                    label = { Text(screen.title) },
                                    selected = selected,
                                    onClick = {
                                        navController.navigate(screen.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Home.route) {
                            DashboardScreen(
                                viewModel = viewModel,
                                onNavigateToTransactions = {
                                    navController.navigate(Screen.Transactions.route)
                                },
                                onOpenAddTransaction = {
                                    showAddDialog = true
                                }
                            )
                        }
                        composable(Screen.Transactions.route) {
                            TransactionsScreen(
                                viewModel = viewModel,
                                onOpenAddTransaction = {
                                    showAddDialog = true
                                }
                            )
                        }
                        composable(Screen.Budgets.route) {
                            BudgetsScreen(viewModel = viewModel)
                        }
                        composable(Screen.Goals.route) {
                            GoalsScreen()
                        }
                        composable(Screen.Reports.route) {
                            ReportsScreen(viewModel = viewModel)
                        }
                    }

                    // In Stage 2: Add Transaction Sheet/Dialog with Form Validation
                }
            }
        }
    }
}
