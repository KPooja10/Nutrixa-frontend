package com.example.nutrixa.data

import android.content.Context
import android.content.SharedPreferences
import com.example.nutrixa.network.ApiConstants

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("ponis_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "ponis_token"
        private const val KEY_USER_ID = "ponis_user_id"
        private const val KEY_USER_NAME = "ponis_user_name"
        private const val KEY_USER_ROLE = "ponis_user_role"
        private const val KEY_BACKEND_URL = "ponis_backend_url"
        private val DEFAULT_BACKEND_URL = ApiConstants.BASE_URL
    }

    fun saveSession(token: String, user: User) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putInt(KEY_USER_ID, user.id)
            putString(KEY_USER_NAME, user.username)
            putString(KEY_USER_ROLE, user.role)
            apply()
        }
    }

    fun getBackendUrl(): String {
        return prefs.getString(KEY_BACKEND_URL, DEFAULT_BACKEND_URL) ?: DEFAULT_BACKEND_URL
    }

    fun saveBackendUrl(url: String) {
        var cleanUrl = url.trim()
        if (cleanUrl.endsWith("/")) {
            cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1)
        }
        prefs.edit().putString(KEY_BACKEND_URL, cleanUrl).apply()
    }

    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    fun getUser(): User? {
        val id = prefs.getInt(KEY_USER_ID, -1)
        val username = prefs.getString(KEY_USER_NAME, null)
        val role = prefs.getString(KEY_USER_ROLE, null)

        if (id != -1 && username != null && role != null) {
            return User(id, username, role)
        }
        return null
    }

    fun clearSession() {
        prefs.edit().apply {
            remove(KEY_TOKEN)
            remove(KEY_USER_ID)
            remove(KEY_USER_NAME)
            remove(KEY_USER_ROLE)
            apply()
        }
    }

    fun isLoggedIn(): Boolean {
        return getToken() != null
    }
}
