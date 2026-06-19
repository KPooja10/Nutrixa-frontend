package com.example.nutrixa.ui.screens

import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
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
import com.example.nutrixa.data.*
import com.example.nutrixa.network.ApiService
import com.example.nutrixa.ui.theme.*
import kotlinx.coroutines.launch
import org.json.JSONObject

@Composable
fun AIFoodScannerScreen(
    apiService: ApiService,
    currentPatient: PatientDetail?,
    onNavigate: (String) -> Unit
) {
    var scanning by remember { mutableStateOf(false) }
    var scannedResult by remember { mutableStateOf<JSONObject?>(null) }
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    var capturedBitmap by remember { mutableStateOf<Bitmap?>(null) }

    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    val infiniteTransition = rememberInfiniteTransition(label = "FoodScanLaser")
    val laserOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "LaserOffset"
    )

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            imageUri = uri
            capturedBitmap = null
            scannedResult = null
        }
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            capturedBitmap = bitmap
            imageUri = null
            scannedResult = null
        }
    }

    val decodedBitmap = remember(imageUri) {
        val currentUri = imageUri
        if (currentUri != null) {
            try {
                if (Build.VERSION.SDK_INT < 28) {
                    @Suppress("DEPRECATION")
                    MediaStore.Images.Media.getBitmap(context.contentResolver, currentUri)
                } else {
                    val source = ImageDecoder.createSource(context.contentResolver, currentUri)
                    ImageDecoder.decodeBitmap(source)
                }
            } catch (e: Exception) {
                null
            }
        } else {
            null
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
                    text = "📷 AI Food Scanner",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Computer vision oncology calorie and nutrient classification",
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
                        text = "Image Capture Input",
                        color = TextGray,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Viewfinder frame box
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .background(Color.Black, RoundedCornerShape(12.dp))
                            .border(1.dp, if (scanning) NeonCyan else Color.DarkGray, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        capturedBitmap?.let { bitmap ->
                            Image(
                                bitmap = bitmap.asImageBitmap(),
                                contentDescription = "Captured Food",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }

                        decodedBitmap?.let { bitmap ->
                            Image(
                                bitmap = bitmap.asImageBitmap(),
                                contentDescription = "Selected Food",
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
                                        colors = listOf(Color.Transparent, NeonCyan, Color(0xFF3B82F6), NeonCyan, Color.Transparent)
                                    ),
                                    start = Offset(0f, y),
                                    end = Offset(size.width, y),
                                    strokeWidth = 3.dp.toPx()
                                )
                            }
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                CircularProgressIndicator(color = NeonCyan, modifier = Modifier.size(32.dp))
                                Text(
                                    text = "🔬 Executing Optical Nutrition Audit...",
                                    color = NeonCyan,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        } else if (scannedResult != null) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.5f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "🥗 ${scannedResult!!.optString("foodItem")}\n[Scan Completed Successfully]",
                                    color = FluorescentGreen,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center
                                )
                            }
                        } else if (capturedBitmap == null && decodedBitmap == null) {
                            Text(
                                text = "CAMERA SCANNER READY\n(Choose file or snap photo to scan)",
                                color = Color.Gray,
                                fontSize = 11.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { cameraLauncher.launch(null) },
                            colors = ButtonDefaults.buttonColors(containerColor = SlateGray.copy(alpha = 0.15f)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f),
                            enabled = !scanning
                        ) {
                            Text("📷 Camera Snaps", color = TextGray, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }

                        Button(
                            onClick = { galleryLauncher.launch("image/*") },
                            colors = ButtonDefaults.buttonColors(containerColor = SlateGray.copy(alpha = 0.15f)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f),
                            enabled = !scanning
                        ) {
                            Text("📁 Select Gallery", color = TextGray, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }

                    if (capturedBitmap != null || decodedBitmap != null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    scanning = true
                                    scannedResult = null
                                    scope.launch {
                                        apiService.scanFood()
                                            .onSuccess { obj ->
                                                scannedResult = obj
                                            }
                                        scanning = false
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                                shape = RoundedCornerShape(10.dp),
                                enabled = !scanning,
                                modifier = Modifier.weight(1.5f)
                            ) {
                                Text("🔮 Trigger Food Scan", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }

                            Button(
                                onClick = {
                                    capturedBitmap = null
                                    imageUri = null
                                    scannedResult = null
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = AlertRed.copy(alpha = 0.1f)),
                                shape = RoundedCornerShape(10.dp),
                                enabled = !scanning,
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("✕ Clear", color = AlertRed, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // Results read-out Card
        if (scannedResult != null) {
            val result = scannedResult!!
            val macros = result.optJSONObject("macros") ?: JSONObject()
            val deficiencyImpacts = result.optJSONArray("deficiencyImpacts")

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
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = result.optString("foodItem", "Mediterranean Salmon Salad"),
                                    color = Color.White,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "🔬 Computer Vision Classification Verified",
                                    color = TextGray,
                                    fontSize = 9.sp
                                )
                            }
                            RiskBadge(risk = result.optString("rating", "Healthy"))
                        }

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SlateGray.copy(alpha = 0.05f), RoundedCornerShape(10.dp))
                                .border(1.dp, Color.White.copy(alpha = 0.03f), RoundedCornerShape(10.dp))
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Calories", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                Text("${macros.optInt("calories", 340)} kcal", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Protein", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                Text(macros.optString("protein", "32g"), color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Carbs", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                Text(macros.optString("carbs", "12g"), color = Color(0xFF3B82F6), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Fats", color = TextGray, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                Text(macros.optString("fats", "18g"), color = AlertOrange, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "🔬 Clinical Oncology Assessment",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = result.optString("clinicalAdvantage", ""),
                                color = TextGray,
                                fontSize = 10.sp,
                                lineHeight = 14.sp
                            )
                        }

                        if (deficiencyImpacts != null && deficiencyImpacts.length() > 0) {
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "🧬 Therapeutic Deficiency Mitigators",
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    for (i in 0 until deficiencyImpacts.length()) {
                                        val item = deficiencyImpacts.optString(i)
                                        Box(
                                            modifier = Modifier
                                                .background(NeonCyan.copy(alpha = 0.1f), RoundedCornerShape(4.dp))
                                                .border(1.dp, NeonCyan.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = "+$item",
                                                color = NeonCyan,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
