package com.example.nutrixa.network

import com.example.nutrixa.data.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class ApiService(private val sessionManager: SessionManager) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .build()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()


    private fun getBaseUrl(): String {
        return sessionManager.getBackendUrl()
    }

    private fun addHeaders(builder: Request.Builder) {
        builder.addHeader("Content-Type", "application/json")
        val token = sessionManager.getToken()
        if (token != null) {
            builder.addHeader("Authorization", "Bearer $token")
        }
    }

    suspend fun login(username: String, password: String): Result<Pair<String, User>> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/auth/login"
            val bodyJson = JSONObject().apply {
                put("username", username)
                put("password", password)
            }
            val request = Request.Builder()
                .url(url)
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errMsg = try {
                        JSONObject(bodyStr).getString("error")
                    } catch (e: Exception) {
                        "Authentication failed (${response.code})"
                    }
                    return@withContext Result.failure(Exception(errMsg))
                }

                val resObj = JSONObject(bodyStr)
                val token = resObj.getString("token")
                val userObj = resObj.getJSONObject("user")
                val user = User(
                    id = userObj.getInt("id"),
                    username = userObj.getString("username"),
                    role = userObj.getString("role")
                )
                Result.success(Pair(token, user))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(username: String, password: String, role: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/auth/register"
            val bodyJson = JSONObject().apply {
                put("username", username)
                put("password", password)
                put("role", role)
            }
            val request = Request.Builder()
                .url(url)
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errMsg = try {
                        JSONObject(bodyStr).getString("error")
                    } catch (e: Exception) {
                        "Registration failed (${response.code})"
                    }
                    return@withContext Result.failure(Exception(errMsg))
                }
                Result.success("Registration completed successfully")
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllPatients(): Result<List<Patient>> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/patients"
            val builder = Request.Builder().url(url).get()
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to get patients (${response.code})"))
                }
                val arr = JSONArray(bodyStr)
                val list = mutableListOf<Patient>()
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    list.add(
                        Patient(
                            id = obj.getInt("id"),
                            patientName = obj.getString("patientName"),
                            age = obj.getInt("age"),
                            cancerType = obj.getString("cancerType"),
                            stage = obj.getString("stage"),
                            energy = obj.optInt("energy", 75),
                            hydration = obj.optInt("hydration", 75),
                            recovery = obj.optInt("recovery", 75),
                            risk = obj.optString("risk", "Low")
                        )
                    )
                }
                Result.success(list)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPatientById(id: Int): Result<PatientDetail> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/patients/$id"
            val builder = Request.Builder().url(url).get()
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to get patient detail (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                val analyticsObj = obj.getJSONObject("analytics")
                val predictionsObj = obj.getJSONObject("predictions")

                val patientDetail = PatientDetail(
                    id = obj.getInt("id"),
                    patientName = obj.getString("patientName"),
                    age = obj.getInt("age"),
                    cancerType = obj.getString("cancerType"),
                    stage = obj.getString("stage"),
                    analytics = Analytics(
                        id = analyticsObj.optInt("id", -1),
                        patientId = analyticsObj.optInt("patientId", id),
                        energy = analyticsObj.optInt("energy", 75),
                        hydration = analyticsObj.optInt("hydration", 75),
                        recovery = analyticsObj.optInt("recovery", 75),
                        risk = analyticsObj.optString("risk", "Low")
                    ),
                    predictions = Predictions(
                        id = predictionsObj.optInt("id", -1),
                        patientId = predictionsObj.optInt("patientId", id),
                        fatigueRisk = predictionsObj.optString("fatigueRisk", "Low"),
                        recoveryForecast = predictionsObj.optInt("recoveryForecast", 75),
                        deficiencyRisk = predictionsObj.optString("deficiencyRisk", "None"),
                        energyTrend = predictionsObj.optString("energyTrend", "stable"),
                        hydrationTrend = predictionsObj.optString("hydrationTrend", "stable")
                    )
                )
                Result.success(patientDetail)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createPatient(patientName: String, age: Int, cancerType: String, stage: String): Result<Patient> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/patients"
            val bodyJson = JSONObject().apply {
                put("patientName", patientName)
                put("age", age)
                put("cancerType", cancerType)
                put("stage", stage)
            }
            val builder = Request.Builder()
                .url(url)
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errMsg = try {
                        JSONObject(bodyStr).getString("error")
                    } catch (e: Exception) {
                        "Failed to register patient (${response.code})"
                    }
                    return@withContext Result.failure(Exception(errMsg))
                }
                val obj = JSONObject(bodyStr)
                val newPatient = Patient(
                    id = obj.optInt("patientId", obj.optInt("id", 0)),
                    patientName = obj.optString("patientName", patientName),
                    age = obj.optInt("age", age),
                    cancerType = obj.optString("cancerType", cancerType),
                    stage = obj.optString("stage", stage)
                )
                Result.success(newPatient)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMealsByPatient(patientId: Int): Result<List<Meal>> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/meals?patientId=$patientId"
            val builder = Request.Builder().url(url).get()
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to get meals (${response.code})"))
                }
                val arr = JSONArray(bodyStr)
                val list = mutableListOf<Meal>()
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    list.add(
                        Meal(
                            id = obj.getInt("id"),
                            patientId = obj.getInt("patientId"),
                            mealName = obj.getString("mealName"),
                            type = obj.optString("mealType", obj.optString("type", "")),
                            energy = obj.optInt("nutritionScore", obj.optInt("energy", 0)),
                            hydration = obj.optInt("hydration", 0),
                            completed = obj.optInt("completed", 0)
                        )
                    )
                }
                Result.success(list)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createMeal(patientId: Int, mealType: String, mealName: String, nutritionScore: Int): Result<Meal> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/meals"
            val bodyJson = JSONObject().apply {
                put("patientId", patientId)
                put("mealType", mealType)
                put("mealName", mealName)
                put("completed", false)
                put("nutritionScore", nutritionScore)
            }
            val builder = Request.Builder()
                .url(url)
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errMsg = try {
                        JSONObject(bodyStr).getString("error")
                    } catch (e: Exception) {
                        "Failed to plan meal (${response.code})"
                    }
                    return@withContext Result.failure(Exception(errMsg))
                }
                val obj = JSONObject(bodyStr)
                val newMeal = Meal(
                    id = obj.optInt("id", 0),
                    patientId = obj.optInt("patientId", patientId),
                    mealName = obj.optString("mealName", mealName),
                    type = obj.optString("mealType", obj.optString("type", mealType)),
                    energy = obj.optInt("nutritionScore", obj.optInt("energy", nutritionScore)),
                    hydration = obj.optInt("hydration", 0),
                    completed = obj.optInt("completed", 0)
                )
                Result.success(newMeal)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun toggleMeal(mealId: Int, completed: Boolean): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/meals/$mealId/toggle"
            val bodyJson = JSONObject().apply {
                put("completed", completed)
            }
            val builder = Request.Builder()
                .url(url)
                .patch(bodyJson.toString().toRequestBody(jsonMediaType))
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to toggle meal status (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                Result.success(obj.optBoolean("success", true))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getWaterLogs(patientId: Int): Result<List<WaterLog>> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/meals/water?patientId=$patientId"
            val builder = Request.Builder().url(url).get()
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to get water logs (${response.code})"))
                }
                val arr = JSONArray(bodyStr)
                val list = mutableListOf<WaterLog>()
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    list.add(
                        WaterLog(
                            id = obj.getInt("id"),
                            patientId = obj.getInt("patientId"),
                            intake = obj.getInt("intake"),
                            timestamp = obj.optString("timestamp", "")
                        )
                    )
                }
                Result.success(list)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logWater(patientId: Int, intake: Int): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/meals/water"
            val bodyJson = JSONObject().apply {
                put("patientId", patientId)
                put("intake", intake)
            }
            val builder = Request.Builder()
                .url(url)
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to log water intake (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                Result.success(obj.optBoolean("success", true))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPatientAnalytics(patientId: Int): Result<PatientAnalyticsResponse> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/analytics?patientId=$patientId"
            val builder = Request.Builder().url(url).get()
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to get analytics (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                val summaryObj = obj.getJSONObject("summary")
                val reportArr = obj.getJSONArray("weeklyReport")

                val summary = Analytics(
                    id = summaryObj.optInt("id", -1),
                    patientId = summaryObj.optInt("patientId", patientId),
                    energy = summaryObj.optInt("energy", 75),
                    hydration = summaryObj.optInt("hydration", 75),
                    recovery = summaryObj.optInt("recovery", 75),
                    risk = summaryObj.optString("risk", "Low")
                )

                val report = mutableListOf<WeeklyReportItem>()
                for (i in 0 until reportArr.length()) {
                    val rObj = reportArr.getJSONObject(i)
                    report.add(
                        WeeklyReportItem(
                            day = rObj.getString("day"),
                            adherence = rObj.getInt("adherence"),
                            hydration = rObj.getInt("hydration"),
                            nutritionScore = rObj.getInt("nutritionScore")
                        )
                    )
                }
                Result.success(PatientAnalyticsResponse(summary, report))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getHospitalSummary(): Result<HospitalSummaryResponse> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/analytics/hospital-summary"
            val builder = Request.Builder().url(url).get()
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to get hospital summary (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                val statisticsObj = obj.getJSONObject("statistics")
                val distributionObj = statisticsObj.getJSONObject("riskDistribution")
                val averagesObj = statisticsObj.getJSONObject("averages")
                val registryArr = obj.getJSONArray("patientRegistry")
                val alertsArr = obj.getJSONArray("alerts")

                val statistics = HospitalStatistics(
                    totalPatients = statisticsObj.getInt("totalPatients"),
                    riskDistribution = RiskDistribution(
                        high = distributionObj.getInt("high"),
                        medium = distributionObj.getInt("medium"),
                        low = distributionObj.getInt("low")
                    ),
                    averages = HospitalAverages(
                        nutritionAdherence = averagesObj.getInt("nutritionAdherence"),
                        hydration = averagesObj.getInt("hydration")
                    )
                )

                val registry = mutableListOf<Patient>()
                for (i in 0 until registryArr.length()) {
                    val pObj = registryArr.getJSONObject(i)
                    registry.add(
                        Patient(
                            id = pObj.getInt("id"),
                            patientName = pObj.getString("patientName"),
                            age = pObj.getInt("age"),
                            cancerType = pObj.getString("cancerType"),
                            stage = pObj.getString("stage"),
                            energy = pObj.optInt("energy", 75),
                            hydration = pObj.optInt("hydration", 75),
                            recovery = pObj.optInt("recovery", 75),
                            risk = pObj.optString("risk", "Low"),
                            fatigueRisk = pObj.optString("fatigueRisk"),
                            recoveryForecast = pObj.optInt("recoveryForecast"),
                            deficiencyRisk = pObj.optString("deficiencyRisk")
                        )
                    )
                }

                val alerts = mutableListOf<SafetyAlert>()
                for (i in 0 until alertsArr.length()) {
                    val aObj = alertsArr.getJSONObject(i)
                    alerts.add(
                        SafetyAlert(
                            id = aObj.getString("id"),
                            patientId = aObj.getInt("patientId"),
                            patientName = aObj.getString("patientName"),
                            type = aObj.getString("type"),
                            message = aObj.getString("message"),
                            timestamp = aObj.optString("timestamp", "")
                        )
                    )
                }

                Result.success(HospitalSummaryResponse(statistics, registry, alerts))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun recalculatePredictions(patientId: Int): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/predictions/recalculate"
            val bodyJson = JSONObject().apply {
                put("patientId", patientId)
            }
            val builder = Request.Builder()
                .url(url)
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Failed to recalculate predictions (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                Result.success(obj.optBoolean("success", true))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun scanFood(): Result<JSONObject> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/predictions/scan-food"
            val builder = Request.Builder()
                .url(url)
                .post(JSONObject().toString().toRequestBody(jsonMediaType))
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Food scan failed (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                val nutrition = obj.optJSONObject("nutrition") ?: obj
                Result.success(nutrition)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun scanFace(): Result<JSONObject> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl()}/predictions/scan-face"
            val builder = Request.Builder()
                .url(url)
                .post(JSONObject().toString().toRequestBody(jsonMediaType))
            addHeaders(builder)

            client.newCall(builder.build()).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Face scan failed (${response.code})"))
                }
                val obj = JSONObject(bodyStr)
                val telemetry = obj.optJSONObject("telemetry") ?: obj
                Result.success(telemetry)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
