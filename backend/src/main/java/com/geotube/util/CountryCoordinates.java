package com.geotube.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public final class CountryCoordinates {

    // Approximate geographic center [latitude, longitude] per country
    private static final Map<String, double[]> COORDS;

    static {
        Map<String, double[]> m = new HashMap<>();
        m.put("Afghanistan",           new double[]{ 33.93,  67.71});
        m.put("Albania",               new double[]{ 41.15,  20.17});
        m.put("Algeria",               new double[]{ 28.03,   1.66});
        m.put("Argentina",             new double[]{-38.42, -63.62});
        m.put("Armenia",               new double[]{ 40.07,  45.04});
        m.put("Australia",             new double[]{-25.27, 133.78});
        m.put("Austria",               new double[]{ 47.52,  14.55});
        m.put("Azerbaijan",            new double[]{ 40.14,  47.58});
        m.put("Bahrain",               new double[]{ 26.07,  50.56});
        m.put("Bangladesh",            new double[]{ 23.69,  90.36});
        m.put("Belgium",               new double[]{ 50.50,   4.47});
        m.put("Bolivia",               new double[]{-16.29, -63.59});
        m.put("Brazil",                new double[]{-14.24, -51.93});
        m.put("Bulgaria",              new double[]{ 42.73,  25.49});
        m.put("Cambodia",              new double[]{ 12.57, 104.99});
        m.put("Canada",                new double[]{ 56.13, -106.35});
        m.put("Chile",                 new double[]{-35.68, -71.54});
        m.put("China",                 new double[]{ 35.86, 104.20});
        m.put("Colombia",              new double[]{  4.57, -74.30});
        m.put("Costa Rica",            new double[]{  9.75, -83.75});
        m.put("Croatia",               new double[]{ 45.10,  15.20});
        m.put("Cuba",                  new double[]{ 21.52, -77.78});
        m.put("Czech Republic",        new double[]{ 49.82,  15.47});
        m.put("Denmark",               new double[]{ 56.26,   9.50});
        m.put("Dominican Republic",    new double[]{ 18.74, -70.16});
        m.put("Ecuador",               new double[]{  -1.83, -78.18});
        m.put("Egypt",                 new double[]{ 26.82,  30.80});
        m.put("Estonia",               new double[]{ 58.60,  25.01});
        m.put("Ethiopia",              new double[]{  9.15,  40.49});
        m.put("Finland",               new double[]{ 61.92,  25.75});
        m.put("France",                new double[]{ 46.23,   2.21});
        m.put("Georgia",               new double[]{ 42.32,  43.36});
        m.put("Germany",               new double[]{ 51.17,  10.45});
        m.put("Ghana",                 new double[]{  7.95,  -1.02});
        m.put("Greece",                new double[]{ 39.07,  21.82});
        m.put("Guatemala",             new double[]{ 15.78, -90.23});
        m.put("Haiti",                 new double[]{ 18.97, -72.29});
        m.put("Hungary",               new double[]{ 47.16,  19.50});
        m.put("Iceland",               new double[]{ 64.96, -19.02});
        m.put("India",                 new double[]{ 20.59,  78.96});
        m.put("Indonesia",             new double[]{ -0.79, 113.92});
        m.put("Iran",                  new double[]{ 32.43,  53.69});
        m.put("Iraq",                  new double[]{ 33.22,  43.68});
        m.put("Ireland",               new double[]{ 53.41,  -8.24});
        m.put("Israel",                new double[]{ 31.05,  34.85});
        m.put("Italy",                 new double[]{ 41.87,  12.57});
        m.put("Jamaica",               new double[]{ 18.11, -77.30});
        m.put("Japan",                 new double[]{ 36.20, 138.25});
        m.put("Jordan",                new double[]{ 30.59,  36.24});
        m.put("Kazakhstan",            new double[]{ 48.02,  66.92});
        m.put("Kenya",                 new double[]{ -0.02,  37.91});
        m.put("Kuwait",                new double[]{ 29.31,  47.48});
        m.put("Laos",                  new double[]{ 19.86, 102.50});
        m.put("Latvia",                new double[]{ 56.88,  24.60});
        m.put("Lebanon",               new double[]{ 33.85,  35.86});
        m.put("Libya",                 new double[]{ 26.34,  17.23});
        m.put("Lithuania",             new double[]{ 55.17,  23.88});
        m.put("Madagascar",            new double[]{-18.77,  46.87});
        m.put("Malaysia",              new double[]{  4.21, 101.98});
        m.put("Mexico",                new double[]{ 23.63, -102.55});
        m.put("Mongolia",              new double[]{ 46.86, 103.85});
        m.put("Morocco",               new double[]{ 31.79,  -7.09});
        m.put("Mozambique",            new double[]{-18.67,  35.53});
        m.put("Myanmar",               new double[]{ 21.91,  95.96});
        m.put("Nepal",                 new double[]{ 28.39,  84.12});
        m.put("Netherlands",           new double[]{ 52.13,   5.29});
        m.put("New Zealand",           new double[]{-40.90, 174.89});
        m.put("Nigeria",               new double[]{  9.08,   8.68});
        m.put("Norway",                new double[]{ 60.47,   8.47});
        m.put("Oman",                  new double[]{ 21.51,  55.92});
        m.put("Pakistan",              new double[]{ 30.38,  69.35});
        m.put("Panama",                new double[]{  8.54, -80.78});
        m.put("Paraguay",              new double[]{-23.44, -58.44});
        m.put("Peru",                  new double[]{ -9.19, -75.02});
        m.put("Philippines",           new double[]{ 12.88, 121.77});
        m.put("Poland",                new double[]{ 51.92,  19.15});
        m.put("Portugal",              new double[]{ 39.40,  -8.22});
        m.put("Puerto Rico",           new double[]{ 18.22, -66.59});
        m.put("Qatar",                 new double[]{ 25.35,  51.18});
        m.put("Romania",               new double[]{ 45.94,  24.97});
        m.put("Russia",                new double[]{ 61.52, 105.32});
        m.put("Saudi Arabia",          new double[]{ 23.89,  45.08});
        m.put("Senegal",               new double[]{ 14.50, -14.45});
        m.put("Serbia",                new double[]{ 44.02,  21.01});
        m.put("Singapore",             new double[]{  1.35, 103.82});
        m.put("Slovakia",              new double[]{ 48.67,  19.70});
        m.put("Slovenia",              new double[]{ 46.15,  14.99});
        m.put("South Africa",          new double[]{-30.56,  22.94});
        m.put("South Korea",           new double[]{ 35.91, 127.77});
        m.put("Spain",                 new double[]{ 40.46,  -3.75});
        m.put("Sri Lanka",             new double[]{  7.87,  80.77});
        m.put("Sudan",                 new double[]{ 12.86,  30.22});
        m.put("Sweden",                new double[]{ 60.13,  18.64});
        m.put("Switzerland",           new double[]{ 46.82,   8.23});
        m.put("Syria",                 new double[]{ 34.80,  38.99});
        m.put("Taiwan",                new double[]{ 23.70, 120.96});
        m.put("Tanzania",              new double[]{ -6.37,  34.89});
        m.put("Thailand",              new double[]{ 15.87, 100.99});
        m.put("Trinidad and Tobago",   new double[]{ 10.69, -61.22});
        m.put("Tunisia",               new double[]{ 33.89,   9.54});
        m.put("Turkey",                new double[]{ 38.96,  35.24});
        m.put("UAE",                   new double[]{ 23.42,  53.85});
        m.put("Uganda",                new double[]{  1.37,  32.29});
        m.put("Ukraine",               new double[]{ 48.38,  31.17});
        m.put("United Kingdom",        new double[]{ 55.38,  -3.44});
        m.put("Uruguay",               new double[]{-32.52, -55.77});
        m.put("USA",                   new double[]{ 37.09, -95.71});
        m.put("Uzbekistan",            new double[]{ 41.38,  64.59});
        m.put("Venezuela",             new double[]{  6.42, -66.59});
        m.put("Vietnam",               new double[]{ 14.06, 108.28});
        m.put("Yemen",                 new double[]{ 15.55,  48.52});
        m.put("Zambia",                new double[]{-13.13,  27.85});
        m.put("Zimbabwe",              new double[]{-19.02,  29.15});
        COORDS = Collections.unmodifiableMap(m);
    }

    // Variant spellings / full names → canonical key in COORDS
    private static final Map<String, String> ALIASES;
    static {
        Map<String, String> a = new HashMap<>();
        a.put("United States",              "USA");
        a.put("United States of America",   "USA");
        a.put("U.S.A.",                     "USA");
        a.put("U.S.",                       "USA");
        a.put("Czechia",                    "Czech Republic");
        a.put("United Arab Emirates",       "UAE");
        a.put("Great Britain",              "United Kingdom");
        a.put("England",                    "United Kingdom");
        a.put("Scotland",                   "United Kingdom");
        a.put("Wales",                      "United Kingdom");
        a.put("Holland",                    "Netherlands");
        a.put("Republic of Korea",          "South Korea");
        a.put("Korea",                      "South Korea");
        a.put("Democratic Republic of the Congo", "Nigeria");  // fallback coords
        a.put("Republic of the Congo",      "Nigeria");
        // City-states / micro-nations → nearest large country coordinates
        a.put("Monaco",                     "France");
        a.put("Vatican",                    "Italy");
        a.put("San Marino",                 "Italy");
        a.put("Liechtenstein",              "Switzerland");
        a.put("Andorra",                    "Spain");
        a.put("Luxembourg",                 "Belgium");
        a.put("Malta",                      "Italy");
        a.put("Cyprus",                     "Greece");
        ALIASES = Collections.unmodifiableMap(a);
    }

    private CountryCoordinates() {}

    /** Normalises variant names then returns [lat, lng], or [0.0, 0.0] if unknown. */
    public static double[] get(String country) {
        if (country == null) return new double[]{0.0, 0.0};
        String canonical = ALIASES.getOrDefault(country, country);
        double[] coords = COORDS.get(canonical);
        return coords != null ? coords : new double[]{0.0, 0.0};
    }

    /** Returns the canonical country name (resolves aliases). */
    public static String canonical(String country) {
        if (country == null) return null;
        return ALIASES.getOrDefault(country, country);
    }

    public static boolean isKnown(String country) {
        if (country == null) return false;
        String canonical = ALIASES.getOrDefault(country, country);
        return COORDS.containsKey(canonical);
    }

    public static Set<String> allCountries() {
        return COORDS.keySet();
    }
}
