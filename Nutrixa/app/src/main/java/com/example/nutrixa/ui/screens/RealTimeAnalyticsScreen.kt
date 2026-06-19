package com.example.nutrixa.ui.screens

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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.*
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun RealTimeAnalyticsScreen(
    apiService: ApiService,
    currentPatient: PatientDetail?,
    onNavigate: (String) -> Unit
) {
    var analyticsResponse by remember { mutableStateOf<PatientAnalyticsResponse?>(null) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun loadAnalytics() {
        if (currentPatient == null) return
        loading = true
        scope.launch {
            apiService.getPatientAnalytics(currentPatient.id)
                .onSuccess { response ->
                    analyticsResponse = response
                }
            loading = false
        }
    }

    LaunchedEffect(currentPatient) {
        loadAnalytics()
    }

    if (currentPatient == null) {
        NoPatientPlaceholder(onBrowse = { onNavigate("patients") })
        return
    }

    val summary = analyticsResponse?.summary
    val weeklyReport = analyticsResponse?.weeklyReport ?: emptyList()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
    ) {
        item {
            Column {
                Text(
                    text = "📈 Real-Time Analytics",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Dynamic clinical telemetry trackers and cellular indexes",
                    color = TextGray,
                    fontSize = 10.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }

        if (loading && summary == null) {
            item {
                Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonCyan)
                }
            }
        } else {
            // Stats Row Grid
            if (summary != null) {
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                            AnalyticStatCell(label = "Nutrition Adherence", value = "${summary.energy}%", color = NeonCyan, modifier = Modifier.weight(1f))
                            AnalyticStatCell(label = "Oral Hydration", value = "${summary.hydration}%", color = Color(0xFF3B82F6), modifier = Modifier.weight(1f))
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                            AnalyticStatCell(label = "Cellular Recovery", value = "${summary.recovery}%", color = FluorescentGreen, modifier = Modifier.weight(1f))
                            Card(
                                modifier = Modifier
                                    .weight(1f)
                                    .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(12.dp)),
                                colors = CardDefaults.cardColors(containerColor = CardGlass)
                            ) {
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text("Safety Status", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                    RiskBadge(risk = summary.risk)
                                }
                            }
                        }
                    }
                }
            }

            // Dual Bar Chart: Nutrition & Hydration Trends
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Nutrition & Hydration Trends", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Weekly compliance curves (Nutrition: Cyan, Hydration: Blue)", color = TextGray, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp))

                        Spacer(modifier = Modifier.height(16.dp))

                        if (weeklyReport.isEmpty()) {
                            Text("No telemetry log points detected.", color = Color.Gray, fontSize = 11.sp, modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp), textAlign = TextAlign.Center)
                        } else {
                            DualBarTelemetryChart(weeklyReport = weeklyReport)
                        }
                    }
                }
            }

            // Single Bar Chart: Recovery Forecast Vectors
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Recovery Forecast Vectors", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Estimated systemic recovery score over active timeline", color = TextGray, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp))

                        Spacer(modifier = Modifier.height(16.dp))

                        if (weeklyReport.isEmpty()) {
                            Text("No weekly compliance log points detected.", color = Color.Gray, fontSize = 11.sp, modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp), textAlign = TextAlign.Center)
                        } else {
                            SingleBarRecoveryChart(weeklyReport = weeklyReport)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AnalyticStatCell(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = CardGlass)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(label.uppercase(), color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
            Text(value, color = color, fontSize = 18.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

@Composable
fun DualBarTelemetryChart(weeklyReport: List<WeeklyReportItem>) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.fillMaxWidth().height(150.dp)) {
            // Y-Axis Labels
            Column(
                modifier = Modifier.fillMaxHeight().width(32.dp).padding(vertical = 6.dp),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End
            ) {
                Text("100%", color = SlateGray, fontSize = 8.sp)
                Text("50%", color = SlateGray, fontSize = 8.sp)
                Text("0%", color = SlateGray, fontSize = 8.sp)
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Graph Canvas
            Canvas(modifier = Modifier.weight(1f).fillMaxHeight()) {
                val graphHeight = size.height - 10.dp.toPx()
                val dayWidth = size.width / weeklyReport.size
                val barWidth = 5.dp.toPx()

                // Baseline
                drawLine(
                    color = SlateGray.copy(alpha = 0.3f),
                    start = Offset(0f, graphHeight),
                    end = Offset(size.width, graphHeight),
                    strokeWidth = 1.dp.toPx()
                )

                // Gridlines
                val gridLines = listOf(0.0f, 0.5f, 1.0f)
                gridLines.forEach { scale ->
                    val y = graphHeight - (graphHeight * scale)
                    drawLine(
                        color = Color.White.copy(alpha = 0.03f),
                        start = Offset(0f, y),
                        end = Offset(size.width, y),
                        strokeWidth = 1.dp.toPx()
                    )
                }

                weeklyReport.forEachIndexed { index, item ->
                    val xCenter = index * dayWidth + dayWidth / 2f

                    // Adherence (Cyan)
                    val adHeight = (item.adherence / 100f) * graphHeight
                    val adY = graphHeight - adHeight
                    drawRect(
                        color = NeonCyan,
                        topLeft = Offset(xCenter - barWidth - 2.dp.toPx(), adY),
                        size = Size(barWidth, adHeight)
                    )

                    // Hydration (Blue)
                    val hydHeight = (item.hydration / 100f) * graphHeight
                    val hydY = graphHeight - hydHeight
                    drawRect(
                        color = Color(0xFF3B82F6),
                        topLeft = Offset(xCenter + 2.dp.toPx(), hydY),
                        size = Size(barWidth, hydHeight)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // X-Axis Labels Row
        Row(
            modifier = Modifier.fillMaxWidth().padding(start = 40.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            weeklyReport.forEach { item ->
                Text(
                    text = item.day,
                    color = TextGray,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.width(32.dp)
                )
            }
        }
    }
}

@Composable
fun SingleBarRecoveryChart(weeklyReport: List<WeeklyReportItem>) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.fillMaxWidth().height(150.dp)) {
            // Y-Axis Labels
            Column(
                modifier = Modifier.fillMaxHeight().width(32.dp).padding(vertical = 6.dp),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End
            ) {
                Text("100%", color = SlateGray, fontSize = 8.sp)
                Text("50%", color = SlateGray, fontSize = 8.sp)
                Text("0%", color = SlateGray, fontSize = 8.sp)
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Graph Canvas
            Canvas(modifier = Modifier.weight(1f).fillMaxHeight()) {
                val graphHeight = size.height - 10.dp.toPx()
                val dayWidth = size.width / weeklyReport.size
                val barWidth = 8.dp.toPx()

                // Baseline
                drawLine(
                    color = SlateGray.copy(alpha = 0.3f),
                    start = Offset(0f, graphHeight),
                    end = Offset(size.width, graphHeight),
                    strokeWidth = 1.dp.toPx()
                )

                // Gridlines
                val gridLines = listOf(0.0f, 0.5f, 1.0f)
                gridLines.forEach { scale ->
                    val y = graphHeight - (graphHeight * scale)
                    drawLine(
                        color = Color.White.copy(alpha = 0.03f),
                        start = Offset(0f, y),
                        end = Offset(size.width, y),
                        strokeWidth = 1.dp.toPx()
                    )
                }

                weeklyReport.forEachIndexed { index, item ->
                    val xCenter = index * dayWidth + dayWidth / 2f

                    // Recovery (Green)
                    val recHeight = (item.nutritionScore / 100f) * graphHeight
                    val recY = graphHeight - recHeight
                    drawRect(
                        color = FluorescentGreen,
                        topLeft = Offset(xCenter - barWidth / 2f, recY),
                        size = Size(barWidth, recHeight)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // X-Axis Labels Row
        Row(
            modifier = Modifier.fillMaxWidth().padding(start = 40.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            weeklyReport.forEach { item ->
                Text(
                    text = item.day,
                    color = TextGray,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.width(32.dp)
                )
            }
        }
    }
}
