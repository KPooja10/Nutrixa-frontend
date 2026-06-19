package com.example.nutrixa.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.nutrixa.data.*
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch
import org.json.JSONObject

@Composable
fun AIFaceAnalysisScreen(
    apiService: ApiService,
    currentPatient: PatientDetail?,
    onNavigate: (String) -> Unit
) {
    var scanning by remember { mutableStateOf(false) }
    var scanResult by remember { mutableStateOf<JSONObject?>(null) }
    var capturedBitmap by remember { mutableStateOf<Bitmap?>(null) }

    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    val infiniteTransition = rememberInfiniteTransition(label = "BiometricsLaser")
    val laserOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "LaserOffset"
    )

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            capturedBitmap = bitmap
            scanResult = null
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            cameraLauncher.launch(null)
        } else {
            android.widget.Toast.makeText(
                context,
                "Camera permission is required to analyze face biometrics.",
                android.widget.Toast.LENGTH_LONG
            ).show()
        }
    }

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
        item {
            Column {
                Text(
                    text = "👤 AI Biometric Face Analyzer",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Hold still to scan node biometrics for treatment stress index and fatigue tracking.",
                    color = TextGray,
                    fontSize = 10.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }

        // Viewfinder Card
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
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Facial Scanner Telemetry Input",
                        color = TextGray,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Viewfinder Box
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .background(Color.Black, RoundedCornerShape(12.dp))
                            .border(1.dp, if (scanning) NeonPurple else Color.DarkGray, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        capturedBitmap?.let { bitmap ->
                            Image(
                                bitmap = bitmap.asImageBitmap(),
                                contentDescription = "Captured Face",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }

                        if (scanning) {
                            Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.4f)))
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val y = size.height * laserOffset
                                drawLine(
                                    brush = Brush.horizontalGradient(
                                        colors = listOf(Color.Transparent, NeonPurple, NeonCyan, NeonPurple, Color.Transparent)
                                    ),
                                    start = Offset(0f, y),
                                    end = Offset(size.width, y),
                                    strokeWidth = 3.dp.toPx()
                                )

                                // Draw simulated biometric grid overlay points
                                val pts = listOf(
                                    Offset(0.35f, 0.38f), Offset(0.65f, 0.38f),
                                    Offset(0.5f, 0.5f),
                                    Offset(0.42f, 0.65f), Offset(0.58f, 0.65f),
                                    Offset(0.5f, 0.3f), Offset(0.3f, 0.5f), Offset(0.7f, 0.5f)
                                )
                                pts.forEach { pt ->
                                    drawCircle(
                                        color = NeonCyan,
                                        radius = 4.dp.toPx(),
                                        center = Offset(size.width * pt.x, size.height * pt.y)
                                    )
                                }
                            }
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                CircularProgressIndicator(color = NeonPurple, modifier = Modifier.size(32.dp))
                                Text(
                                    text = "📡 Calibrating Biometric Mesh Matrix...",
                                    color = NeonPurple,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        } else if (scanResult != null) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.5f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "🧬 Biometric Grid Scan Active\n[Telemetry Feed Online]\n\n✓ MESH LOCK ESTABLISHED",
                                    color = NeonPurple,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center
                                )
                            }
                        } else if (capturedBitmap == null) {
                            Text(
                                text = "FACIAL SCANNER TELEMETRY ACTIVE\n(Capture face photo to scan biometrics)",
                                color = Color.Gray,
                                fontSize = 11.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    if (capturedBitmap == null) {
                        Button(
                            onClick = {
                                val hasPermission = ContextCompat.checkSelfPermission(
                                    context,
                                    Manifest.permission.CAMERA
                                ) == PackageManager.PERMISSION_GRANTED

                                if (hasPermission) {
                                    cameraLauncher.launch(null)
                                } else {
                                    permissionLauncher.launch(Manifest.permission.CAMERA)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = NeonPurple),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("📷 Capture Face Photo", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    } else {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    scanning = true
                                    scanResult = null
                                    scope.launch {
                                        apiService.scanFace()
                                            .onSuccess { obj ->
                                                scanResult = obj
                                            }
                                        scanning = false
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                                shape = RoundedCornerShape(10.dp),
                                enabled = !scanning,
                                modifier = Modifier.weight(1.5f)
                            ) {
                                Text("🔮 Run Biometric Analysis", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }

                            Button(
                                onClick = {
                                    capturedBitmap = null
                                    scanResult = null
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = SlateGray.copy(alpha = 0.15f)),
                                shape = RoundedCornerShape(10.dp),
                                enabled = !scanning,
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("🔄 Retake", color = TextGray, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // Metrics Read-out Card
        if (scanResult != null) {
            val result = scanResult!!
            val fatigue = result.optInt("fatigue", 50)
            val stress = result.optInt("stress", 50)
            val hydration = result.optInt("hydration", 50)
            val recovery = result.optInt("recovery", 50)
            val indicators = result.optJSONObject("biometricIndicators") ?: JSONObject()

            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardGlassBorder.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardGlass)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text(
                            text = "🧬 FACE METRICS BIO-INDEX",
                            color = NeonPurple,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )

                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            BioIndexItem(label = "Fatigue Coefficient", value = fatigue, color = AlertRed)
                            BioIndexItem(label = "Treatment Stress Index", value = stress, color = AlertOrange)
                            BioIndexItem(label = "Cellular Hydration Level", value = hydration, color = Color(0xFF3B82F6))
                            BioIndexItem(label = "Oncology Recovery Index", value = recovery, color = FluorescentGreen)
                        }

                        HorizontalDivider(color = SlateGray.copy(alpha = 0.2f))

                        Text(
                            text = "🔬 Cellular Micro Indicators",
                            color = TextGray,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Card(
                                modifier = Modifier
                                    .weight(1f)
                                    .border(1.dp, CardGlassBorder.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                                colors = CardDefaults.cardColors(containerColor = CardGlass)
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("Eye Strain", color = TextGray, fontSize = 8.sp)
                                    Text(
                                        text = indicators.optString("eyeStrain", "Moderate"),
                                        color = Color.White,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Card(
                                modifier = Modifier
                                    .weight(1f)
                                    .border(1.dp, CardGlassBorder.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                                colors = CardDefaults.cardColors(containerColor = CardGlass)
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("Skin Index", color = TextGray, fontSize = 8.sp)
                                    Text(
                                        text = indicators.optString("skinHydrationIndex", "Hydrated"),
                                        color = Color.White,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(NeonCyan.copy(alpha = 0.05f), RoundedCornerShape(12.dp))
                                .border(1.dp, NeonCyan.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = result.optString("clinicalNote", ""),
                                color = Color.White.copy(alpha = 0.9f),
                                fontSize = 10.sp,
                                lineHeight = 14.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BioIndexItem(label: String, value: Int, color: Color) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = label, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
            Text(text = "$value%", color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = { value / 100f },
            color = color,
            trackColor = SlateGray.copy(alpha = 0.15f),
            modifier = Modifier.fillMaxWidth().height(4.dp),
            strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        )
    }
}
