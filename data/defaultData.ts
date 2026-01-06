
import { AppSettings } from "../types";

export const PRESET_COLORS = [
    "#4F46E5", "#059669", "#E11D48", "#D97706", "#0891B2", 
    "#7C3AED", "#C026D3", "#EA580C", "#65A30D", "#0D9488", 
    "#2563EB", "#DB2777", "#475569", "#78350F", "#DC2626"
];

export const DEFAULT_SETTINGS: AppSettings = {
  accounts: [
    { name: "Gotówka", currency: "PLN" },
    { name: "Santander", currency: "PLN" },
    { name: "VeloBank", currency: "PLN" }
  ],
  shopMappings: [
    { rawName: "Action Poland Sp. Z O.O.", cleanName: "Action" },
    { rawName: "HIPERMARKET AUCHAN", cleanName: "Auchan" },
    { rawName: "CARREFOUR POLSKA SP. Z O.O.", cleanName: "Carrefour" },
    { rawName: "* CARREFOUR * WITOSA", cleanName: "Carrefour" },
    { rawName: "Castorama Kraków Zakopianka", cleanName: "Castorama" },
    { rawName: "DECATHLON sp. z o. o.", cleanName: "Decathlon" },
    { rawName: "DZINN MARKET", cleanName: "Dżinn" },
    { rawName: "Empik S.A.", cleanName: "Empik" },
    { rawName: "IKEA Retail Sp. z o.o.", cleanName: "IKEA" },
    { rawName: "INTERSPORT Polska S.A.", cleanName: "Intersport" },
    { rawName: "JYSK sp. z o.o.", cleanName: "JYSK" },
    { rawName: "Kaufland Polska Markety Sp.z o.o.Sp.j.", cleanName: "Kaufland" },
    { rawName: "Leroy - Merlin Polska sp. z o.o.", cleanName: "Leroy Merlin" },
    { rawName: "Lidl sp. z o.o. sp.k.", cleanName: "Lidl" },
    { rawName: "Makro Cash and Carry Polska S.A.", cleanName: "Makro" },
    { rawName: "TERG S.A.", cleanName: "Media Expert" },
    { rawName: "Rossmann Supermarkety Drogeryjne Polska sp. z o.o.", cleanName: "Rossmann" }

  ],
  categories: [
    // --- Root Categories ---
    { name: "Dom", description: "Wydatki mieszkaniowe i wyposażenie", color: PRESET_COLORS[0] },
    { name: "Dzieci", description: "Wydatki na dzieci", color: PRESET_COLORS[2] },
    { name: "Edukacja", description: "Rozwój, szkoła i nauka", color: PRESET_COLORS[3] },
    { name: "Elektronika", description: "Sprzęt i gadżety", color: PRESET_COLORS[4] },
    { name: "Hobby i rozrywka", description: "Czas wolny i pasje", color: PRESET_COLORS[5] },
    { name: "Inne", description: "Pozostałe, nieskategoryzowane", color: PRESET_COLORS[6] },
    { name: "Jedzenie", description: "Zakupy spożywcze i gastronomia", color: PRESET_COLORS[7] },
    { name: "Prezenty dla kogoś", description: "Upominki i podarunki", color: PRESET_COLORS[8] },
    { name: "Sport", description: "Aktywność fizyczna", color: PRESET_COLORS[9] },
    { name: "Transport", description: "Pojazdy i komunikacja", color: PRESET_COLORS[10] },
    { name: "Ubrania", description: "Odzież i obuwie", color: PRESET_COLORS[11] },
    { name: "Wydatki domowe", description: "Bieżące utrzymanie domu", color: PRESET_COLORS[12] },
    { name: "Wyjścia i wydarzenia", description: "Kultura i eventy", color: PRESET_COLORS[13] },
    { name: "Zakupy dla kogos", description: "Zakupy grzecznościowe", color: PRESET_COLORS[14] },
    { name: "Zdrowie", description: "Leczenie i profilaktyka", color: PRESET_COLORS[0] },
    { name: "Zwierzęta", description: "Artykuły dla zwierząt", color: PRESET_COLORS[1] },

    // --- Subcategories ---
    
    // Dom
    { name: "AGD", parent: "Dom", description: "Duże i małe sprzęty gospodarstwa domowego, np. pralki, odkurzacze." },
    { name: "Materiały remontowe", parent: "Dom", description: "Farby, kleje, kafelki i inne materiały budowlane." },
    { name: "Meble", parent: "Dom", description: "Meble pokojowe, kuchenne, biurowe i ogrodowe." },
    { name: "RTV", parent: "Dom", description: "Telewizory, sprzęt audio i akcesoria radiowo-telewizyjne." },
    { name: "Smart home", parent: "Dom", description: "Urządzenia inteligentnego domu, czujniki i automatyka." },
    { name: "Usługi remontowe", parent: "Dom", description: "Opłaty za fachowców, hydraulików i usługi budowlane." },
    { name: "Wyposażenie", parent: "Dom", description: "Elementy dekoracyjne, oświetlenie i tekstylia domowe." },

    // Dzieci
    { name: "Akcesoria", parent: "Dzieci", description: "Wózki, foteliki, smoczki i inne akcesoria niemowlęce." },
    { name: "Dzieci - inne", parent: "Dzieci", description: "Nieskategoryzowane wydatki związane z wychowaniem dzieci." },
    { name: "Opieka", parent: "Dzieci", description: "Opłaty za żłobek, przedszkole lub opiekunkę." },
    { name: "Rozrywka", parent: "Dzieci", description: "Bilety do sal zabaw, kina dla dzieci i inne atrakcje." },
    { name: "Zabawki", parent: "Dzieci", description: "Klocki, gry, lalki i artykuły do zabawy." },
    { name: "Zdrowie", parent: "Dzieci", description: "Wizyty lekarskie i leki przeznaczone dla dzieci." },

    // Edukacja
    { name: "Muzyka", parent: "Edukacja", description: "Lekcje gry na instrumentach i materiały muzyczne." },
    { name: "Opłaty", parent: "Edukacja", description: "Czesne za szkołę, opłaty egzaminacyjne i kursy." },
    { name: "Pomoce naukowe", parent: "Edukacja", description: "Podręczniki, zeszyty i artykuły piśmiennicze do nauki." },

    // Elektronika (Root only)

    // Hobby i rozrywka
    { name: "Filmy", parent: "Hobby i rozrywka", description: "Zakup filmów, płyt DVD/Blu-ray oraz subskrypcje VOD." },
    { name: "Fotografia", parent: "Hobby i rozrywka", description: "Sprzęt fotograficzny, obiektywy i wywoływanie zdjęć." },
    { name: "Gry i Planszowki", parent: "Hobby i rozrywka", description: "Gry planszowe, karciane, komputerowe i na konsole." },
    { name: "Książki i magazyny", parent: "Hobby i rozrywka", description: "Książki papierowe, ebooki, prasa i czasopisma." },
    { name: "Muzyka", parent: "Hobby i rozrywka", description: "Płyty CD, winyle oraz cyfrowe subskrypcje muzyczne." },
    { name: "Puzzle", parent: "Hobby i rozrywka", description: "Puzzle i układanki logiczne." },
    { name: "Wyjścia i wydarzenia", parent: "Hobby i rozrywka", description: "Bilety na koncerty, do teatru, opery lub kina." },
    { name: "Zajęcia plastyczne", parent: "Hobby i rozrywka", description: "Materiały do malowania, rysowania i rękodzieła." },

    // Inne (Root only)

    // Jedzenie
    { name: "Alkohol", parent: "Jedzenie", description: "Napoje alkoholowe kupowane w sklepach." },
    { name: "Dom", parent: "Jedzenie", description: "Codzienne zakupy spożywcze i produkty do gotowania w domu." },
    { name: "Dostawa", parent: "Jedzenie", description: "Zamawianie jedzenia z dowozem (np. Uber Eats, Pyszne)." },
    { name: "Miasto", parent: "Jedzenie", description: "Posiłki w restauracjach, kawiarniach, barach i fast-foodach." },

    // Prezenty dla kogoś (Root only)

    // Sport
    { name: "Pływanie", parent: "Sport", description: "Bilety na basen i akcesoria pływackie." },
    { name: "Rolki", parent: "Sport", description: "Sprzęt i akcesoria do jazdy na rolkach." },
    { name: "Rower", parent: "Sport", description: "Zakup roweru, części zamienne i serwis rowerowy." },
    { name: "Siłownia", parent: "Sport", description: "Karnety na siłownię i do klubów fitness." },
    { name: "Sport - inne", parent: "Sport", description: "Sprzęt i opłaty za inne aktywności sportowe." },
    { name: "Sporty letnie", parent: "Sport", description: "Sprzęt do sportów wodnych, tenisa i aktywności letnich." },
    { name: "Sporty zimowe", parent: "Sport", description: "Narty, snowboard, karnety na stoki i odzież zimowa." },

    // Transport
    { name: "Benzyna", parent: "Transport", description: "Tankowanie paliwa do samochodu prywatnego." },
    { name: "MPK", parent: "Transport", description: "Bilety komunikacji miejskiej (autobusy, tramwaje, metro)." },
    { name: "Myjnia", parent: "Transport", description: "Usługi myjni samochodowych ręcznych i automatycznych." },
    { name: "Opony", parent: "Transport", description: "Zakup opon, wulkanizacja i wymiana kół." },
    { name: "Parking", parent: "Transport", description: "Opłaty za parkometry, parkingi strzeżone i garaże." },
    { name: "Serwis", parent: "Transport", description: "Naprawy mechaniczne, przeglądy i części samochodowe." },
    { name: "Taxi", parent: "Transport", description: "Przejazdy taksówkami i aplikacjami typu Uber/Bolt prywatnie." },
    { name: "Transport - Inne", parent: "Transport", description: "Opłaty za autostrady i inne koszty transportowe." },

    // Ubrania
    { name: "Akcesoria", parent: "Ubrania", description: "Dodatki odzieżowe, paski, torebki, czapki i biżuteria." },
    { name: "Buty", parent: "Ubrania", description: "Obuwie codzienne, sportowe i wyjściowe." },
    { name: "Ubrania", parent: "Ubrania", description: "Odzież codzienna, bielizna i okrycia wierzchnie." },

    // Wydatki domowe
    { name: "Akcesoria kuchenne", parent: "Wydatki domowe", description: "Garnki, patelnie, noże i drobne przybory kuchenne." },
    { name: "Chemia", parent: "Wydatki domowe", description: "Środki czystości, proszki do prania i detergenty." },
    { name: "Dom - inne", parent: "Wydatki domowe", description: "Drobne wydatki gospodarstwa domowego." },
    { name: "Narzędzia", parent: "Wydatki domowe", description: "Narzędzia warsztatowe, śruby i artykuły naprawcze." },
    { name: "Ogród", parent: "Wydatki domowe", description: "Rośliny, ziemia, doniczki i narzędzia ogrodnicze." },
    { name: "Pranie", parent: "Wydatki domowe", description: "Usługi pralni chemicznej, magla i poprawki krawieckie." },
    { name: "Remont", parent: "Wydatki domowe", description: "Drobne naprawy i konserwacja mieszkania." },
    { name: "Różne", parent: "Wydatki domowe", description: "Papier toaletowy, chusteczki higieniczne i inne artykuły domowe trudne do skategoryzowania" },
    { name: "Usługi domowe", parent: "Wydatki domowe", description: "Usługi sprzątania, pomocy domowej i kominiarskie." },
    { name: "Wyposażenie", parent: "Wydatki domowe", description: "Drobne elementy wyposażenia wnętrz." },

    // Wyjścia i wydarzenia (Root only)

    // Zakupy dla kogos
    { name: "Rodzice Agnieszki", parent: "Zakupy dla kogos", description: "Zakupy robione na rzecz rodziców Agnieszki." },
    { name: "Rodzice Bartka", parent: "Zakupy dla kogos", description: "Zakupy robione na rzecz rodziców Bartka." },

    // Zdrowie
    { name: "Badania", parent: "Zdrowie", description: "Płatne badania laboratoryjne i diagnostyczne." },
    { name: "Dentysta", parent: "Zdrowie", description: "Leczenie stomatologiczne, ortodoncja i higiena jamy ustnej." },
    { name: "Fizjoterapeuta", parent: "Zdrowie", description: "Wizyty u fizjoterapeuty i zabiegi rehabilitacyjne." },
    { name: "Fryzjer i kosmetyczka", parent: "Zdrowie", description: "Usługi fryzjerskie, barber i zabiegi kosmetyczne." },
    { name: "Inne", parent: "Zdrowie", description: "Inne wydatki związane ze zdrowiem i urodą." },
    { name: "Kosmetyki", parent: "Zdrowie", description: "Kosmetyki do pielęgnacji ciała, twarzy i makijażu." },
    { name: "Lekarz", parent: "Zdrowie", description: "Prywatne wizyty lekarskie i konsultacje specjalistyczne." },
    { name: "Leki", parent: "Zdrowie", description: "Leki na receptę, suplementy i artykuły apteczne." },
    { name: "Masażysta", parent: "Zdrowie", description: "Masaże lecznicze i relaksacyjne." },
    { name: "Okulista i okulary", parent: "Zdrowie", description: "Badanie wzroku, zakup okularów i soczewek kontaktowych." },
    { name: "Ortodonta", parent: "Zdrowie", description: "Leczenie wad zgryzu i aparaty ortodontyczne." },
    { name: "Psycholog", parent: "Zdrowie", description: "Psychoterapia i konsultacje psychologiczne." },
    { name: "Szczepienie", parent: "Zdrowie", description: "Szczepienia ochronne i iniekcje." },

    // Zwierzęta
    { name: "Fizjoterapia", parent: "Zwierzęta", description: "Zabiegi rehabilitacyjne dla zwierząt." },
    { name: "Jedzenie", parent: "Zwierzęta", description: "Karma sucha, mokra i przysmaki dla zwierząt." },
    { name: "Weterynarz", parent: "Zwierzęta", description: "Wizyty w lecznicy, badania i zabiegi weterynaryjne." },
    { name: "Zabawki", parent: "Zwierzęta", description: "Gryzaki, piłki i akcesoria do zabawy dla zwierząt." },
    { name: "Zwierzeta - Inne", parent: "Zwierzęta", description: "Inne wydatki związane z utrzymaniem pupila." },
    { name: "Żwirek", parent: "Zwierzęta", description: "Żwirek do kuwety, podkłady i worki." }
  ]
};
