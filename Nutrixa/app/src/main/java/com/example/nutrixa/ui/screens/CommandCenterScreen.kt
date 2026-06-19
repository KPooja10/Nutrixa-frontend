package com.example.nutrixa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.HospitalSummaryResponse
import com.example.nutrixa.data.Patient
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommandCenterScreen(
    apiService: ApiService,
    onMonitorPatient: (Patient) -> Unit,
    onRegisterPatientIntake: () -> Unit,
    onLogout: () -> Unit
) {
    var summaryData by remember { mutableStateOf<HospitalSummaryResponse?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun loadData() {
        loading = true
        error = null
        scope.launch {
            apiService.getHospitalSummary()
                .onSuccess { data ->
                    summaryData = data
                }
                .onFailure { err ->
                    error = err.message ?: "Failed to sync clinical records."
                }
            loading = false
        }
    }

    LaunchedEffect(Unit) {
        loadData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("🧬", fontSize = 24.sp)
                        Text(
                            text = "PONIS COMMAND CENTER",
                            color = NeonCyan,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { loadData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = NeonCyan)
                    }
                    IconButton(onClick = { onLogout() }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout", tint = AlertRed)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkNavy)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { onRegisterPatientIntake() },
                containerColor = NeonCyan,
                contentColor = Color.Black,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Add, contentDescription = "Register Patient")
            }
        },
        containerColor = DarkNavy
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(DarkNavy)
        ) {
            if (loading && summaryData == null) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonCyan)
                }
            } else {
                val stats = summaryData?.statistics
                val patientList = summaryData?.patientRegistry ?: emptyList()
                val alerts = summaryData?.alerts ?: emptyList()

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 80.dp)
                ) {
                    // Header Subtitle
                    item {
                        Text(
                            text = "Real-time oncology nutrition monitoring and clinical alerts network",
                            color = TextGray,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    // Stats Dashboard Grid
                    item {
                        if (stats != null) {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    StatCard(
                                        title = "TOTAL NODES",
                                        value = stats.totalPatients.toString(),
                                        color = NeonCyan,
                                        modifier = Modifier.weight(1f)
                                    )
                                    StatCard(
                                        title = "CRITICAL RISK",
                                        value = stats.riskDistribution.high.toString(),
                                        color = AlertRed,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    StatCard(
                                        title = "AVG ADHERENCE",
                                        value = "${stats.averages.nutritionAdherence}%",
                                        color = FluorescentGreen,
                                        modifier = Modifier.weight(1f)
                                    )
                                    StatCard(
                                        title = "AVG HYDRATION",
                                        value = "${stats.averages.hydration}%",
                                        color = NeonPurple,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }
                    }

                    // Alerts Console Panel
                    if (alerts.isNotEmpty()) {
                        item {
                            Text(
                                text = "🚨 ACTIVE SAFETY ALERTS",
                                color = AlertRed,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                        }
                        items(alerts.take(4)) { alert ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, AlertRed.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
                                colors = CardDefaults.cardColors(containerColor = AlertRed.copy(alpha = 0.05f))
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(alert.patientName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                        Text(alert.type, color = AlertRed, fontWeight = FontWeight.Bold, fontSize = 9.sp)
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(alert.message, color = Color.White.copy(alpha = 0.9f), fontSize = 11.sp)
                                }
                            }
                        }
                    }

                    // Patient Registry Header
                    item {
                        Text(
                            text = "🗄️ CLINICAL PATIENTS DIRECTORY",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    if (patientList.isEmpty()) {
                        item {
                            Text(
                                text = "No active clinical profiles found.",
                                color = TextGray,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 24.dp)
                            )
                        }
                    } else {
                        items(patientList) { patient ->
                            PatientRow(patient = patient, onMonitor = { onMonitorPatient(patient) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.border(1.dp, CardGlassBorder, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = CardGlass),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(title, color = TextGray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, color = color, fontSize = 24.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
fun PatientRow(patient: Patient, onMonitor: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardGlassBorder, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = CardGlass)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Profile Initials Circle
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(
                        Brush.horizontalGradient(listOf(NeonCyan, Color(0xFF2563EB))),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = patient.patientName.take(1).uppercase(),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Demographics & Telemetry Details
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        patient.patientName,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    RiskBadge(risk = patient.risk)
                }

                Text(
                    text = "${patient.cancerType} (${patient.stage}) | Age: ${patient.age} yrs",
                    color = TextGray,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Mini Telemetry Dials
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column {
                        Text("NUT (Compliance)", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        Text("${patient.energy}%", color = FluorescentGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Column {
                        Text("HYD (Hydration)", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        Text("${patient.hydration}%", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Monitor Action Trigger Button
            Button(
                onClick = onMonitor,
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Monitor", color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun RiskBadge(risk: String) {
    val (bg, text) = when (risk.lowercase()) {
        "high" -> Pair(AlertRed.copy(alpha = 0.15f), AlertRed)
        "medium" -> Pair(AlertOrange.copy(alpha = 0.15f), AlertOrange)
        else -> Pair(FluorescentGreen.copy(alpha = 0.15f), FluorescentGreen)
    }

    Box(
        modifier = Modifier
            .background(bg, RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = risk.uppercase(),
            color = text,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black
        )
    }
}
