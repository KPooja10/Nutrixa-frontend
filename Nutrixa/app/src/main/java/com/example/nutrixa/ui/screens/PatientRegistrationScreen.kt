package com.example.nutrixa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientRegistrationScreen(
    apiService: ApiService,
    onBack: () -> Unit,
    onRegistrationSuccess: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var cancerType by remember { mutableStateOf("Breast Cancer") }
    var stage by remember { mutableStateOf("Stage I") }
    
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }

    val cancerTypes = listOf(
        "Breast Cancer", "Lung Cancer", "Colorectal Cancer", 
        "Leukemia", "Prostate Cancer", "Pancreatic Cancer", "Ovarian Cancer"
    )
    val stages = listOf("Stage I", "Stage II", "Stage III", "Stage IV")

    var cancerDropdownExpanded by remember { mutableStateOf(false) }
    var stageDropdownExpanded by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "PATIENT INTAKE TERMINAL",
                        color = NeonCyan,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = NeonCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkNavy)
            )
        },
        containerColor = DarkNavy
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(DarkNavy)
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Register new clinical nodes to system tracking metrics",
                    color = TextGray,
                    fontSize = 12.sp
                )

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardGlassBorder, RoundedCornerShape(24.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        if (error != null) {
                            Text(
                                text = "⚠️ $error",
                                color = AlertRed,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(AlertRed.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                                    .padding(8.dp)
                            )
                        }

                        // Full Name Input
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "PATIENT DEMOGRAPHICS - FULL NAME",
                                color = TextGray,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            OutlinedTextField(
                                value = name,
                                onValueChange = { name = it },
                                placeholder = { Text("Enter patient full name", color = Color.Gray, fontSize = 14.sp) },
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NeonCyan,
                                    unfocusedBorderColor = SlateGray,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        // Age Input
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "AGE (YEARS)",
                                color = TextGray,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            OutlinedTextField(
                                value = age,
                                onValueChange = { age = it },
                                placeholder = { Text("e.g. 58", color = Color.Gray, fontSize = 14.sp) },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NeonCyan,
                                    unfocusedBorderColor = SlateGray,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        // Cancer Type Dropdown Selection
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "CANCER CLASSIFICATION TYPE",
                                color = TextGray,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Box(modifier = Modifier.fillMaxWidth()) {
                                OutlinedTextField(
                                    value = cancerType,
                                    onValueChange = {},
                                    readOnly = true,
                                    trailingIcon = {
                                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = cancerDropdownExpanded)
                                    },
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = NeonCyan,
                                        unfocusedBorderColor = SlateGray,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White
                                    ),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { cancerDropdownExpanded = true }
                                )
                                // Transparent overlay click catcher
                                Box(
                                    modifier = Modifier
                                        .matchParentSize()
                                        .clickable { cancerDropdownExpanded = true }
                                )
                                DropdownMenu(
                                    expanded = cancerDropdownExpanded,
                                    onDismissRequest = { cancerDropdownExpanded = false },
                                    modifier = Modifier
                                        .fillMaxWidth(0.8f)
                                        .background(Color(0xFF1E293B))
                                ) {
                                    cancerTypes.forEach { item ->
                                        DropdownMenuItem(
                                            text = { Text(item, color = Color.White) },
                                            onClick = {
                                                cancerType = item
                                                cancerDropdownExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        // Clinical Staging Dropdown Selection
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "CLINICAL PATHOLOGICAL STAGING",
                                color = TextGray,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Box(modifier = Modifier.fillMaxWidth()) {
                                OutlinedTextField(
                                    value = stage,
                                    onValueChange = {},
                                    readOnly = true,
                                    trailingIcon = {
                                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = stageDropdownExpanded)
                                    },
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = NeonCyan,
                                        unfocusedBorderColor = SlateGray,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White
                                    ),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { stageDropdownExpanded = true }
                                )
                                // Transparent overlay click catcher
                                Box(
                                    modifier = Modifier
                                        .matchParentSize()
                                        .clickable { stageDropdownExpanded = true }
                                )
                                DropdownMenu(
                                    expanded = stageDropdownExpanded,
                                    onDismissRequest = { stageDropdownExpanded = false },
                                    modifier = Modifier
                                        .fillMaxWidth(0.8f)
                                        .background(Color(0xFF1E293B))
                                ) {
                                    stages.forEach { item ->
                                        DropdownMenuItem(
                                            text = { Text(item, color = Color.White) },
                                            onClick = {
                                                stage = item
                                                stageDropdownExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Submit Intake Button
                        Button(
                            onClick = {
                                val parsedAge = age.toIntOrNull()
                                if (name.isBlank() || parsedAge == null) {
                                    error = "Please provide all demographics and staging data."
                                    return@Button
                                }
                                loading = true
                                error = null
                                scope.launch {
                                    apiService.createPatient(name, parsedAge, cancerType, stage)
                                        .onSuccess {
                                            onRegistrationSuccess()
                                        }
                                        .onFailure { err ->
                                            error = err.message ?: "Failed to record patient registration."
                                        }
                                    loading = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Unspecified),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .background(
                                    Brush.horizontalGradient(listOf(NeonCyan, Color(0xFF2563EB))),
                                    RoundedCornerShape(12.dp)
                                ),
                            shape = RoundedCornerShape(12.dp),
                            enabled = !loading
                        ) {
                            if (loading) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                            } else {
                                Text("Complete Intake & Sync Database", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
