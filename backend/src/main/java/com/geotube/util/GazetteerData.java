package com.geotube.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Static city-to-country gazetteer for fast O(1) lookup.
 * Keys are lowercase; sorted by length descending so multi-word city names
 * (e.g. "san francisco") are matched before their single-word substrings.
 */
public final class GazetteerData {

    public static final Map<String, String> CITY_TO_COUNTRY;

    /** Entries sorted by key length descending — use this for linear scan matching. */
    public static final List<Map.Entry<String, String>> SORTED_ENTRIES;

    static {
        Map<String, String> m = new HashMap<>();

        // Japan
        m.put("tokyo", "Japan");         m.put("osaka", "Japan");
        m.put("kyoto", "Japan");         m.put("yokohama", "Japan");
        m.put("sapporo", "Japan");       m.put("fukuoka", "Japan");
        m.put("kobe", "Japan");          m.put("nagoya", "Japan");
        m.put("hiroshima", "Japan");     m.put("nara", "Japan");
        m.put("sendai", "Japan");        m.put("okinawa", "Japan");
        m.put("hokkaido", "Japan");      m.put("shibuya", "Japan");
        m.put("shinjuku", "Japan");      m.put("akihabara", "Japan");
        m.put("asakusa", "Japan");       m.put("ginza", "Japan");

        // India
        m.put("mumbai", "India");        m.put("delhi", "India");
        m.put("new delhi", "India");     m.put("bangalore", "India");
        m.put("bengaluru", "India");     m.put("hyderabad", "India");
        m.put("chennai", "India");       m.put("kolkata", "India");
        m.put("pune", "India");          m.put("ahmedabad", "India");
        m.put("jaipur", "India");        m.put("lucknow", "India");
        m.put("goa", "India");           m.put("varanasi", "India");
        m.put("agra", "India");          m.put("surat", "India");
        m.put("kochi", "India");         m.put("chandigarh", "India");
        m.put("bhopal", "India");        m.put("indore", "India");
        m.put("visakhapatnam", "India"); m.put("patna", "India");
        m.put("nagpur", "India");        m.put("coimbatore", "India");
        m.put("mysore", "India");        m.put("udaipur", "India");
        m.put("amritsar", "India");      m.put("rishikesh", "India");
        m.put("darjeeling", "India");    m.put("shimla", "India");
        m.put("kerala", "India");        m.put("rajasthan", "India");
        m.put("taj mahal", "India");

        // USA
        m.put("new york", "USA");        m.put("los angeles", "USA");
        m.put("chicago", "USA");         m.put("houston", "USA");
        m.put("phoenix", "USA");         m.put("philadelphia", "USA");
        m.put("san antonio", "USA");     m.put("san diego", "USA");
        m.put("dallas", "USA");          m.put("san francisco", "USA");
        m.put("seattle", "USA");         m.put("boston", "USA");
        m.put("miami", "USA");           m.put("atlanta", "USA");
        m.put("las vegas", "USA");       m.put("denver", "USA");
        m.put("portland", "USA");        m.put("nashville", "USA");
        m.put("austin", "USA");          m.put("minneapolis", "USA");
        m.put("new orleans", "USA");     m.put("san jose", "USA");
        m.put("honolulu", "USA");        m.put("hawaii", "USA");
        m.put("brooklyn", "USA");        m.put("manhattan", "USA");
        m.put("washington dc", "USA");   m.put("washington d.c.", "USA");
        m.put("silicon valley", "USA");  m.put("hollywood", "USA");
        m.put("detroit", "USA");         m.put("baltimore", "USA");
        m.put("memphis", "USA");         m.put("louisville", "USA");
        m.put("albuquerque", "USA");     m.put("tucson", "USA");
        m.put("fresno", "USA");          m.put("sacramento", "USA");
        m.put("kansas city", "USA");     m.put("colorado", "USA");
        m.put("pittsburgh", "USA");      m.put("cincinnati", "USA");
        m.put("indianapolis", "USA");    m.put("cleveland", "USA");

        // United Kingdom
        m.put("london", "United Kingdom");    m.put("birmingham", "United Kingdom");
        m.put("manchester", "United Kingdom");m.put("edinburgh", "United Kingdom");
        m.put("glasgow", "United Kingdom");   m.put("liverpool", "United Kingdom");
        m.put("bristol", "United Kingdom");   m.put("leeds", "United Kingdom");
        m.put("oxford", "United Kingdom");    m.put("cambridge", "United Kingdom");
        m.put("cardiff", "United Kingdom");   m.put("belfast", "United Kingdom");
        m.put("sheffield", "United Kingdom"); m.put("nottingham", "United Kingdom");
        m.put("bath", "United Kingdom");      m.put("york", "United Kingdom");
        m.put("brighton", "United Kingdom");  m.put("newcastle", "United Kingdom");
        m.put("coventry", "United Kingdom");  m.put("leicester", "United Kingdom");

        // France
        m.put("paris", "France");        m.put("lyon", "France");
        m.put("marseille", "France");    m.put("bordeaux", "France");
        m.put("nice", "France");         m.put("toulouse", "France");
        m.put("strasbourg", "France");   m.put("nantes", "France");
        m.put("montpellier", "France");  m.put("rennes", "France");
        m.put("versailles", "France");   m.put("normandy", "France");
        m.put("provence", "France");     m.put("alsace", "France");
        m.put("cannes", "France");       m.put("monaco", "France");

        // Italy
        m.put("rome", "Italy");          m.put("milan", "Italy");
        m.put("venice", "Italy");        m.put("florence", "Italy");
        m.put("naples", "Italy");        m.put("turin", "Italy");
        m.put("bologna", "Italy");       m.put("palermo", "Italy");
        m.put("genoa", "Italy");         m.put("verona", "Italy");
        m.put("sicily", "Italy");        m.put("sardinia", "Italy");
        m.put("amalfi", "Italy");        m.put("cinque terre", "Italy");
        m.put("pompeii", "Italy");       m.put("pisa", "Italy");
        m.put("siena", "Italy");         m.put("bari", "Italy");
        m.put("milan", "Italy");         m.put("catania", "Italy");
        m.put("trieste", "Italy");       m.put("ravenna", "Italy");

        // Germany
        m.put("berlin", "Germany");      m.put("munich", "Germany");
        m.put("hamburg", "Germany");     m.put("cologne", "Germany");
        m.put("frankfurt", "Germany");   m.put("stuttgart", "Germany");
        m.put("dusseldorf", "Germany");  m.put("düsseldorf", "Germany");
        m.put("dortmund", "Germany");    m.put("essen", "Germany");
        m.put("nuremberg", "Germany");   m.put("nürnberg", "Germany");
        m.put("dresden", "Germany");     m.put("heidelberg", "Germany");
        m.put("bavaria", "Germany");     m.put("munich", "Germany");
        m.put("hannover", "Germany");    m.put("bonn", "Germany");
        m.put("freiburg", "Germany");    m.put("augsburg", "Germany");

        // Spain
        m.put("madrid", "Spain");        m.put("barcelona", "Spain");
        m.put("seville", "Spain");       m.put("sevilla", "Spain");
        m.put("valencia", "Spain");      m.put("granada", "Spain");
        m.put("bilbao", "Spain");        m.put("malaga", "Spain");
        m.put("málaga", "Spain");        m.put("ibiza", "Spain");
        m.put("toledo", "Spain");        m.put("salamanca", "Spain");
        m.put("zaragoza", "Spain");      m.put("palma", "Spain");
        m.put("majorca", "Spain");       m.put("tenerife", "Spain");

        // China
        m.put("beijing", "China");       m.put("shanghai", "China");
        m.put("shenzhen", "China");      m.put("guangzhou", "China");
        m.put("chengdu", "China");       m.put("wuhan", "China");
        m.put("xian", "China");          m.put("xi'an", "China");
        m.put("hangzhou", "China");      m.put("nanjing", "China");
        m.put("chongqing", "China");     m.put("hong kong", "China");
        m.put("macau", "China");         m.put("guilin", "China");
        m.put("harbin", "China");        m.put("tianjin", "China");
        m.put("suzhou", "China");        m.put("dalian", "China");
        m.put("qingdao", "China");       m.put("kunming", "China");
        m.put("tibet", "China");         m.put("lhasa", "China");
        m.put("yangtze", "China");       m.put("great wall", "China");

        // South Korea
        m.put("seoul", "South Korea");   m.put("busan", "South Korea");
        m.put("incheon", "South Korea"); m.put("daegu", "South Korea");
        m.put("jeju", "South Korea");    m.put("gwangju", "South Korea");
        m.put("daejeon", "South Korea"); m.put("ulsan", "South Korea");

        // Thailand
        m.put("bangkok", "Thailand");    m.put("chiang mai", "Thailand");
        m.put("phuket", "Thailand");     m.put("pattaya", "Thailand");
        m.put("koh samui", "Thailand");  m.put("krabi", "Thailand");
        m.put("ayutthaya", "Thailand");  m.put("koh lanta", "Thailand");
        m.put("pai", "Thailand");        m.put("chiang rai", "Thailand");

        // Vietnam
        m.put("hanoi", "Vietnam");       m.put("ho chi minh", "Vietnam");
        m.put("saigon", "Vietnam");      m.put("da nang", "Vietnam");
        m.put("hoi an", "Vietnam");      m.put("nha trang", "Vietnam");
        m.put("ha long", "Vietnam");     m.put("halong", "Vietnam");
        m.put("hue", "Vietnam");         m.put("dalat", "Vietnam");
        m.put("phu quoc", "Vietnam");    m.put("can tho", "Vietnam");

        // Indonesia
        m.put("jakarta", "Indonesia");   m.put("bali", "Indonesia");
        m.put("surabaya", "Indonesia");  m.put("yogyakarta", "Indonesia");
        m.put("lombok", "Indonesia");    m.put("ubud", "Indonesia");
        m.put("bandung", "Indonesia");   m.put("medan", "Indonesia");
        m.put("komodo", "Indonesia");    m.put("java", "Indonesia");
        m.put("sumatra", "Indonesia");   m.put("sulawesi", "Indonesia");

        // Turkey
        m.put("istanbul", "Turkey");     m.put("ankara", "Turkey");
        m.put("izmir", "Turkey");        m.put("cappadocia", "Turkey");
        m.put("antalya", "Turkey");      m.put("bodrum", "Turkey");
        m.put("ephesus", "Turkey");      m.put("pamukkale", "Turkey");
        m.put("trabzon", "Turkey");      m.put("bursa", "Turkey");

        // Russia
        m.put("moscow", "Russia");       m.put("saint petersburg", "Russia");
        m.put("st petersburg", "Russia");m.put("vladivostok", "Russia");
        m.put("novosibirsk", "Russia");  m.put("kazan", "Russia");
        m.put("sochi", "Russia");        m.put("ekaterinburg", "Russia");

        // Brazil
        m.put("rio de janeiro", "Brazil");m.put("sao paulo", "Brazil");
        m.put("são paulo", "Brazil");    m.put("brasilia", "Brazil");
        m.put("salvador", "Brazil");     m.put("fortaleza", "Brazil");
        m.put("manaus", "Brazil");       m.put("recife", "Brazil");
        m.put("florianopolis", "Brazil");m.put("curitiba", "Brazil");
        m.put("belo horizonte", "Brazil");

        // Mexico
        m.put("mexico city", "Mexico");  m.put("guadalajara", "Mexico");
        m.put("monterrey", "Mexico");    m.put("cancun", "Mexico");
        m.put("tulum", "Mexico");        m.put("playa del carmen", "Mexico");
        m.put("oaxaca", "Mexico");       m.put("puerto vallarta", "Mexico");
        m.put("chichen itza", "Mexico"); m.put("merida", "Mexico");
        m.put("guanajuato", "Mexico");   m.put("cabo san lucas", "Mexico");

        // Australia
        m.put("sydney", "Australia");    m.put("melbourne", "Australia");
        m.put("brisbane", "Australia");  m.put("perth", "Australia");
        m.put("adelaide", "Australia");  m.put("gold coast", "Australia");
        m.put("cairns", "Australia");    m.put("darwin", "Australia");
        m.put("canberra", "Australia");  m.put("hobart", "Australia");
        m.put("uluru", "Australia");     m.put("great barrier reef", "Australia");

        // Canada
        m.put("toronto", "Canada");      m.put("vancouver", "Canada");
        m.put("montreal", "Canada");     m.put("calgary", "Canada");
        m.put("ottawa", "Canada");       m.put("edmonton", "Canada");
        m.put("quebec city", "Canada");  m.put("winnipeg", "Canada");
        m.put("victoria", "Canada");     m.put("banff", "Canada");
        m.put("niagara falls", "Canada");

        // UAE
        m.put("dubai", "UAE");           m.put("abu dhabi", "UAE");
        m.put("sharjah", "UAE");

        // Egypt
        m.put("cairo", "Egypt");         m.put("alexandria", "Egypt");
        m.put("luxor", "Egypt");         m.put("aswan", "Egypt");
        m.put("sharm el sheikh", "Egypt");

        // Morocco
        m.put("marrakech", "Morocco");   m.put("casablanca", "Morocco");
        m.put("fez", "Morocco");         m.put("fès", "Morocco");
        m.put("rabat", "Morocco");       m.put("tangier", "Morocco");
        m.put("essaouira", "Morocco");   m.put("chefchaouen", "Morocco");

        // Portugal
        m.put("lisbon", "Portugal");     m.put("porto", "Portugal");
        m.put("algarve", "Portugal");    m.put("sintra", "Portugal");
        m.put("faro", "Portugal");

        // Netherlands
        m.put("amsterdam", "Netherlands"); m.put("rotterdam", "Netherlands");
        m.put("the hague", "Netherlands");m.put("utrecht", "Netherlands");
        m.put("eindhoven", "Netherlands");m.put("leiden", "Netherlands");

        // Belgium
        m.put("brussels", "Belgium");    m.put("bruges", "Belgium");
        m.put("ghent", "Belgium");       m.put("antwerp", "Belgium");

        // Switzerland
        m.put("zurich", "Switzerland");  m.put("geneva", "Switzerland");
        m.put("bern", "Switzerland");    m.put("interlaken", "Switzerland");
        m.put("lucerne", "Switzerland"); m.put("zermatt", "Switzerland");
        m.put("lausanne", "Switzerland");m.put("lugano", "Switzerland");

        // Austria
        m.put("vienna", "Austria");      m.put("salzburg", "Austria");
        m.put("innsbruck", "Austria");   m.put("graz", "Austria");
        m.put("hallstatt", "Austria");

        // Greece
        m.put("athens", "Greece");       m.put("santorini", "Greece");
        m.put("mykonos", "Greece");      m.put("thessaloniki", "Greece");
        m.put("crete", "Greece");        m.put("rhodes", "Greece");
        m.put("corfu", "Greece");        m.put("meteora", "Greece");

        // Czech Republic
        m.put("prague", "Czech Republic"); m.put("brno", "Czech Republic");
        m.put("karlovy vary", "Czech Republic");

        // Hungary
        m.put("budapest", "Hungary");    m.put("debrecen", "Hungary");

        // Poland
        m.put("warsaw", "Poland");       m.put("krakow", "Poland");
        m.put("gdansk", "Poland");       m.put("wroclaw", "Poland");
        m.put("poznan", "Poland");       m.put("lodz", "Poland");

        // Sweden
        m.put("stockholm", "Sweden");    m.put("gothenburg", "Sweden");
        m.put("malmo", "Sweden");        m.put("malmö", "Sweden");
        m.put("uppsala", "Sweden");

        // Norway
        m.put("oslo", "Norway");         m.put("bergen", "Norway");
        m.put("tromso", "Norway");       m.put("tromsø", "Norway");
        m.put("stavanger", "Norway");    m.put("trondheim", "Norway");

        // Denmark
        m.put("copenhagen", "Denmark");  m.put("aarhus", "Denmark");

        // Finland
        m.put("helsinki", "Finland");    m.put("rovaniemi", "Finland");
        m.put("tampere", "Finland");     m.put("turku", "Finland");

        // Iceland
        m.put("reykjavik", "Iceland");   m.put("akureyri", "Iceland");

        // Singapore
        m.put("singapore", "Singapore");

        // Malaysia
        m.put("kuala lumpur", "Malaysia"); m.put("penang", "Malaysia");
        m.put("langkawi", "Malaysia");   m.put("kota kinabalu", "Malaysia");
        m.put("johor bahru", "Malaysia");m.put("ipoh", "Malaysia");

        // Philippines
        m.put("manila", "Philippines");  m.put("cebu", "Philippines");
        m.put("palawan", "Philippines"); m.put("boracay", "Philippines");
        m.put("davao", "Philippines");   m.put("el nido", "Philippines");

        // Taiwan
        m.put("taipei", "Taiwan");       m.put("kaohsiung", "Taiwan");
        m.put("tainan", "Taiwan");       m.put("taichung", "Taiwan");

        // Nepal
        m.put("kathmandu", "Nepal");     m.put("pokhara", "Nepal");
        m.put("everest", "Nepal");

        // Sri Lanka
        m.put("colombo", "Sri Lanka");   m.put("kandy", "Sri Lanka");
        m.put("galle", "Sri Lanka");     m.put("sigiriya", "Sri Lanka");

        // Pakistan
        m.put("karachi", "Pakistan");    m.put("lahore", "Pakistan");
        m.put("islamabad", "Pakistan");  m.put("peshawar", "Pakistan");

        // Bangladesh
        m.put("dhaka", "Bangladesh");    m.put("chittagong", "Bangladesh");

        // Iran
        m.put("tehran", "Iran");         m.put("isfahan", "Iran");
        m.put("shiraz", "Iran");         m.put("mashhad", "Iran");

        // Saudi Arabia
        m.put("riyadh", "Saudi Arabia"); m.put("jeddah", "Saudi Arabia");
        m.put("mecca", "Saudi Arabia");  m.put("medina", "Saudi Arabia");

        // Jordan
        m.put("amman", "Jordan");        m.put("petra", "Jordan");
        m.put("aqaba", "Jordan");        m.put("wadi rum", "Jordan");

        // Israel
        m.put("tel aviv", "Israel");     m.put("jerusalem", "Israel");
        m.put("haifa", "Israel");        m.put("dead sea", "Israel");

        // Lebanon
        m.put("beirut", "Lebanon");

        // South Africa
        m.put("cape town", "South Africa");  m.put("johannesburg", "South Africa");
        m.put("durban", "South Africa");     m.put("pretoria", "South Africa");
        m.put("kruger", "South Africa");

        // Kenya
        m.put("nairobi", "Kenya");       m.put("mombasa", "Kenya");
        m.put("masai mara", "Kenya");

        // Tanzania
        m.put("dar es salaam", "Tanzania");  m.put("zanzibar", "Tanzania");
        m.put("serengeti", "Tanzania");  m.put("kilimanjaro", "Tanzania");

        // Ethiopia
        m.put("addis ababa", "Ethiopia");

        // Nigeria
        m.put("lagos", "Nigeria");       m.put("abuja", "Nigeria");

        // Ghana
        m.put("accra", "Ghana");

        // Argentina
        m.put("buenos aires", "Argentina"); m.put("mendoza", "Argentina");
        m.put("bariloche", "Argentina"); m.put("cordoba", "Argentina");
        m.put("patagonia", "Argentina");

        // Chile
        m.put("santiago", "Chile");      m.put("valparaiso", "Chile");
        m.put("atacama", "Chile");

        // Colombia
        m.put("bogota", "Colombia");     m.put("medellin", "Colombia");
        m.put("medellín", "Colombia");   m.put("cartagena", "Colombia");

        // Peru
        m.put("lima", "Peru");           m.put("cusco", "Peru");
        m.put("machu picchu", "Peru");   m.put("amazon", "Peru");

        // Cuba
        m.put("havana", "Cuba");         m.put("varadero", "Cuba");

        // Costa Rica
        m.put("san jose", "Costa Rica");

        // New Zealand
        m.put("auckland", "New Zealand"); m.put("wellington", "New Zealand");
        m.put("christchurch", "New Zealand"); m.put("queenstown", "New Zealand");
        m.put("rotorua", "New Zealand"); m.put("fiordland", "New Zealand");

        // Ireland
        m.put("dublin", "Ireland");      m.put("cork", "Ireland");
        m.put("galway", "Ireland");      m.put("limerick", "Ireland");

        // Ukraine
        m.put("kyiv", "Ukraine");        m.put("kiev", "Ukraine");
        m.put("odessa", "Ukraine");      m.put("lviv", "Ukraine");

        // Romania
        m.put("bucharest", "Romania");   m.put("transylvania", "Romania");
        m.put("brasov", "Romania");      m.put("cluj", "Romania");

        // Croatia
        m.put("zagreb", "Croatia");      m.put("dubrovnik", "Croatia");
        m.put("split", "Croatia");       m.put("pula", "Croatia");

        // Serbia
        m.put("belgrade", "Serbia");     m.put("novi sad", "Serbia");

        // Bulgaria
        m.put("sofia", "Bulgaria");      m.put("plovdiv", "Bulgaria");

        // Slovakia
        m.put("bratislava", "Slovakia");

        // Slovenia
        m.put("ljubljana", "Slovenia");  m.put("bled", "Slovenia");

        // Estonia
        m.put("tallinn", "Estonia");

        // Latvia
        m.put("riga", "Latvia");

        // Lithuania
        m.put("vilnius", "Lithuania");

        // Georgia (country)
        m.put("tbilisi", "Georgia");     m.put("batumi", "Georgia");

        // Armenia
        m.put("yerevan", "Armenia");

        // Azerbaijan
        m.put("baku", "Azerbaijan");

        // Kazakhstan
        m.put("almaty", "Kazakhstan");   m.put("astana", "Kazakhstan");

        // Uzbekistan
        m.put("tashkent", "Uzbekistan"); m.put("samarkand", "Uzbekistan");
        m.put("bukhara", "Uzbekistan");

        // Myanmar
        m.put("yangon", "Myanmar");      m.put("bagan", "Myanmar");
        m.put("mandalay", "Myanmar");

        // Cambodia
        m.put("phnom penh", "Cambodia"); m.put("siem reap", "Cambodia");
        m.put("angkor wat", "Cambodia"); m.put("angkor", "Cambodia");

        // Laos
        m.put("vientiane", "Laos");      m.put("luang prabang", "Laos");

        // Mongolia
        m.put("ulaanbaatar", "Mongolia");

        // Qatar
        m.put("doha", "Qatar");

        // Kuwait
        m.put("kuwait city", "Kuwait");

        // Bahrain
        m.put("manama", "Bahrain");

        // Oman
        m.put("muscat", "Oman");

        // Ecuador
        m.put("quito", "Ecuador");       m.put("guayaquil", "Ecuador");
        m.put("galapagos", "Ecuador");

        // Bolivia
        m.put("la paz", "Bolivia");      m.put("sucre", "Bolivia");
        m.put("salar de uyuni", "Bolivia");

        // Paraguay
        m.put("asuncion", "Paraguay");   m.put("asunción", "Paraguay");

        // Uruguay
        m.put("montevideo", "Uruguay");

        // Venezuela
        m.put("caracas", "Venezuela");   m.put("angel falls", "Venezuela");

        // Panama
        m.put("panama city", "Panama");

        // Guatemala
        m.put("guatemala city", "Guatemala"); m.put("antigua", "Guatemala");

        // Jamaica
        m.put("kingston", "Jamaica");    m.put("montego bay", "Jamaica");

        // Puerto Rico
        m.put("san juan", "Puerto Rico");

        // Dominican Republic
        m.put("santo domingo", "Dominican Republic"); m.put("punta cana", "Dominican Republic");

        // Haiti
        m.put("port-au-prince", "Haiti");

        // Trinidad and Tobago
        m.put("port of spain", "Trinidad and Tobago");

        // Senegal
        m.put("dakar", "Senegal");

        // Uganda
        m.put("kampala", "Uganda");

        // Zimbabwe
        m.put("harare", "Zimbabwe");     m.put("victoria falls", "Zimbabwe");

        // Zambia
        m.put("lusaka", "Zambia");

        // Mozambique
        m.put("maputo", "Mozambique");

        // Madagascar
        m.put("antananarivo", "Madagascar");

        // Tunisia
        m.put("tunis", "Tunisia");

        // Algeria
        m.put("algiers", "Algeria");

        // Iraq
        m.put("baghdad", "Iraq");        m.put("erbil", "Iraq");

        // Syria
        m.put("damascus", "Syria");      m.put("aleppo", "Syria");

        // Afghanistan
        m.put("kabul", "Afghanistan");

        CITY_TO_COUNTRY = Collections.unmodifiableMap(m);

        List<Map.Entry<String, String>> sorted = new ArrayList<>(m.entrySet());
        sorted.sort(Comparator.comparingInt(e -> -e.getKey().length()));
        SORTED_ENTRIES = Collections.unmodifiableList(sorted);
    }

    private GazetteerData() {}
}
