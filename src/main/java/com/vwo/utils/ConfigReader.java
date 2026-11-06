package com.vwo.utils;

import com.vwo.exceptions.FrameworkException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public final class ConfigReader {

    private static final String CONFIG_FILE = "config.properties";
    private static final Properties PROPERTIES = load();

    private ConfigReader() {
    }

    private static Properties load() {
        Properties properties = new Properties();
        try (InputStream stream = ConfigReader.class.getClassLoader().getResourceAsStream(CONFIG_FILE)) {
            if (stream == null) {
                throw new FrameworkException("Configuration file not found on classpath: " + CONFIG_FILE);
            }
            properties.load(stream);
            return properties;
        } catch (IOException e) {
            throw new FrameworkException("Unable to read configuration file: " + CONFIG_FILE, e);
        }
    }

    public static String get(String key) {
        String override = System.getProperty(key);
        if (override != null) {
            return override.trim();
        }
        String value = PROPERTIES.getProperty(key);
        if (value == null) {
            throw new FrameworkException("Missing configuration key: " + key);
        }
        return value.trim();
    }

    public static boolean getBoolean(String key) {
        return Boolean.parseBoolean(get(key));
    }

    public static int getInt(String key) {
        String value = get(key);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new FrameworkException("Configuration key '" + key + "' is not a valid integer: " + value, e);
        }
    }

    public static boolean isBlank(String key) {
        return get(key).isEmpty();
    }
}
