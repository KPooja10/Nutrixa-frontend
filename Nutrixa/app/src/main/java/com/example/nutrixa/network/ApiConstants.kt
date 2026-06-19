package com.example.nutrixa.network

    object ApiConstants {
    /**
     * IP address when connecting the phone via the local Wi-Fi network.
     */
    const val WIFI_BACKEND_URL = "http://172.23.51.96:5000"

    /**
     * IP address when connecting the phone via Windows Mobile Hotspot.
     */
    const val HOTSPOT_BACKEND_URL = "http://192.168.137.1:5000"

    /**
     * Default loopback address for the Android emulator.
     */
    const val EMULATOR_BACKEND_URL = "http://10.0.2.2:5000"

    /**
     * Localhost address for running on-device or desktop JVM environments.
     */
    const val LOCALHOST_BACKEND_URL = "http://localhost:5000"

    /**
     * The primary API backend URL constant. Update this depending on how your phone connects.
     */
    const val BASE_URL = LOCALHOST_BACKEND_URL
}
