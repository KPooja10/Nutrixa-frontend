package com.example.nutrixa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.*
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.screens.*
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

sealed interface Screen {
    object Login : Screen
    object ForgotPassword : Screen
    object PatientRegistration : Screen
    object CommandCenter : Screen
    object PatientList : Screen
    object Dashboard : Screen
    object MealPlanner : Screen
    object AIFoodScanner : Screen
    object AIFaceAnalysis : Screen
    object AIPredictionEngine : Screen
    object RealTimeAnalytics : Screen
    object WeeklyProgressReport : Screen
    object Profile : Screen
}

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val sessionManager = remember { SessionManager(applicationContext) }
            val apiService = remember { ApiService(sessionManager) }

            var user by remember { mutableStateOf<User?>(null) }
            var currentPatient by remember { mutableStateOf<PatientDetail?>(null) }

            val initialScreen = remember {
                if (sessionManager.isLoggedIn()) {
                    user = sessionManager.getUser()
                    if (user?.role == "doctor") {
                        Screen.CommandCenter
                    } else {
                        Screen.Dashboard
                    }
                } else {
                    Screen.Login
                }
            }

            var currentScreen by remember { mutableStateOf<Screen>(initialScreen) }
            val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
            val scope = rememberCoroutineScope()

            // Automatically resolve and load matching patient profile for patient logins
            LaunchedEffect(user) {
                val currentUser = user
                if (currentUser != null && currentUser.role != "doctor" && currentPatient == null) {
                    apiService.getAllPatients().onSuccess { patientsList ->
                        val patientProfile = patientsList.find {
                            it.patientName.contains(currentUser.username, ignoreCase = true)
                        } ?: patientsList.firstOrNull()

                        patientProfile?.let { p ->
                            apiService.getPatientById(p.id).onSuccess { detail ->
                                currentPatient = detail
                            }
                        }
                    }
                }
            }

            NutrixaTheme {
                if (currentScreen is Screen.Login || currentScreen is Screen.ForgotPassword) {
                    // Non-authenticated Shell
                    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                        Box(modifier = Modifier.padding(innerPadding)) {
                            Crossfade(targetState = currentScreen, label = "AuthTransition") { screen ->
                                when (screen) {
                                    is Screen.Login -> LoginScreen(
                                        apiService = apiService,
                                        sessionManager = sessionManager,
                                        onLoginSuccess = { loggedUser ->
                                            user = loggedUser
                                            currentScreen = if (loggedUser.role == "doctor") {
                                                Screen.CommandCenter
                                            } else {
                                                // Fetch default patient or dashboard
                                                Screen.Dashboard
                                            }
                                        },
                                        onForgotPassword = {
                                            currentScreen = Screen.ForgotPassword
                                        }
                                    )
                                    is Screen.ForgotPassword -> ForgotPasswordScreen(
                                        onBackToLogin = {
                                            currentScreen = Screen.Login
                                        }
                                    )
                                    else -> {}
                                }
                            }
                        }
                    }
                } else {
                    // Authenticated View Wrapper with Navigation Drawer
                    ModalNavigationDrawer(
                        drawerState = drawerState,
                        drawerContent = {
                            ModalDrawerSheet(
                                drawerContainerColor = DarkNavy,
                                modifier = Modifier.width(280.dp)
                            ) {
                                SidebarDrawerContent(
                                    currentScreen = currentScreen,
                                    currentPatient = currentPatient,
                                    user = user,
                                    onClose = {
                                        scope.launch { drawerState.close() }
                                    },
                                    onSelectScreen = { screen ->
                                        currentScreen = screen
                                        scope.launch { drawerState.close() }
                                    },
                                    onLogout = {
                                        sessionManager.clearSession()
                                        user = null
                                        currentPatient = null
                                        currentScreen = Screen.Login
                                        scope.launch { drawerState.close() }
                                    }
                                )
                            }
                        }
                    ) {
                        Scaffold(
                            topBar = {
                                TopAppBar(
                                    title = {
                                        Text(
                                            text = when (currentScreen) {
                                                Screen.Dashboard -> "🖥️ CENTRAL CONSOLE"
                                                Screen.PatientList -> "🗄️ PATIENT DIRECTORY"
                                                Screen.MealPlanner -> "🥗 INTAKE PLANNER"
                                                Screen.AIFoodScanner -> "📷 AI FOOD SCANNER"
                                                Screen.AIFaceAnalysis -> "👤 BIOMETRIC SCAN"
                                                Screen.AIPredictionEngine -> "🔮 PROGNOSIS ENGINE"
                                                Screen.RealTimeAnalytics -> "📈 LIVE ANALYTICS"
                                                Screen.WeeklyProgressReport -> "📋 WEEKLY PROGRESS"
                                                Screen.CommandCenter -> "🧬 COMMAND CENTER"
                                                Screen.Profile -> "⚙️ USER SETTINGS"
                                                else -> "🧬 PONIS"
                                            },
                                            color = NeonCyan,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.sp
                                        )
                                    },
                                    navigationIcon = {
                                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                            Icon(
                                                imageVector = Icons.Default.Menu,
                                                contentDescription = "Menu",
                                                tint = NeonCyan
                                            )
                                        }
                                    },
                                    actions = {
                                        IconButton(onClick = { currentScreen = Screen.Profile }) {
                                            Box(
                                                modifier = Modifier
                                                    .size(32.dp)
                                                    .background(NeonCyan, CircleShape),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = user?.username?.take(1)?.uppercase() ?: "U",
                                                    color = Color.Black,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 14.sp
                                                )
                                            }
                                        }
                                    },
                                    colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkNavy)
                                )
                            },
                            containerColor = DarkNavy,
                            modifier = Modifier.fillMaxSize()
                        ) { innerPadding ->
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(innerPadding)
                            ) {
                                Crossfade(targetState = currentScreen, label = "ScreenTransition") { screen ->
                                    when (screen) {
                                        is Screen.Dashboard -> DashboardScreen(
                                            apiService = apiService,
                                            currentPatient = currentPatient,
                                            onSwitchPatient = { currentScreen = Screen.PatientList },
                                            onNavigate = { tab ->
                                                currentScreen = when (tab) {
                                                    "meals" -> Screen.MealPlanner
                                                    "scanner" -> Screen.AIFoodScanner
                                                    "biometrics" -> Screen.AIFaceAnalysis
                                                    "predictions" -> Screen.AIPredictionEngine
                                                    "patients" -> Screen.PatientList
                                                    else -> Screen.Dashboard
                                                }
                                            }
                                        )
                                        is Screen.PatientList -> PatientListScreen(
                                            apiService = apiService,
                                            onSelectPatient = { patient ->
                                                scope.launch {
                                                    apiService.getPatientById(patient.id)
                                                        .onSuccess { detail ->
                                                            currentPatient = detail
                                                            currentScreen = Screen.Dashboard
                                                        }
                                                }
                                            },
                                            onRegisterPatient = { currentScreen = Screen.PatientRegistration }
                                        )
                                        is Screen.MealPlanner -> MealPlannerScreen(
                                            apiService = apiService,
                                            currentPatient = currentPatient,
                                            onNavigate = { currentScreen = Screen.PatientList }
                                        )
                                        is Screen.AIFoodScanner -> AIFoodScannerScreen(
                                            apiService = apiService,
                                            currentPatient = currentPatient,
                                            onNavigate = { currentScreen = Screen.PatientList }
                                        )
                                        is Screen.AIFaceAnalysis -> AIFaceAnalysisScreen(
                                            apiService = apiService,
                                            currentPatient = currentPatient,
                                            onNavigate = { currentScreen = Screen.PatientList }
                                        )
                                        is Screen.AIPredictionEngine -> AIPredictionEngineScreen(
                                            apiService = apiService,
                                            currentPatient = currentPatient,
                                            refreshPatient = {
                                                currentPatient?.id?.let { pid ->
                                                    scope.launch {
                                                        apiService.getPatientById(pid)
                                                            .onSuccess { detail ->
                                                                currentPatient = detail
                                                            }
                                                    }
                                                }
                                            },
                                            onNavigate = { currentScreen = Screen.PatientList }
                                        )
                                        is Screen.RealTimeAnalytics -> RealTimeAnalyticsScreen(
                                            apiService = apiService,
                                            currentPatient = currentPatient,
                                            onNavigate = { currentScreen = Screen.PatientList }
                                        )
                                        is Screen.WeeklyProgressReport -> WeeklyProgressReportScreen(
                                            apiService = apiService,
                                            currentPatient = currentPatient,
                                            onNavigate = { currentScreen = Screen.PatientList }
                                        )
                                        is Screen.CommandCenter -> CommandCenterScreen(
                                            apiService = apiService,
                                            onMonitorPatient = { patient ->
                                                scope.launch {
                                                    apiService.getPatientById(patient.id)
                                                        .onSuccess { detail ->
                                                            currentPatient = detail
                                                            currentScreen = Screen.Dashboard
                                                        }
                                                }
                                            },
                                            onRegisterPatientIntake = { currentScreen = Screen.PatientRegistration },
                                            onLogout = {
                                                sessionManager.clearSession()
                                                user = null
                                                currentPatient = null
                                                currentScreen = Screen.Login
                                            }
                                        )
                                        is Screen.PatientRegistration -> PatientRegistrationScreen(
                                            apiService = apiService,
                                            onBack = { currentScreen = Screen.CommandCenter },
                                            onRegistrationSuccess = { currentScreen = Screen.CommandCenter }
                                        )
                                        is Screen.Profile -> ProfileScreen(
                                            user = user,
                                            onLogout = {
                                                sessionManager.clearSession()
                                                user = null
                                                currentPatient = null
                                                currentScreen = Screen.Login
                                            }
                                        )
                                        else -> {}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SidebarDrawerContent(
    currentScreen: Screen,
    currentPatient: PatientDetail?,
    user: User?,
    onClose: () -> Unit,
    onSelectScreen: (Screen) -> Unit,
    onLogout: () -> Unit
) {
    val navItems = listOf(
        Triple(Screen.Dashboard, "🖥️ Central Console", "dashboard"),
        Triple(Screen.PatientList, "🗄️ Patient Directory", "patients"),
        Triple(Screen.MealPlanner, "🥗 Intake Planner", "meals"),
        Triple(Screen.AIFoodScanner, "📷 AI Food Scanner", "scanner"),
        Triple(Screen.AIFaceAnalysis, "👤 Biometric Scan", "biometrics"),
        Triple(Screen.AIPredictionEngine, "🔮 Prognosis Engine", "predictions"),
        Triple(Screen.RealTimeAnalytics, "📈 Live Analytics", "analytics"),
        Triple(Screen.WeeklyProgressReport, "📋 Weekly Progress", "reports"),
        Triple(Screen.CommandCenter, "🧬 Command Center", "hospital-center"),
        Triple(Screen.Profile, "⚙️ User Settings", "profile")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .border(1.dp, CardGlassBorder.copy(alpha = 0.15f), RoundedCornerShape(0.dp))
            .padding(vertical = 24.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("🧬 PONIS", color = NeonCyan, fontSize = 22.sp, fontWeight = FontWeight.Black)
            IconButton(onClick = onClose) {
                Text("✕", color = Color.Gray, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }

        HorizontalDivider(color = Color.White.copy(alpha = 0.05f))

        // Monitored Patient card (if selected)
        if (currentPatient != null) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = DarkNavy.copy(alpha = 0.6f))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        "Monitored Patient",
                        color = SlateGray,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 2.dp)
                    )
                    Text(
                        currentPatient.patientName,
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(currentPatient.stage, color = TextGray, fontSize = 10.sp)
                        RiskBadge(risk = currentPatient.analytics.risk)
                    }
                }
            }
        }

        // Navigation list
        val scrollState = rememberScrollState()
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp)
                .verticalScroll(scrollState)
        ) {
            navItems.forEach { (screen, label, key) ->
                val active = currentScreen == screen
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .background(
                            if (active) NeonCyan.copy(alpha = 0.1f) else Color.Transparent,
                            RoundedCornerShape(10.dp)
                        )
                        .border(
                            1.dp,
                            if (active) NeonCyan.copy(alpha = 0.2f) else Color.Transparent,
                            RoundedCornerShape(10.dp)
                        )
                        .clickable { onSelectScreen(screen) }
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = label,
                        color = if (active) NeonCyan else TextGray,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Footer User Profile & Settings
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = DarkNavy.copy(alpha = 0.6f))
        ) {
            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(NeonCyan, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = user?.username?.take(1)?.uppercase() ?: "U",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = user?.username ?: "Clinician",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                        Text(
                            text = "${user?.role?.uppercase() ?: "DOCTOR"} NODE",
                            color = SlateGray,
                            fontSize = 9.sp,
                            modifier = Modifier.padding(top = 1.dp)
                        )
                    }
                }

                Button(
                    onClick = onLogout,
                    colors = ButtonDefaults.buttonColors(containerColor = AlertRed.copy(alpha = 0.1f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, AlertRed.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(vertical = 10.dp)
                ) {
                    Text(
                        "🔒 Terminate Session",
                        color = AlertRed,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}