package com.example.nutrixa.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.*
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun AIPredictionEngineScreen(
    apiService: ApiService,
    currentPatient: PatientDetail?,
    refreshPatient: () -> Unit,
    onNavigate: (String) -> Unit
) {
    var recalculating by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    if (currentPatient == null) {
        NoPatientPlaceholder(onBrowse = { onNavigate("patients") })
        return
    }

    val pred = currentPatient.predictions

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
    ) {
        // Title block & trigger action button
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "🔮 Prognosis & Prediction Engine",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Clinical machine learning forecast arrays",
                        color = TextGray,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Button(
                    onClick = {
                        recalculating = true
                        scope.launch {
                            delay(1200)
                            apiService.recalculatePredictions(currentPatient.id)
                            refreshPatient()
                            recalculating = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Unspecified),
                    modifier = Modifier
                        .height(38.dp)
                        .background(
                            Brush.horizontalGradient(listOf(NeonCyan, NeonPurple)),
                            RoundedCornerShape(8.dp)
                        ),
                    shape = RoundedCornerShape(8.dp),
                    enabled = !recalculating
                ) {
                    if (recalculating) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp))
                    } else {
                        Text("🔮 Re-run", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Active Prognosis Matrix Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass),
                shape = RoundedCornerShape(20.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("ACTIVE PROGNOSIS MATRIX", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            // Fatigue
                            MatrixCell(label = "FATIGUE RISK", value = "Systemic Fatigue", risk = pred.fatigueRisk, modifier = Modifier.weight(1f))
                            // Deficiency
                            MatrixCell(label = "DEFICIENCY RISK", value = "Cellular Starve", risk = pred.deficiencyRisk, modifier = Modifier.weight(1f))
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            // Energy
                            val trendText = when (pred.energyTrend.lowercase()) {
                                "improving" -> "📈 Improving"
                                "stable" -> "➡️ Stable"
                                else -> "📉 Declining"
                            }
                            val trendRisk = if (pred.energyTrend == "improving") "Low" else if (pred.energyTrend == "stable") "Medium" else "High"
                            MatrixCell(label = "ACTIVE ENERGY PATH", value = trendText, risk = trendRisk, modifier = Modifier.weight(1f))

                            // Hydration
                            val hydText = when (pred.hydrationTrend.lowercase()) {
                                "improving" -> "📈 Improving"
                                "stable" -> "➡️ Stable"
                                else -> "📉 Declining"
                            }
                            val hydRisk = if (pred.hydrationTrend == "improving") "Low" else if (pred.hydrationTrend == "stable") "Medium" else "High"
                            MatrixCell(label = "FLUID VOLUMETRIC PATH", value = hydText, risk = hydRisk, modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        // Recovery circular gauge and forecast schemas info row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Circular Target
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .border(1.dp, CardGlassBorder.copy(alpha = 0.4f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "THERAPEUTIC TARGET",
                            color = TextGray,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(80.dp)) {
                            Canvas(modifier = Modifier.size(70.dp)) {
                                drawCircle(
                                    color = SlateGray.copy(alpha = 0.15f),
                                    radius = size.minDimension / 2f,
                                    style = Stroke(width = 6.dp.toPx())
                                )
                                drawArc(
                                    color = NeonCyan,
                                    startAngle = -90f,
                                    sweepAngle = (pred.recoveryForecast / 100f) * 360f,
                                    useCenter = false,
                                    style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                                )
                            }
                            Text(
                                text = "${pred.recoveryForecast}%",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Estimated Recovery", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                // Info card
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .border(1.dp, CardGlassBorder.copy(alpha = 0.4f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("🔮 ML FORECAST SCHEMA", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Text(
                            text = "Predictions are synthesized dynamically using the patient's 6-slot compliance ratio and fluid logging frequencies. Completing logs triggers calculations to re-evaluate coefficients.",
                            color = TextGray,
                            fontSize = 9.sp,
                            lineHeight = 13.sp
                        )
                    }
                }
            }
        }

        // Care station advisory warning banner
        item {
            val hasHighRisk = pred.fatigueRisk.equals("High", ignoreCase = true) || pred.deficiencyRisk.equals("Severe", ignoreCase = true)
            val hasMedRisk = pred.fatigueRisk.equals("Medium", ignoreCase = true) || pred.deficiencyRisk.equals("Mild", ignoreCase = true)

            val alertColor = if (hasHighRisk) AlertRed else if (hasMedRisk) AlertOrange else FluorescentGreen
            val alertBg = alertColor.copy(alpha = 0.05f)
            val alertBorder = alertColor.copy(alpha = 0.3f)

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(width = 1.dp, color = alertBorder, shape = RoundedCornerShape(16.dp)),
                colors = CardDefaults.cardColors(containerColor = alertBg)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    val alertTitle = if (hasHighRisk) "🚨 Care Station Critical Advisory"
                    else if (hasMedRisk) "💡 Sub-optimal Recovery Advisory"
                    else "✓ Care Station Standard Advisory"

                    val alertDesc = if (hasHighRisk) {
                        "Critical Clinical Status: Metabolic markers indicate severe cell starvation and muscle cachexia vectors. Add a fortified Whey protein drink or trigger oral glucose replacement fluids at once. Check warning alerts logs."
                    } else if (hasMedRisk) {
                        "Sub-optimal Recovery Vector: Demographics show minor deficiencies. Supplement diet with rich antioxidants and complex grains during snack periods. Recommend daily water logs increments."
                    } else {
                        "Metabolic Balance Established: Compliance metrics remain stable. No specialized nutritional interventions are requested at this frame. Continue tracking daily meal log profiles."
                    }

                    Text(alertTitle, color = alertColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(alertDesc, color = Color.White.copy(alpha = 0.9f), fontSize = 11.sp, lineHeight = 15.sp)
                }
            }
        }
    }
}

@Composable
fun MatrixCell(label: String, value: String, risk: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.border(1.dp, CardGlassBorder.copy(alpha = 0.2f), RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = SlateGray.copy(alpha = 0.05f))
    ) {
        Row(
            modifier = Modifier.padding(10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(label, color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                Text(value, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 2.dp))
            }
            RiskBadge(risk = risk)
        }
    }
}
