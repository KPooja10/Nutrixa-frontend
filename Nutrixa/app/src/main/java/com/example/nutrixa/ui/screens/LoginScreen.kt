package com.example.nutrixa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.SessionManager
import com.example.nutrixa.data.User
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    apiService: ApiService,
    sessionManager: SessionManager,
    onLoginSuccess: (User) -> Unit,
    onForgotPassword: () -> Unit
) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    var showUrlDialog by remember { mutableStateOf(false) }
    var backendUrlInput by remember { mutableStateOf(sessionManager.getBackendUrl()) }

    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(DarkNavy, Color(0xFF0F172A))
                )
            )
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        // Glowing Background Overlays
        Box(
            modifier = Modifier
                .size(300.dp)
                .align(Alignment.TopStart)
                .offset(x = (-100).dp, y = (-50).dp)
                .background(NeonCyan.copy(alpha = 0.08f), RoundedCornerShape(150.dp))
        )
        Box(
            modifier = Modifier
                .size(300.dp)
                .align(Alignment.BottomEnd)
                .offset(x = 100.dp, y = 100.dp)
                .background(NeonPurple.copy(alpha = 0.08f), RoundedCornerShape(150.dp))
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Logo Branding
            Text(
                text = "🧬 PONIS",
                color = NeonCyan,
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 2.sp
            )

            Text(
                text = "Clinical Authentication Gateway",
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )

            Text(
                text = "Predictive Oncology Nutrition Intelligence System",
                color = TextGray,
                fontSize = 12.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Glassmorphic Card Panel
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

                    // User Identifier Input
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "USER IDENTIFIER",
                            color = TextGray,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        OutlinedTextField(
                            value = username,
                            onValueChange = { username = it },
                            placeholder = { Text("Enter clinical identifier", color = Color.Gray, fontSize = 14.sp) },
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

                    // Password Input
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "PASSWORD",
                                color = TextGray,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "Forgot?",
                                color = NeonCyan,
                                fontSize = 12.sp,
                                modifier = Modifier.clickable { onForgotPassword() }
                            )
                        }
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            placeholder = { Text("••••••••••••", color = Color.Gray, fontSize = 14.sp) },
                            singleLine = true,
                            visualTransformation = PasswordVisualTransformation(),
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

                    Spacer(modifier = Modifier.height(4.dp))

                    // Login Action Button
                    Button(
                        onClick = {
                            if (username.isBlank() || password.isBlank()) {
                                error = "Please enter both credentials"
                                return@Button
                            }
                            loading = true
                            error = null
                            scope.launch {
                                apiService.login(username, password)
                                    .onSuccess { pair ->
                                        sessionManager.saveSession(pair.first, pair.second)
                                        onLoginSuccess(pair.second)
                                    }
                                    .onFailure { err ->
                                        error = err.message ?: "Network error. Configure URL."
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
                            Text("Authorize & Enter Dashboard", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    // URL Configuration Trigger
                    Text(
                        text = "API Config: ${sessionManager.getBackendUrl()}",
                        color = TextGray.copy(alpha = 0.8f),
                        fontSize = 11.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showUrlDialog = true }
                            .padding(vertical = 4.dp),
                        fontWeight = FontWeight.SemiBold
                    )

                    Divider(color = SlateGray.copy(alpha = 0.4f))

                    // Quick Presets Box
                    Text(
                        text = "Quick Presets (Select for Instant Login)",
                        color = TextGray,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Preset Doctor
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    username = "doctor"
                                    password = "doctor123"
                                },
                            colors = CardDefaults.cardColors(containerColor = CardGlass.copy(alpha = 0.6f)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.3f))
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("🩺 Staff", color = NeonCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Text("doctor / doctor123", color = Color.Gray, fontSize = 9.sp)
                            }
                        }

                        // Preset Patient
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    username = "patient"
                                    password = "patient123"
                                },
                            colors = CardDefaults.cardColors(containerColor = CardGlass.copy(alpha = 0.6f)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, NeonPurple.copy(alpha = 0.3f))
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("🧬 Patient", color = NeonPurple, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Text("patient / patient123", color = Color.Gray, fontSize = 9.sp)
                            }
                        }
                    }
                }
            }
        }
    }

    // Backend URL Configuration Dialog
    if (showUrlDialog) {
        AlertDialog(
            onDismissRequest = { showUrlDialog = false },
            title = { Text("Configure API Server Address", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Specify the address of your Express REST backend server. Use 10.0.2.2 for local emulators or enter physical local IP.", color = TextGray, fontSize = 12.sp)
                    OutlinedTextField(
                        value = backendUrlInput,
                        onValueChange = { backendUrlInput = it },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = SlateGray,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Button(
                        onClick = { backendUrlInput = com.example.nutrixa.network.ApiConstants.BASE_URL },
                        colors = ButtonDefaults.buttonColors(containerColor = SlateGray.copy(alpha = 0.2f)),
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Reset to Deployed Render Backend", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            },

            confirmButton = {
                Button(
                    onClick = {
                        sessionManager.saveBackendUrl(backendUrlInput)
                        showUrlDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NeonCyan)
                ) {
                    Text("Save", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showUrlDialog = false }) {
                    Text("Cancel", color = Color.Gray)
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }
}
