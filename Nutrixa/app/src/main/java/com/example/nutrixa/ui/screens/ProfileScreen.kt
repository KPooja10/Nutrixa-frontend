package com.example.nutrixa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nutrixa.data.User
import com.example.nutrixa.ui.theme.*

@Composable
fun ProfileScreen(
    user: User?,
    onLogout: () -> Unit
) {
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
                    text = "User Profile & Settings",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Manage clinical credentials and system session parameters",
                    color = TextGray,
                    fontSize = 10.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }

        // Profile main details Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Avatar view
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .background(NeonCyan, CircleShape)
                            .border(2.dp, NeonCyan, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = user?.username?.take(1)?.uppercase() ?: "U",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp
                        )
                    }

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = user?.username ?: "Physician User",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${user?.role?.uppercase() ?: "CLINICIAN"} NODE",
                            color = NeonCyan,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }

                    HorizontalDivider(color = SlateGray.copy(alpha = 0.2f))

                    // Detail rows list
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        DetailRow(
                            label = "Network Authorization",
                            value = if (user?.role == "doctor") "Clinical Coordinator" else "Patient Portal Access"
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Authentication Status",
                                color = TextGray,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(modifier = Modifier.size(6.dp).background(FluorescentGreen, CircleShape))
                                Text(
                                    text = "Session Active",
                                    color = FluorescentGreen,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        DetailRow(
                            label = "Secured Node Protocol",
                            value = "SHA-256 / AES-GCM Encrypted"
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = onLogout,
                        colors = ButtonDefaults.buttonColors(containerColor = AlertRed.copy(alpha = 0.15f)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, AlertRed.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(vertical = 12.dp)
                    ) {
                        Text("🔒 Terminate Session", color = AlertRed, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Safety Guidelines Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardGlassBorder.copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
                colors = CardDefaults.cardColors(containerColor = CardGlass)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Clinical Safety Guidelines", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(
                        text = "You are currently logged into the Predictive Oncology Nutrition Intelligence System (PONIS) clinical monitoring database. All modifications, checks, checklist updates, and registrations are recorded and logged under hospital safety compliance registries.",
                        color = TextGray,
                        fontSize = 10.sp,
                        lineHeight = 15.sp
                    )
                }
            }
        }
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label.uppercase(), color = TextGray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        Text(value, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}
