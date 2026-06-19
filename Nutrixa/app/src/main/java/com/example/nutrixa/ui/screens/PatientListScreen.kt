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
import com.example.nutrixa.data.Patient
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientListScreen(
    apiService: ApiService,
    onSelectPatient: (Patient) -> Unit,
    onRegisterPatient: () -> Unit
) {
    var patients by remember { mutableStateOf<List<Patient>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var searchTerm by remember { mutableStateOf("") }
    
    val scope = rememberCoroutineScope()

    fun loadData() {
        loading = true
        error = null
        scope.launch {
            apiService.getAllPatients()
                .onSuccess { list ->
                    patients = list
                }
                .onFailure { err ->
                    error = err.message ?: "Failed to sync clinical patient directory."
                }
            loading = false
        }
    }

    LaunchedEffect(Unit) {
        loadData()
    }

    val filteredPatients = patients.filter { p ->
        p.patientName.contains(searchTerm, ignoreCase = true) ||
        p.cancerType.contains(searchTerm, ignoreCase = true) ||
        p.stage.contains(searchTerm, ignoreCase = true)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🗄️ CLINICAL PATIENT DIRECTORY",
                        color = NeonCyan,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                },
                actions = {
                    IconButton(onClick = { loadData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = NeonCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkNavy)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onRegisterPatient,
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
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Review, coordinate, and select patient profiles for active nutrition monitoring",
                    color = TextGray,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )

                // Search Box
                OutlinedTextField(
                    value = searchTerm,
                    onValueChange = { searchTerm = it },
                    placeholder = {
                        Text(
                            text = "Search by patient name, cancer type, or stage...",
                            color = Color.Gray,
                            fontSize = 12.sp
                        )
                    },
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

                if (loading && patients.isEmpty()) {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = NeonCyan)
                    }
                } else if (error != null) {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text(text = "⚠️ $error", color = AlertRed, fontSize = 13.sp, textAlign = TextAlign.Center)
                    }
                } else if (filteredPatients.isEmpty()) {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text(
                            text = "No oncology clinical profiles match your search criteria.",
                            color = TextGray,
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 24.dp)
                    ) {
                        items(filteredPatients) { p ->
                            PatientDirectoryCard(patient = p, onMonitor = { onSelectPatient(p) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PatientDirectoryCard(patient: Patient, onMonitor: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardGlassBorder, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = CardGlass)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Circle initials
                Box(
                    modifier = Modifier
                        .size(36.dp)
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
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = patient.patientName,
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
                        modifier = Modifier.padding(top = 1.dp)
                    )
                }
            }

            // Stats grid row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SlateGray.copy(alpha = 0.05f), RoundedCornerShape(8.dp))
                    .border(1.dp, Color.White.copy(alpha = 0.03f), RoundedCornerShape(8.dp))
                    .padding(8.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Adherence", color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Text("${patient.energy}%", color = FluorescentGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Hydration", color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Text("${patient.hydration}%", color = NeonCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Recovery", color = TextGray, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Text("${patient.recovery}%", color = NeonPurple, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Action button
            Button(
                onClick = onMonitor,
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(vertical = 10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "🧬 Select & Monitor Patient Node",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
    }
}
