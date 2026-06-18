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
fun WeeklyProgressReportScreen(
    apiService: ApiService,
    currentPatient: PatientDetail?,
    onNavigate: (String) -> Unit
) {
    var weeklyReport by remember { mutableStateOf<List<WeeklyReportItem>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun loadData() {
        if (currentPatient == null) return
        loading = true
        scope.launch {
            apiService.getPatientAnalytics(currentPatient.id)
                .onSuccess { res ->
                    weeklyReport = res.weeklyReport
                }
            loading = false
        }
    }

    LaunchedEffect(currentPatient) {
        loadData()
    }

    if (currentPatient == null) {
        NoPatientPlaceholder(onBrowse = { onNavigate("patients") })
        return
    }

    val averageNutrition = if (weeklyReport.isNotEmpty()) {
        weeklyReport.sumOf { it.nutritionScore } / weeklyReport.size
    } else 75

    val averageHydration = if (weeklyReport.isNotEmpty()) {
        weeklyReport.sumOf { it.hydration } / weeklyReport.size
    } else 80

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
                    text = "📋 Weekly Progress Report",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Weekly compliance summaries, statistics, and daily meal metrics",
                    color = TextGray,
                    fontSize = 10.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }

        if (loading && weeklyReport.isEmpty()) {
            item {
                Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonCyan)
                }
            }
        } else {
            // Averages grid
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .border(1.dp, CardGlassBorder.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                            colors = CardDefaults.cardColors(containerColor = CardGlass)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("WEEKLY NUTRITION AVERAGE", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text("$averageNutrition% Adherence", color = NeonCyan, fontSize = 13.sp, fontWeight = FontWeight.Black)
                            }
                        }

                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .border(1.dp, CardGlassBorder.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                            colors = CardDefaults.cardColors(containerColor = CardGlass)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("WEEKLY HYDRATION AVERAGE", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text("$averageHydration% Volume", color = Color(0xFF3B82F6), fontSize = 13.sp, fontWeight = FontWeight.Black)
                            }
                        }
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, CardGlassBorder.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                        colors = CardDefaults.cardColors(containerColor = CardGlass)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("TREATMENT PATH INTEGRITY", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("OPTIMAL PLATEAU", color = FluorescentGreen, fontSize = 14.sp, fontWeight = FontWeight.Black)
                        }
                    }
                }
            }

            // Compliance bar chart card
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Column {
                            Text("Daily Meal Compliance Ratio", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("Completed (Green) vs Missed (Red) meals daily slots", color = TextGray, fontSize = 9.sp)
                        }

                        DailyMealComplianceChart(weeklyReport = weeklyReport)
                    }
                }
            }
        }
    }
}

@Composable
fun DailyMealComplianceChart(weeklyReport: List<WeeklyReportItem>) {
    if (weeklyReport.isEmpty()) {
        Box(modifier = Modifier.fillMaxWidth().height(180.dp), contentAlignment = Alignment.Center) {
            Text("No weekly compliance log points detected.", color = Color.Gray, fontSize = 11.sp)
        }
        return
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
                .padding(vertical = 8.dp)
        ) {
            val spacing = 10.dp.toPx()
            val barWidth = 6.dp.toPx()
            val graphHeight = size.height - 20.dp.toPx()
            val maxMeals = 6f
            val daysCount = weeklyReport.size
            val blockWidth = (size.width - spacing * 2) / daysCount

            // Draw baseline
            drawLine(
                color = SlateGray.copy(alpha = 0.3f),
                start = Offset(0f, graphHeight),
                end = Offset(size.width, graphHeight),
                strokeWidth = 1.dp.toPx()
            )

            // Draw grid lines
            for (i in 1..5) {
                val y = (graphHeight / 6f) * i
                drawLine(
                    color = Color.White.copy(alpha = 0.03f),
                    start = Offset(0f, y),
                    end = Offset(size.width, y),
                    strokeWidth = 1.dp.toPx()
                )
            }

            weeklyReport.forEachIndexed { index, item ->
                val xCenter = spacing + index * blockWidth + blockWidth / 2f
                val completed = (item.adherence / 100f * 6f).coerceIn(0f, 6f)
                val missed = 6f - completed

                // Completed height
                val compHeight = (completed / maxMeals) * graphHeight
                val compY = graphHeight - compHeight

                // Missed height
                val missHeight = (missed / maxMeals) * graphHeight
                val missY = graphHeight - missHeight

                // Draw Completed Rect (Green)
                if (compHeight > 0f) {
                    drawRect(
                        color = FluorescentGreen,
                        topLeft = Offset(xCenter - barWidth - 2.dp.toPx(), compY),
                        size = Size(barWidth, compHeight)
                    )
                }

                // Draw Missed Rect (Red)
                if (missHeight > 0f) {
                    drawRect(
                        color = AlertRed,
                        topLeft = Offset(xCenter + 2.dp.toPx(), missY),
                        size = Size(barWidth, missHeight)
                    )
                }
            }
        }

        // Labels Row below graph
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            weeklyReport.forEach { item ->
                Text(
                    text = item.day,
                    color = TextGray,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.width(32.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Legend
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.size(8.dp).background(FluorescentGreen, RoundedCornerShape(2.dp)))
            Spacer(modifier = Modifier.width(4.dp))
            Text("Completed Meals", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.width(16.dp))
            Box(modifier = Modifier.size(8.dp).background(AlertRed, RoundedCornerShape(2.dp)))
            Spacer(modifier = Modifier.width(4.dp))
            Text("Missed Meals", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
        }
    }
}
