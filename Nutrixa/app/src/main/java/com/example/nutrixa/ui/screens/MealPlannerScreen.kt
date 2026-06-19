package com.example.nutrixa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.*
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MealPlannerScreen(
    apiService: ApiService,
    currentPatient: PatientDetail?,
    onNavigate: (String) -> Unit
) {
    var meals by remember { mutableStateOf<List<Meal>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var actionLoading by remember { mutableStateOf(false) }
    
    // Add form fields
    var showAddForm by remember { mutableStateOf(false) }
    var newMealType by remember { mutableStateOf("breakfast") }
    var newMealName by remember { mutableStateOf("") }
    var newNutritionScore by remember { mutableStateOf("85") }

    val scope = rememberCoroutineScope()

    fun loadMeals() {
        if (currentPatient == null) return
        loading = true
        scope.launch {
            apiService.getMealsByPatient(currentPatient.id)
                .onSuccess { list ->
                    meals = list
                }
            loading = false
        }
    }

    LaunchedEffect(currentPatient) {
        loadMeals()
    }

    if (currentPatient == null) {
        NoPatientPlaceholder(onBrowse = { onNavigate("patients") })
        return
    }

    val completedCount = meals.count { it.completed == 1 }
    val adherenceRate = if (meals.isNotEmpty()) {
        (completedCount * 100) / meals.size
    } else 100

    val periodTypes = listOf(
        Triple("early_morning", "🌅 Early Morning Nutrition", "06:00 - 07:00"),
        Triple("breakfast", "🍳 Breakfast Planner", "08:30 - 09:30"),
        Triple("snacks", "🍇 Snacks Planner", "11:00 - 11:30"),
        Triple("lunch", "🍱 Lunch Planner", "13:00 - 14:00"),
        Triple("evening_drink", "🥤 Evening Drink Planner", "16:30 - 17:00"),
        Triple("dinner", "🍲 Dinner Planner", "19:30 - 20:30")
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
    ) {
        // Title block
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Oncology Nutrition & Meal Planner",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Configure six daily therapeutic meal profiles and track interactive completions.",
                        color = TextGray,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Button(
                    onClick = { showAddForm = true },
                    colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("➕ Plan Item", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Adherence Tracker Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Meal Completion Tracker", color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            Text(
                                text = "$completedCount of ${meals.size} Completed",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text("$adherenceRate% Adherence", color = NeonCyan, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }

                    LinearProgressIndicator(
                        progress = { adherenceRate / 100f },
                        color = NeonCyan,
                        trackColor = SlateGray.copy(alpha = 0.15f),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                    )
                }
            }
        }

        // 6-Slot Meal Window List
        periodTypes.forEach { (typeKey, typeLabel, typeTime) ->
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardGlassBorder.copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass)
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(typeLabel, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text(typeTime, color = SlateGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }

                        val periodMeals = meals.filter { it.type == typeKey }
                        if (periodMeals.isEmpty()) {
                            Text(
                                text = "No specialized items planned.",
                                color = TextGray,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        } else {
                            periodMeals.forEach { meal ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(
                                            if (meal.completed == 1) FluorescentGreen.copy(alpha = 0.05f)
                                            else SlateGray.copy(alpha = 0.05f),
                                            RoundedCornerShape(10.dp)
                                        )
                                        .border(
                                            1.dp,
                                            if (meal.completed == 1) FluorescentGreen.copy(alpha = 0.15f)
                                            else SlateGray.copy(alpha = 0.15f),
                                            RoundedCornerShape(10.dp)
                                        )
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Checkbox(
                                            checked = meal.completed == 1,
                                            onCheckedChange = { isChecked ->
                                                actionLoading = true
                                                scope.launch {
                                                    apiService.toggleMeal(meal.id, isChecked)
                                                    loadMeals()
                                                    actionLoading = false
                                                }
                                            },
                                            colors = CheckboxDefaults.colors(
                                                checkedColor = FluorescentGreen,
                                                uncheckedColor = Color.Gray,
                                                checkmarkColor = Color.Black
                                            ),
                                            enabled = !actionLoading
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Column {
                                            Text(
                                                text = meal.mealName,
                                                color = if (meal.completed == 1) TextGray else Color.White,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp
                                            )
                                            Text(
                                                text = "Nutrient Weight: ${meal.energy}",
                                                color = TextGray,
                                                fontSize = 9.sp
                                            )
                                        }
                                    }
                                    StatusBadge(status = if (meal.completed == 1) "Completed" else "Missed")
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // dialog for add meal form
    if (showAddForm) {
        val windowOptions = listOf(
            "early_morning" to "Early Morning Nutrition",
            "breakfast" to "Breakfast Planner",
            "snacks" to "Snacks Planner",
            "lunch" to "Lunch Planner",
            "evening_drink" to "Evening Drink Planner",
            "dinner" to "Dinner Planner"
        )
        var dropdownExpanded by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { showAddForm = false },
            title = { Text("New Nutrition Window Entry", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Dropdown simulation
                    Column {
                        Text("Nutrition Window", color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp)
                                .border(1.dp, SlateGray, RoundedCornerShape(8.dp))
                                .clickable { dropdownExpanded = true }
                                .padding(12.dp)
                        ) {
                            Text(
                                text = windowOptions.find { it.first == newMealType }?.second ?: "Select Option",
                                color = Color.White,
                                fontSize = 12.sp
                            )
                        }
                        DropdownMenu(
                            expanded = dropdownExpanded,
                            onDismissRequest = { dropdownExpanded = false },
                            modifier = Modifier.background(DarkNavy)
                        ) {
                            windowOptions.forEach { (key, label) ->
                                DropdownMenuItem(
                                    text = { Text(label, color = Color.White) },
                                    onClick = {
                                        newMealType = key
                                        dropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    // Score Input
                    Column {
                        Text("Target Nutrient Rating (0-100)", color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = newNutritionScore,
                            onValueChange = { newNutritionScore = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NeonCyan,
                                unfocusedBorderColor = SlateGray,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                        )
                    }

                    // Name Input
                    Column {
                        Text("Therapeutic Food Description", color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = newMealName,
                            onValueChange = { newMealName = it },
                            placeholder = { Text("e.g. Ginger Infusion Tea", color = Color.Gray, fontSize = 12.sp) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NeonCyan,
                                unfocusedBorderColor = SlateGray,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val score = newNutritionScore.toIntOrNull() ?: 85
                        if (newMealName.isNotEmpty()) {
                            actionLoading = true
                            scope.launch {
                                apiService.createMeal(currentPatient.id, newMealType, newMealName, score)
                                loadMeals()
                                newMealName = ""
                                showAddForm = false
                                actionLoading = false
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                    enabled = !actionLoading && newMealName.isNotEmpty()
                ) {
                    Text("Add to Active Schedule", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddForm = false }) {
                    Text("Cancel", color = Color.Gray)
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }
}

@Composable
fun StatusBadge(status: String) {
    val (bg, text) = when (status.lowercase()) {
        "completed" -> Pair(FluorescentGreen.copy(alpha = 0.15f), FluorescentGreen)
        else -> Pair(AlertRed.copy(alpha = 0.15f), AlertRed)
    }

    Box(
        modifier = Modifier
            .background(bg, RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = status.uppercase(),
            color = text,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black
        )
    }
}
