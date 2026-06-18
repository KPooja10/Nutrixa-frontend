package com.example.nutrixa.data

data class User(
    val id: Int,
    val username: String,
    val role: String
)

data class Patient(
    val id: Int,
    val patientName: String,
    val age: Int,
    val cancerType: String,
    val stage: String,
    val energy: Int = 75,
    val hydration: Int = 75,
    val recovery: Int = 75,
    val risk: String = "Low",
    val fatigueRisk: String? = null,
    val recoveryForecast: Int? = null,
    val deficiencyRisk: String? = null
)

data class Analytics(
    val id: Int,
    val patientId: Int,
    val energy: Int,
    val hydration: Int,
    val recovery: Int,
    val risk: String
)

data class Predictions(
    val id: Int,
    val patientId: Int,
    val fatigueRisk: String,
    val recoveryForecast: Int,
    val deficiencyRisk: String,
    val energyTrend: String,
    val hydrationTrend: String
)

data class PatientDetail(
    val id: Int,
    val patientName: String,
    val age: Int,
    val cancerType: String,
    val stage: String,
    val analytics: Analytics,
    val predictions: Predictions
)

data class Meal(
    val id: Int,
    val patientId: Int,
    val mealName: String,
    val type: String,
    val energy: Int,
    val hydration: Int,
    val completed: Int // 0 or 1
)

data class WaterLog(
    val id: Int,
    val patientId: Int,
    val intake: Int,
    val timestamp: String
)

data class WeeklyReportItem(
    val day: String,
    val adherence: Int,
    val hydration: Int,
    val nutritionScore: Int
)

data class PatientAnalyticsResponse(
    val summary: Analytics,
    val weeklyReport: List<WeeklyReportItem>
)

data class SafetyAlert(
    val id: String,
    val patientId: Int,
    val patientName: String,
    val type: String,
    val message: String,
    val timestamp: String
)

data class RiskDistribution(
    val high: Int,
    val medium: Int,
    val low: Int
)

data class HospitalAverages(
    val nutritionAdherence: Int,
    val hydration: Int
)

data class HospitalStatistics(
    val totalPatients: Int,
    val riskDistribution: RiskDistribution,
    val averages: HospitalAverages
)

data class HospitalSummaryResponse(
    val statistics: HospitalStatistics,
    val patientRegistry: List<Patient>,
    val alerts: List<SafetyAlert>
)
