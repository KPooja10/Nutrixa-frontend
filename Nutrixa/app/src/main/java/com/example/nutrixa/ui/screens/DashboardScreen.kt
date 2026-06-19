package com.example.nutrixa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.*
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen(
    apiService: ApiService,
    currentPatient: PatientDetail?,
    onSwitchPatient: () -> Unit,
    onNavigate: (String) -> Unit
) {
    var waterAmount by remember { mutableStateOf("") }
    var waterTotal by remember { mutableStateOf(0) }
    var waterLogs by remember { mutableStateOf<List<WaterLog>>(emptyList()) }
    var meals by remember { mutableStateOf<List<Meal>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var loggingWater by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    fun loadData() {
        if (currentPatient == null) return
        loading = true
        scope.launch {
            apiService.getWaterLogs(currentPatient.id)
                .onSuccess { list ->
                    waterLogs = list
                    waterTotal = list.sumOf { it.intake }
                }
            apiService.getMealsByPatient(currentPatient.id)
                .onSuccess { list ->
                    meals = list
                }
            loading = false
        }
    }

    LaunchedEffect(currentPatient) {
        loadData()
    }

    val missedMeals = meals.filter { it.completed == 0 }
    val completionRate = if (meals.isNotEmpty()) {
        (meals.count { it.completed == 1 } * 100) / meals.size
    } else 100

    if (currentPatient == null) {
        NoPatientPlaceholder(onBrowse = { onNavigate("patients") })
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
    ) {
        // Monitored Patient Header Demographics Panel
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .background(
                                    Brush.horizontalGradient(listOf(NeonCyan, Color(0xFF2563EB))),
                                    CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentPatient.patientName.take(1).uppercase(),
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = currentPatient.patientName,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                                RiskBadge(risk = currentPatient.analytics.risk)
                            }
                            Text(
                                text = "🏷️ ${currentPatient.cancerType} (${currentPatient.stage}) | Age: ${currentPatient.age}",
                                color = TextGray,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = onSwitchPatient,
                        colors = ButtonDefaults.buttonColors(containerColor = SlateGray.copy(alpha = 0.15f)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("🔄 Switch Patient Profile", color = TextGray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Gauges Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    GaugeItem(title = "Metabolic Score", value = currentPatient.analytics.energy, progressColor = NeonCyan, modifier = Modifier.weight(1f))
                    GaugeItem(title = "Oral Hydration", value = currentPatient.analytics.hydration, progressColor = Color(0xFF3B82F6), modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    GaugeItem(title = "Recovery Forecast", value = currentPatient.analytics.recovery, progressColor = FluorescentGreen, modifier = Modifier.weight(1f))
                    GaugeItem(title = "Compliance Level", value = completionRate, progressColor = AlertOrange, modifier = Modifier.weight(1f))
                }
            }
        }

        // Daily Hydration Log Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder, RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Daily Hydration Log", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text("Maintain liquid targets for antiemetic protocols", color = TextGray, fontSize = 9.sp)
                        }
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text("$waterTotal", color = Color(0xFF3B82F6), fontSize = 20.sp, fontWeight = FontWeight.Black)
                            Text(" / 2500 ml", color = SlateGray, fontSize = 9.sp, modifier = Modifier.padding(bottom = 2.dp))
                        }
                    }

                    // Water buttons grid
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        listOf(
                            Triple(250, "🥛 +250ml", "Standard Cup"),
                            Triple(500, "🥤 +500ml", "Small Infuser"),
                            Triple(750, "🧴 +750ml", "Therapeutic Bottle")
                        ).forEach { (amt, emoji, desc) ->
                            Card(
                                modifier = Modifier
                                    .weight(1f)
                                    .border(1.dp, CardGlassBorder.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                                    .clickable(enabled = !loggingWater) {
                                        loggingWater = true
                                        scope.launch {
                                            apiService.logWater(currentPatient.id, amt)
                                            loadData()
                                            loggingWater = false
                                        }
                                    },
                                colors = CardDefaults.cardColors(containerColor = SlateGray.copy(alpha = 0.05f))
                            ) {
                                Column(
                                    modifier = Modifier.padding(10.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    Text(emoji, color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(desc, color = TextGray, fontSize = 7.sp)
                                }
                            }
                        }
                    }

                    // Custom input
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = waterAmount,
                            onValueChange = { waterAmount = it },
                            placeholder = { Text("Intake volume (ml)...", color = Color.Gray, fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NeonCyan,
                                unfocusedBorderColor = SlateGray,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        )

                        Button(
                            onClick = {
                                val amt = waterAmount.toIntOrNull()
                                if (amt != null && amt > 0) {
                                    loggingWater = true
                                    scope.launch {
                                        apiService.logWater(currentPatient.id, amt)
                                        waterAmount = ""
                                        loadData()
                                        loggingWater = false
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            shape = RoundedCornerShape(8.dp),
                            enabled = !loggingWater && waterAmount.isNotEmpty()
                        ) {
                            Text("Log Intake", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Quick Actions Shortcuts
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.3f), RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    ShortcutButton(emoji = "🥗", label = "Meal Plan", onClick = { onNavigate("meals") })
                    ShortcutButton(emoji = "📷", label = "Food Scan", onClick = { onNavigate("scanner") })
                    ShortcutButton(emoji = "👤", label = "Face Scan", onClick = { onNavigate("biometrics") })
                    ShortcutButton(emoji = "🔮", label = "Prognosis", onClick = { onNavigate("predictions") })
                }
            }
        }

        // Missed Meal Compliance Warnings
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("⚠️ Missed Meal Compliance Warnings", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)

                    if (missedMeals.isEmpty()) {
                        Text(
                            text = "👍 All clinical oncology nutritional meals are currently completed. Zero alerts logged.",
                            color = TextGray,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
                        )
                    } else {
                        missedMeals.forEach { m ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(AlertRed.copy(alpha = 0.03f), RoundedCornerShape(10.dp))
                                    .border(1.dp, AlertRed.copy(alpha = 0.1f), RoundedCornerShape(10.dp))
                                    .padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("🔔", fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "${m.type.replace("_", " ").uppercase()} Overdue",
                                        color = AlertRed,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Missed Meal: ${m.mealName}. Alert patient to complete or record nutritional intake.",
                                        color = TextGray,
                                        fontSize = 10.sp,
                                        lineHeight = 14.sp,
                                        modifier = Modifier.padding(top = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Active Care Protocols
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("⏰ Active Care Protocols", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)

                    ProtocolItemRow(label = "💊 Antiemetic Medication", status = "08:00 (Completed)", statusColor = NeonCyan)
                    ProtocolItemRow(label = "🥤 Early Snack Intake", status = "11:00 (Overdue)", statusColor = AlertRed)
                    ProtocolItemRow(label = "💧 Fluid Infusion Re-Check", status = "15:30 (Scheduled)", statusColor = TextGray)
                }
            }
        }
    }
}

@Composable
fun GaugeItem(title: String, value: Int, progressColor: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = CardGlass)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(text = title.uppercase(), color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
            Text(text = "$value%", color = progressColor, fontSize = 22.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(vertical = 4.dp))
            LinearProgressIndicator(
                progress = { value / 100f },
                color = progressColor,
                trackColor = SlateGray.copy(alpha = 0.15f),
                modifier = Modifier.fillMaxWidth().height(3.dp)
            )
        }
    }
}

@Composable
fun ShortcutButton(emoji: String, label: String, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable { onClick() }
            .padding(8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(emoji, fontSize = 22.sp)
        Text(label, color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun ProtocolItemRow(label: String, status: String, statusColor: Color) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = TextGray, fontSize = 11.sp)
        Text(status, color = statusColor, fontSize = 10.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun NoPatientPlaceholder(onBrowse: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("🧬", fontSize = 48.sp)
            Text(
                text = "No Monitored Patient Profile Selected",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = "Please access the directory list or search terminals to select and audit patient nutrition logs.",
                color = TextGray,
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.width(260.dp),
                lineHeight = 18.sp
            )
            Button(
                onClick = onBrowse,
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Text("Browse Patient Records", color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
