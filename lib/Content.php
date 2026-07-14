<?php

declare(strict_types=1);

/**
 * Sternenflunk-Redaktion: sämtliche Textpools — für jedes Paar, jede Kombination.
 *
 * Tonlage: liebevoll frotzelnd, nie verletzend. Frivol heißt zwinkernd,
 * nicht explizit. Alle Texte funktionieren für jede Namens- und
 * Zeichen-Kombination (auch zweimal dasselbe Zeichen) und jedes Geschlecht —
 * deshalb: keine Pronomen für {PARTNER}, keine Rollen-Klischees.
 *
 * Platzhalter (füllt der Generator):
 *   {NAME} {PARTNER} {SIGN} {SIGN_PLURAL}   — Personen-Sektionen
 *   {A} {B} {WER} {ANDERE}                  — Paar-Sektionen ({WER} = fair gewürfelt)
 *   {ZEIT} {SUNSET} {MIN} {BIS} {ORT} {LABEL}
 */
final class Content
{
    // ------------------------------------------------------------------ Mottos

    public const MOTTOS = [
        'Heute bist du 90 % Sternenstaub und 10 % Koffein.',
        'Das Universum liefert heute ohne Sendungsverfolgung.',
        'Merkur sagt: Du bist nicht schuld. Diesmal.',
        'Die Sterne stehen günstig. Klare Kaufempfehlung.',
        'Kosmische Großwetterlage: leicht magisch mit Chance auf Wunder.',
        'Heute gilt: erst Kaffee, dann Schicksal.',
        'Dein Schutzengel hat heute Rückenwind.',
        'Plot-Twist möglich. Popcorn bereithalten.',
        'Das Schicksal klopft heute höflich an, statt Sturm zu klingeln.',
        'Heute läuft alles nach Plan. Nach wessen Plan, bleibt offen.',
        'Die Milchstraße hat dich heute auf der Gästeliste.',
        'Achtung: erhöhte Wahrscheinlichkeit für gute Laune ohne Grund.',
        'Das Universum flüstert heute. Wer lauscht, hört Komplimente.',
        'Heute bist du der Hauptgewinn in der Lotterie eines anderen.',
        'Sterne lügen nie. Sie flunkern nur berufsbedingt.',
        'Der Kosmos hat heute Sonderangebote: Gelassenheit, zweite Reihe links.',
        'Heute ist ein guter Tag, um recht zu haben. Oder glücklich. Such es dir aus.',
        'Galaktischer Servicehinweis: Dein Glück wurde auf heute datiert.',
        'Die Planeten tanzen heute Foxtrott. Du gibst den Takt an.',
        'Heute wird ein Tag, über den ihr noch in Jahren redet. Vermutlich beim Abendessen.',
        'Vorsicht: Deine Ausstrahlung könnte heute Satelliten blenden.',
        'Das Universum spielt heute deine Playlist.',
        'Sterne-Update installiert. Neue Funktion: alles wird gut.',
        'Heute fällt dir etwas zu, das andere suchen müssen: der richtige Moment.',
        'Kosmischer Kassenbon: Heute wird dir mehr zurückgegeben, als du gibst.',
        'Der Horizont hat heute extra für dich aufgeräumt.',
    ];

    // -------------------------------------------------------- Kosmisches Wetter

    public const WEATHER = [
        'Heiter bis magisch, örtlich Glitzerschauer, abends romantische Aufklarung.',
        'Leichter Merkur-Nebel am Vormittag, löst sich nach dem zweiten Kaffee auf.',
        'Sternschnuppen-Wahrscheinlichkeit 12 % — Wunsch-Bereitschaft trotzdem auf 100 % halten.',
        'Stabile Hochdrucklage über dem Sofa, vereinzelt Zärtlichkeitsböen.',
        'Kosmischer Rückenwind aus Richtung Venus, Stärke 4 bis Verliebtheit.',
        'Vormittags Gedankenwolken, nachmittags klare Sicht auf das Wesentliche.',
        'Aurora-Aktivität im Herzbereich: deutlich erhöht.',
        'Örtlich Kuschelfronten, die sich bis in die Nacht halten.',
        'Sonnig mit vereinzelten Geistesblitzen aus westlicher Richtung.',
        'Milde Sternenbrise, ideal zum Auslüften alter Sorgen.',
        'Über {ORT} funkeln heute 3 % mehr Sterne als bestellt.',
        'Planetenstau auf der Ekliptik — bitte Geduld im Gefühlsverkehr.',
        'Leicht wechselhaft: erst Alltag, dann plötzlich Magie.',
        'Warnung vor spontanen Glücksgefühlen in geschlossenen Räumen.',
        'Meteorologisch unauffällig, astrologisch spektakulär.',
        'Die Nacht wird klar. Beste Bedingungen für Geständnisse und Balkon.',
        'Gefühlslage föhnig: warm, trocken, leicht elektrisierend.',
        'Kosmische Sichtweite: bis übermorgen.',
    ];

    // ------------------------------------------------- Astro-Fakt zum Klugscheißern

    public const FACTS = [
        'Der Krebsnebel ist der Überrest einer Supernova aus dem Jahr 1054 — quasi ein sehr altes Feuerwerk, das immer noch läuft.',
        'Antares, der Hauptstern des Skorpions, ist rund 700-mal größer als die Sonne. Der Himmel kennt kein Understatement.',
        'Im Sternbild Krebs liegt der Sternhaufen Praesepe, „die Krippe“ — mit bloßem Auge ein Nebelfleck, mit Fernglas eine Party.',
        'Der Mond entfernt sich jedes Jahr 3,8 cm von der Erde. Selbst der Mond braucht manchmal Abstand. Ihr nicht.',
        'Licht von der Sonne braucht 8 Minuten und 20 Sekunden bis zu euch. Komplimente wirken schneller.',
        'Die ISS fliegt mit 28.000 km/h um die Erde — die schnellste WG der Menschheit.',
        'Ein Teelöffel Neutronenstern wiegt etwa eine Milliarde Tonnen. Zum Vergleich: euer Wäscheberg fühlt sich nur so an.',
        'Auf der Voyager-Sonde fliegt eine goldene Schallplatte mit Grüßen der Menschheit. Ein Mixtape, 25 Milliarden Kilometer unterwegs.',
        'Der Mond ist im Schnitt 384.400 km entfernt und trotzdem für Ebbe und Flut zuständig. Fernbeziehungen können funktionieren.',
        'Die Venus dreht sich rückwärts. Irgendeiner muss ja gegen den Strom schwimmen.',
        'Sterne funkeln nicht — die Erdatmosphäre zittert. Der Himmel hat also auch manchmal weiche Knie.',
        'Im Kern der Sonne dauert die Reise eines Photons nach außen bis zu 100.000 Jahre. Und ihr beschwert euch über die Bahn.',
        'Der Große Wagen ist kein Sternbild, sondern nur ein Teil vom Großen Bären. Auch der Himmel hat Abkürzungen.',
        'Jupiter beschützt die Erde, indem er Asteroiden mit seiner Schwerkraft absaugt — der Türsteher des Sonnensystems.',
        'Auf dem Mars geht die Sonne blau unter. Romantik ist überall, nur die Farbpalette wechselt.',
        'Eine Galaxie hat im Schnitt 100 Milliarden Sterne. Und trotzdem schaut ihr euch gegenseitig an. Statistisch rührend.',
        'Schwarze Löcher verschlucken sogar Licht. Ähnliches gilt für Sofas und Socken.',
        'Der Sternenhimmel, den ihr seht, ist Vergangenheit — manche Sterne sind längst woanders. Der Himmel postet also auch nur alte Fotos.',
        'Saturn würde in einer riesigen Badewanne schwimmen — seine Dichte ist geringer als Wasser. Wellness-Planet.',
        'Der Polarstern ist gar nicht der hellste Stern am Himmel, nur der mit dem besten Job. Positionierung ist alles.',
    ];

    // ------------------------------------------------------------- Numerologie

    public const NUMEROLOGY = [
        1 => 'Die 1 steht heute für: Anfänge, Alleingänge und das erste Wort beim Frühstück.',
        2 => 'Die 2 steht heute für: Paare, Parallelen und doppelten Espresso.',
        3 => 'Die 3 steht heute für: aller guten Dinge, dritte Versuche und Dreiklang im Feierabend.',
        4 => 'Die 4 steht heute für: stabile Stühle, stabile Beziehungen, stabile WLAN-Verbindung.',
        5 => 'Die 5 steht heute für: fünf Minuten länger liegen bleiben. Genehmigt.',
        6 => 'Die 6 steht heute für: Gemütlichkeit mit System und ein Sechser-Gefühl im Bauch.',
        7 => 'Die 7 steht heute für: Glück, Zwerge und die Erkenntnis, dass eine Woche schneller rum ist als gedacht.',
        8 => 'Die 8 steht heute für: Unendlichkeit, nur einmal umgefallen. Gilt auch für eure Geduld.',
        9 => 'Die 9 steht heute für: fast am Ziel — der letzte Schritt ist der mit dem Applaus.',
    ];

    // -------------------------------------------------------------- Mondphasen

    public const MOON_TEXTS = [
        'neu' => [
            'Neumond: Der Himmel macht das Licht aus und flüstert „Neustart“. Guter Tag, um Dinge anzufangen, die niemand sieht.',
            'Neumond: beste Bedingungen für geheime Pläne und ungestörtes Kuscheln — nicht mal der Mond guckt zu.',
            'Neumond: Das Universum hat den Reset-Knopf gedrückt. Passwörter bleiben zum Glück gespeichert.',
            'Neumond: Dunkelster Himmel des Monats. Perfekt, um Sterne zu zählen oder einfach früh ins Bett zu fallen.',
        ],
        'zunehmend' => [
            'Der Mond nimmt zu und ist völlig entspannt dabei. Nehmt euch ein Beispiel.',
            'Zunehmender Mond: Alles wächst gerade — Pläne, Vorfreude, der Stapel ungelesener Nachrichten.',
            'Der Mond baut gerade auf. Ideale Phase für Projekte, Vorsätze und zweite Portionen.',
            'Zunehmender Mond: Rückenwind für alles, was größer werden soll. Ausgenommen Diskussionen.',
            'Der Mond ist im Aufbau-Training und postet keine Fortschrittsfotos. Vorbildlich.',
        ],
        'voll' => [
            'Vollmond! Alle sind heute etwas drüber — aber ihr wenigstens gemeinsam.',
            'Vollmond: maximale Beleuchtung, maximale Gefühle. Der Himmel hat das Flutlicht angemacht.',
            'Vollmond: Wer heute schlecht schläft, darf offiziell den Mond beschuldigen. Einmalige Gelegenheit.',
            'Vollmond: 100 % Beleuchtung, 0 % Diskretion. Der perfekte Abend für große Auftritte am Balkonfenster.',
        ],
        'abnehmend' => [
            'Abnehmender Mond: Der Himmel macht vor, wie Loslassen geht. Der Wäscheberg wäre ein Anfang.',
            'Der Mond nimmt ab — ganz ohne App, ohne Punkte zählen, ohne Verzicht. Respekt.',
            'Abnehmender Mond: gute Phase zum Ausmisten. Sorgenkiste und Krimskrams-Schublade zählen beide.',
            'Der Mond zieht sich dezent zurück. Ihr dürft es ihm heute Abend gleichtun.',
            'Abnehmender Mond: Ballast abwerfen erlaubt. Sorgen zuerst, Sarkasmus dürft ihr behalten.',
        ],
    ];

    // ------------------------------------------------------------ Sonnen-Trend

    public const SUN_LONGER = [
        'Der Tag ist {MIN} Min länger als gestern — die Sonne gibt eine Zugabe.',
        '{MIN} Min mehr Tageslicht als gestern. Verwendungszweck: frei wählbar, Vorschlag: Balkon.',
        'Heute gibt es {MIN} Min Licht extra. Ein Geschenk, keine Verpflichtung.',
    ];

    public const SUN_SHORTER = [
        'Der Tag ist {MIN} Min kürzer als gestern — die Sonne knausert schon wieder.',
        '{MIN} Min weniger Tageslicht als gestern. Die Sonne macht Homeoffice.',
        'Heute fehlen {MIN} Min Licht. Kompensation: Kerzen, Bildschirme, Ausstrahlung.',
    ];

    public const SUN_EQUAL = [
        'Tageslänge exakt wie gestern. Die Sonne hat heute Dienst nach Vorschrift.',
        'Heute genau so lang wie gestern — das Universum kopiert sich selbst. Kommt vor.',
    ];

    // ---------------------------------------------------------- Merkur & Saison

    public const MERCURY_TEXTS = [
        'Merkur ist rückläufig (noch bis {BIS}). Backups machen, alte Chats nicht aufwärmen, Nachrichten zweimal lesen.',
        'Merkur läuft rückwärts (bis {BIS}) — Missverständnisse haben Hochsaison. Im Zweifel: nochmal nett fragen.',
        'Merkur retro (bis {BIS}): Technik zickt, Termine rutschen, und niemand kann etwas dafür. Praktisch.',
        'Merkur ist rückläufig — bis {BIS} ist der offizielle Sündenbock für alles damit gestellt.',
    ];

    public const SEASON_HOME = [
        'Heimspiel für {NAME}! Erhöhte Trefferquote, Sonderrechte am Kühlschrank.',
        '{NAME} hat gerade kosmisches Heimrecht. Einspruch zwecklos.',
        '{SIGN}-Saison: {NAME} spielt in der eigenen Liga — Logenplätze für die Begleitung.',
        'Die Sonne steht im Zeichen von {NAME}. Bitte entsprechend behandeln: wie Besuch, nur mit Hausschlüssel.',
    ];

    public const SEASON_BOTH = [
        'Doppeltes Heimspiel! Die {SIGN}-Saison gehört euch beiden. Der Kosmos bittet um Zurückhaltung beim Triumphieren.',
        '{SIGN}-Saison für euch beide — Heimvorteil im Quadrat, Gegner: keine.',
        'Eure gemeinsame Saison: zwei {SIGN_PLURAL} mit Heimrecht. Die Nachbar-Sternzeichen sind still neidisch.',
    ];

    public const SEASON_GENERIC = [
        'Kein Heimspiel für euch beide — offiziell neutraler Boden, faire Verhandlungen.',
        'Fremdes Revier, aber ihr habt ja euch.',
        'Gastauftritt für euch beide — benehmt euch wie immer: nicht ganz.',
    ];

    // ================================================== Kategorien (für beide)

    public const LIEBE = [
        '{PARTNER} sendet heute auf deiner Frequenz. Kein Rauschen, nur Signal.',
        'Venus routet heute alle Herzenspost direkt zu {PARTNER}. Zustellung garantiert, Empfang bitte mit Kuss quittieren.',
        'Ein kleines Kompliment wirkt heute wie ein großes. Sag es vor dem Frühstück.',
        'Halte heute die Hand von {PARTNER} wie das letzte funktionierende Ladekabel im Haus.',
        'Heute verstehst du {PARTNER} ohne Worte. Zur Sicherheit trotzdem welche benutzen, schöne am besten.',
        'Die Sterne empfehlen eine Umarmung von mindestens 20 Sekunden. Das ist keine Bitte, das ist ein Wartungsfenster.',
        'Liebesprognose: stabil mit Aussicht auf spontane Küsse in der Küche.',
        'Venus flüstert: Sag {PARTNER} heute, was du bewunderst. Das wird gesammelt. Heimlich.',
        'Heute zählt Anwesenheit mehr als Argumente. Einfach da sein, vielleicht mit Tee.',
        'Die Sterne haben nachgerechnet: Mit {PARTNER} an deiner Seite steigt deine Glücksrendite zweistellig.',
        'Heute Abend gilt: Bildschirme aus, {PARTNER} an. Beste Auslastung seit Wochen.',
        'Ein alter Insider-Witz taucht heute wieder auf und wirkt wie neu.',
        'Die Konstellation sagt: Wer heute zuerst „Sorry“ sagt, gewinnt doppelt. Du bist schnell. Nutze das.',
        'Venus empfiehlt Körperkontakt in Alltagssituationen: Hand auf Schulter beim Vorbeigehen. Wirkt Wunder, kostet nichts.',
        'Pluto rät zu einem Überraschungsangriff: Kuss zwischen Tür und Angel, ohne Vorwarnung.',
        'Dein Herz schließt heute den größten Deal des Tages ab: Verlängerung mit {PARTNER}, unbefristet.',
        'Die Sterne notieren: {PARTNER} hat heute Zuneigung verdient. Grund: einfach so.',
        'Heute lohnt Geduld: {PARTNER} braucht drei Sätze Anlauf, dann kommt etwas Wunderschönes.',
    ];

    public const ENERGIE = [
        'Dein Körper hat heute mehr vor als du. Lass dich überraschen.',
        'Die Treppe zählt heute doppelt. Der Aufzug weiß das und schmollt.',
        'Beste Bewegungszeit laut Kosmos: {ZEIT} Uhr. Danach Duschen mit Triumphgefühl.',
        'Heute schaffst du eine Wiederholung mehr als beim letzten Mal. Die Sterne haben mitgezählt.',
        'Dein Schlaf von letzter Nacht wirkt heute doppelt. Zinseszins für Ausgeschlafene.',
        'Zwei Liter Wasser stehen heute zwischen dir und Weltklasse. Die Flasche wartet.',
        'Rest Day? Die Sterne lachen freundlich und bestehen wenigstens auf Stretching.',
        'Dein Energielevel macht heute anderen Angst. Im besten Sinne.',
        '15 Minuten Sonne rufen nach dir. {ORT} liefert heute — das Fenster zählt zur Not auch.',
        'Achtsamkeits-Minute um {ZEIT} Uhr einplanen. Danach bist du offiziell unbesiegbar.',
        'Heute schmeckt Gesundes zufällig auch noch gut. Seltene Konstellation, ausnutzen.',
        'Ein Spaziergang ohne Ziel ist heute die beste Investition. Der Umweg ist die Strecke.',
        'Dein Immunsystem hat heute Bodyguard-Energie. Sonnenbrille optional.',
        'Innere Balance heute: 96 %. Die restlichen 4 % sind gesunde Ungeduld.',
        'Ein Nickerchen ist heute keine Faulheit, sondern Wartung. Der Kosmos stempelt es ab.',
        'Heute knackst du eine Bestzeit. Vielleicht nur beim Treppensteigen, aber Bestzeit ist Bestzeit.',
        'Dein Puls läuft heute im Takt des Universums. Und deiner Lieblings-Playlist.',
        'Muskelkater-Prognose: 40 %, mit Stolz-Garantie.',
    ];

    public const ERFOLG = [
        'Heute gelingt dir etwas beim ersten Versuch. Misstraue dem Frieden, genieße das Ergebnis.',
        'Ein „Nein“ ist heute nur ein „Ja“ im Larvenstadium.',
        'Starte mit der kleinsten Aufgabe — der Rest fällt wie Dominosteine.',
        'Heute erledigst du in 20 Minuten, wovor du drei Tage Respekt hattest.',
        'Merkur segnet heute deine Nachrichten: Antworten kommen schneller als erwartet.',
        'Wer heute nachfasst, bekommt morgen recht. Sagt das Karma-Verzeichnis der Sterne.',
        'Besprechungen laufen heute 20 % kürzer, weil du auf den Punkt kommst. Alle danken dir still.',
        'Dein Bauchgefühl ist heute der beste Berater im Raum. Und der günstigste.',
        'Ein Plan von früher taucht heute wieder auf. Jetzt ist sein Moment.',
        'Heute lohnt Großzügigkeit: eine Runde Kaffee für die Beziehung, aufs Haus.',
        'Budget-Tipp des Kosmos: Investier heute in Erinnerungen. Kurs steigt garantiert.',
        'Der Papierkram von letzter Woche ergibt sich heute kampflos. Zugreifen.',
        'Heute darfst du etwas kaufen, das du nicht brauchst, aber verstehst. Das Universum drückt beide Augen zu.',
        'Die Aufgabe, die du aufschiebst, dauert in Wahrheit 4 Minuten. Die Sterne haben gestoppt.',
        'Heute gewinnst du jedes Gespräch in den ersten 30 Sekunden. Der Rest ist Auslaufzone.',
        'Dein Timing ist heute unheimlich: Du erwischst überall die kurze Schlange.',
        'Etwas, das andere längst abgeschrieben hatten, schließt du heute ab. Dein Spezialgebiet.',
        'Der Feierabend beginnt heute pünktlich. Das ist keine Prognose, das ist eine Anordnung.',
    ];

    public const KOPF = [
        'Dein Gehirn hat heute 47 Tabs offen. In dreien läuft Musik. Es ist trotzdem der beste Browser, den du kennst.',
        'Geistesblitz-Warnung für {ZEIT} Uhr. Zettel bereitlegen oder {PARTNER} Bescheid sagen.',
        'Heute erkennst du ein Muster, das sonst niemand sieht. Wie immer eigentlich.',
        'Deine Gedanken laufen heute in 4K. Untertitel für Außenstehende optional.',
        'Nach dem Sozialen ein Solo-Fenster einplanen. Das ist Wartung, kein Rückzug.',
        'Deine Intuition sitzt heute in der Chefetage. Vertrau ihr.',
        'Heute fällt dir der Name ein, der dir vorgestern nicht einfiel. Um {ZEIT} Uhr, aus dem Nichts.',
        'Dein Kopf springt heute elegant von Thema zu Thema. Das ist kein Chaos, das ist Parkour.',
        'Eine Erinnerung besucht dich heute unangemeldet und bringt gute Laune mit.',
        'Heute verstehst du einen Witz von letzter Woche. Lach ruhig laut.',
        'Melancholie-Fenster gegen {ZEIT} Uhr: zulässig, mit Tee sogar gemütlich.',
        'Dein innerer Monolog hat heute Publikum verdient. {PARTNER} zählt als Publikum.',
        'Kreativitäts-Hoch: Was du heute anfängst, hat Hand und Fuß und Flügel.',
        'Der Ohrwurm von heute ist morgen weg. Der Kosmos verspricht es. Halbherzig.',
        'Heute darfst du eine Meinung ändern. Das ist kein Umfallen, das ist Aerodynamik.',
        'Dein Humor ist heute schneller als dein Filter. Die Umgebung wird es lieben. Meistens.',
        'Heute liest du zwischen den Zeilen — und findet da ein Kompliment.',
        'Konzentrations-Fenster: {ZEIT} Uhr. Was auch immer dann passiert — es wird gründlich.',
    ];

    // ------------------------------------------------ Sternzeichen-Ansagen (12)

    /** Die Zeichen-Stimme: pro Zeichen eine tägliche Durchsage. */
    public const SIGN_SPRUECHE = [
        'widder' => [
            'Widder-Ansage: Wer zuerst losläuft, darf die Richtung unterwegs klären. Du läufst bereits.',
            'Deine Geduld hat heute die Länge eines Espresso. Reicht trotzdem für alles Wichtige.',
            'Widder-Modus: Anlauf ist was für andere. Du startest aus dem Stand.',
            'Heute gilt: erst machen, dann googeln, ob man das so macht. Hat bisher immer geklappt.',
            'Dein innerer Motor läuft heute im roten Bereich. Das ist bei dir der Normalbereich.',
        ],
        'stier' => [
            'Stier-Ansage: Du bist nicht stur, du bist stabil. Mit Meinung.',
            'Genuss-Level heute: amtlich. Der Nachtisch ist keine Option, sondern ein Termin.',
            'Heute bewegst du dich exakt so schnell wie nötig. Der Kosmos nennt es Souveränität.',
            'Dein Beharrungsvermögen ist heute eine Superkraft. Das Sofa bestätigt.',
            'Stier-Weisheit: Gut Ding will Weile. Sehr gut Ding will Decke und Snacks.',
        ],
        'zwillinge' => [
            'Zwillinge-Ansage: Du hast heute zu allem zwei Meinungen. Beide sind gut.',
            'Dein Gesprächskontingent ist unbegrenzt. Das der anderen nicht — dosier weise.',
            'Heute wechselst du dreimal das Thema, ohne den Faden zu verlieren. Zirkusreif.',
            'Neugier-Level: Weltraumteleskop. Heute entdeckst du garantiert etwas.',
            'Zwillinge-Modus: Plan A und Plan B laufen heute parallel. Einer gewinnt, beide hatten Spaß.',
        ],
        'krebs' => [
            'Krebs-Ansage: Dein Panzer ist heute nur Deko. Die Tür an der Seite kennt eh nur eine Person.',
            'Gefühlstiefe heute: Marianengraben, aber gemütlich eingerichtet.',
            'Heute spürst du, was andere brauchen, bevor sie es sagen. Nutze das für Gutes.',
            'Dein Zuhause-Radar läuft auf Hochtouren: Du machst heute jeden Ort ein bisschen wärmer.',
            'Krebs-Modus: Erst fühlen, dann denken, dann Tee. Die Reihenfolge stimmt.',
        ],
        'loewe' => [
            'Löwen-Ansage: Die Bühne ist heute da, wo du stehst. Publikum findet sich.',
            'Deine Mähne sitzt heute auch metaphorisch. Auftritt nach Belieben.',
            'Großzügigkeits-Hoch: Du verteilst heute Komplimente wie Konfetti. Steht dir.',
            'Heute gilt: Wer glänzen kann, muss nicht blenden. Du kannst beides, wählst aber weise.',
            'Löwen-Modus: Drama nur in homöopathischen Dosen. Dafür Herz in Großpackung.',
        ],
        'jungfrau' => [
            'Jungfrau-Ansage: Deine Liste hat heute eine Unterliste. Und die funktioniert.',
            'Du siehst heute den Fehler im Detail und die Schönheit im Ganzen. Seltene Kombination.',
            'Perfektions-Level: 97,2 %. Die fehlenden 2,8 % sind Absicht — du nennst es Charme.',
            'Heute bringst du Ordnung in etwas, das andere für hoffnungslos hielten. Standing Ovations.',
            'Jungfrau-Modus: Qualitätskontrolle mit Herz. Bestanden haben heute: alle, die du liebst.',
        ],
        'waage' => [
            'Waagen-Ansage: Du wägst heute ab und findest die elegante Mitte. Wie immer, nur schneller.',
            'Harmonie-Level: diplomatische Spitzenklasse. Du könntest heute Verhandlungen zwischen Katzen moderieren.',
            'Heute entscheidest du dich in Rekordzeit: nur zweimal umentschieden. Neue Bestmarke.',
            'Dein Sinn für Schönheit läuft auf Anschlag. Selbst der Einkaufszettel wird heute ästhetisch.',
            'Waagen-Modus: Erst alle Seiten hören, dann charmant recht behalten.',
        ],
        'skorpion' => [
            'Skorpion-Ansage: Ein Blick von dir ersetzt heute drei Gespräche. Sparsam einsetzen.',
            'Intensität heute: serienmäßig 100 %. Es gibt keinen Sparmodus, und das ist gut so.',
            'Du durchschaust heute alles — auch, dass jemand heimlich stolz auf dich ist.',
            'Geheimnis-Level: Du weißt Dinge. Woher, bleibt dein Geheimnis. Natürlich.',
            'Skorpion-Modus: Tiefgang serienmäßig, Stachel im Halfter, Herz auf Empfang.',
        ],
        'schuetze' => [
            'Schütze-Ansage: Der Horizont ruft an und fragt, wann du kommst. Bald, sagst du. Wie immer.',
            'Optimismus-Level: ansteckend. Heute impfst du die Umgebung mit guter Laune.',
            'Deine Direktheit trifft heute ins Schwarze — und landet trotzdem im Herzen.',
            'Fernweh-Prognose: erhöht. Zur Not tut es heute auch der weiteste Weg zum Bäcker.',
            'Schütze-Modus: Ziel gesehen, Pfeil geschnitzt, gelacht, getroffen.',
        ],
        'steinbock' => [
            'Steinbock-Ansage: Dein Plan hat heute einen Plan. Beide funktionieren.',
            'Du erklimmst heute mühelos, wovor andere ein Basislager bräuchten.',
            'Dein trockener Humor hat heute Premiumqualität. Reifung: jahrelang, Abgang: perfekt.',
            'Disziplin-Level: Gipfelstürmer. Aber du machst Pausen — das ist der eigentliche Fortschritt.',
            'Steinbock-Modus: leise Ziele, laute Ergebnisse.',
        ],
        'wassermann' => [
            'Wassermann-Ansage: Deine Idee von gestern Nacht war doch nicht verrückt. Nur früh dran.',
            'Du denkst heute drei Ecken weiter. Die anderen kommen nach — gib ihnen einen Moment.',
            'Eigenwilligkeits-Level: Manufaktur. Dich gibt es nicht in Serie, zum Glück.',
            'Heute löst du ein Problem auf eine Art, die vorher niemand und danach jeder genial findet.',
            'Wassermann-Modus: Zukunft ist dein Heimatort, Besuch in der Gegenwart jederzeit willkommen.',
        ],
        'fische' => [
            'Fische-Ansage: Dein Tagtraum von heute hat Substanz. Notieren, nicht wegwinken.',
            'Intuition-Level: U-Boot-Sonar. Du empfängst heute Frequenzen, die andere nicht mal ahnen.',
            'Heute schwimmst du elegant um jedes Problem herum. Es merkt es nicht einmal.',
            'Deine Fantasie hat heute Flügel und Flossen. Amphibisch begabt, wie du selbst.',
            'Fische-Modus: halb hier, halb woanders — und genau deshalb ganz bei dir.',
        ],
    ];

    // ------------------------------------------------------------ Frivol-Sektion

    public const SPICE = [
        'Die Sterne empfehlen heute: Licht dimmen, Playlist an, Handy in ein anderes Land.',
        'Frivolitätsfenster: {ZEIT} Uhr. Pünktlichkeit wird belohnt.',
        'Dresscode heute Abend: weniger ist mehr, Socken optional, Grinsen verpflichtend.',
        'Venus hat für heute Nacht Überstunden angemeldet. Freiwillig.',
        'Prognose: erhöhte Knisterwahrscheinlichkeit ab Sonnenuntergang ({SUNSET} Uhr, der Himmel plant mit).',
        'Die Nachbarn hören heute Abend Musik. Gute Entscheidung von euch.',
        'Kosmischer Hinweis: Der Abwasch kann warten. Alles andere bitte nicht.',
        'Heute gilt Anziehungs-Physik: Sie wächst quadratisch mit der Nähe.',
        'Ein Blick reicht heute. {PARTNER} weiß Bescheid. Alle wissen Bescheid.',
        'Kosmische Ansage: Früh ins Bett heißt heute nicht früh schlafen.',
        'Die Sterne haben heute Nacht Sichtschutz gebucht. Aus Gründen.',
        'Ab {ZEIT} Uhr wird aus Feierabend Feuerabend.',
        'Dein Lieblingsduft hat heute Superkräfte. Einsatz nach eigenem Ermessen.',
    ];

    // --------------------------------------------------------------- Warnungen

    public const WARNUNG = [
        'Vorsicht um {ZEIT} Uhr: erhöhte Neigung, „nur noch kurz eine Sache“ zu machen. Zeitangabe ohne Gewähr.',
        'Heute besteht Verwechslungsgefahr zwischen „5 Minuten Pause“ und „3 Stunden Internet“.',
        'Kosmische Warnung: Der Wäscheberg plant heute seine Unabhängigkeit.',
        'Achtung: Ohrwurm-Gefahr Stufe Rot. Auslöser unbekannt, Dauer: bis Donnerstag.',
        'Achtung: Ein Browser-Tab von letzter Woche will heute endlich gelesen werden. Er kann weiter warten.',
        'Warnung: „Nur eine Folge“ hat heute eine Fehlertoleranz von plus drei.',
        'Achtung um {ZEIT} Uhr: Heißhunger-Fenster. Die Sterne empfehlen Nüsse. Du entscheidest dich anders. Auch gut.',
        'Vorsicht: Dein Kalender versucht heute eine Doppelbuchung. Er verliert, aber er versucht es.',
        'Warnung: erhöhtes Risiko, ein neues Hobby zu entdecken, das Platz braucht.',
        'Achtung: Du wirst heute einen Monolog beginnen, ohne es zu merken. {PARTNER} hat ein Zeichen vereinbart.',
        'Heute nicht googeln, was dieses Geräusch bedeutet. Merkur übertreibt. Wahrscheinlich.',
        'Warnung: Jemand sagt heute „Das haben wir schon immer so gemacht“. Tief durchatmen, lächeln, gewinnen.',
        'Achtung: Die Frage „Was wollen wir essen?“ erreicht heute Gefahrenstufe Gelb. Frühzeitig entschärfen.',
        'Vorsicht zwischen {ZEIT} und 20 Minuten später: erhöhte Diskussionsneigung über Kleinigkeiten mit Grundsatzpotenzial.',
    ];

    // ------------------------------------------------------------------- Glück

    /** @var array<int, array{0:string, 1:string}> [Name, Hex] */
    public const FARBEN = [
        ['Merkur-Magenta', '#C74468'],
        ['Galaxien-Lila', '#7B5BD6'],
        ['Horizont-Türkis', '#2596AC'],
        ['Champagner-Gold', '#D4B36A'],
        ['Mitternachts-Marine', '#2C3E6B'],
        ['Sonnenuntergangs-Orange', '#E8804F'],
        ['Matcha-Motivation', '#8FB861'],
        ['Sternenstaub-Silber', '#B9C0CE'],
        ['Vollmond-Elfenbein', '#EDE8D8'],
        ['Retrograd-Rot', '#C0392B'],
        ['Neumond-Navy', '#1F2547'],
        ['Sofa-Salbei', '#7FA07C'],
        ['Supernova-Senf', '#C9A227'],
        ['Andromeda-Flieder', '#A88FD8'],
        ['Meteoriten-Grau', '#8A8F98'],
        ['Karma-Karmin', '#D6455B'],
        ['Plasma-Petrol', '#20707F'],
        ['Glückskeks-Vanille', '#EFE3C0'],
        ['Espresso-Braun', '#6B4A32'],
        ['Kometen-Koralle', '#E07A6B'],
    ];

    public const ITEMS_COMMON = [
        'der Lieblingsbecher',
        'ein Zettel mit einem Ausrufezeichen',
        'das Ladekabel, das immer da wohnt, wo du bist',
        'ein Backup-Snack in der Tasche',
        'die Sonnenbrille für den Sieger-Walk',
        'ein Buch, aufgeschlagen auf Seite 73',
        'die Trinkflasche mit Ambitionen',
        'ein Kaugummi für die letzte Meile',
        'das gute Kopfkissen',
        'ein Stift, der wirklich schreibt',
        'der Zweitschlüssel (er weiß, wo er wohnt)',
        'eine Pflanze mit Namen',
        'das Notizbuch für große Pläne',
        'ein Regenschirm als Statement',
        'die Jacke mit der geheimen Innentasche',
        'ein Los, das du nie einlöst',
        'der Kühlschrankmagnet mit Meinung',
        'ein Teelicht mit Überstunden',
        'die Playlist von damals',
        'ein Apfel mit Auftritt',
    ];

    /** Zeichen-spezifische Glücksbringer (werden dem Common-Pool beigemischt). */
    public const ITEMS_SIGN = [
        'widder'     => ['ein Wecker ohne Snooze-Taste', 'die Turnschuhe direkt an der Tür', 'ein roter Stift für schnelle Entscheidungen', 'der Espresso, der eigentlich ein Doppelter ist'],
        'stier'      => ['die weiche Decke (die gute)', 'ein Stück dunkle Schokolade mit Herkunftsnachweis', 'der Lieblingsplatz, frisch verteidigt', 'das Kissen mit Memory-Effekt'],
        'zwillinge'  => ['zwei Bücher gleichzeitig', 'das Handy mit vier offenen Chats', 'ein Zettel für den zweiten Gedanken', 'die Kopfhörer für den Podcast'],
        'krebs'      => ['der Lieblings-Hoodie', 'eine Tasse Tee mit Amtsstatus', 'das gerahmte Foto an der Wand', 'die Sofadecke mit Stammplatz'],
        'loewe'      => ['die Sonnenbrille für den großen Auftritt', 'ein Spiegel mit gutem Licht', 'das Outfit mit Applausgarantie', 'die Playlist mit Fanfaren'],
        'jungfrau'   => ['ein frisch gespitzter Bleistift', 'die To-do-Liste (im Herzen laminiert)', 'ein Ordner, der endlich Ordnung hat', 'das Mikrofasertuch des Vertrauens'],
        'waage'      => ['zwei Optionen und eine Münze', 'die ästhetisch einwandfreie Kaffeetasse', 'ein Strauß Blumen (für die Balance)', 'das symmetrische Deko-Objekt'],
        'skorpion'   => ['das Parfüm mit Superkräften', 'eine Kerze mit Bedeutung', 'das Notizbuch mit Geheimnissen', 'der Blick — zählt heute als Gegenstand'],
        'schuetze'   => ['der Reisepass (griffbereit, man weiß nie)', 'die Landkarte mit Stecknadeln', 'ein Ticket ins Blaue', 'die Schuhe mit Fernweh'],
        'steinbock'  => ['der Kalender mit Farbcode', 'die Thermoskanne (Dienstgrad: Verlässlichkeit)', 'ein Ziel, ausgedruckt und aufgehängt', 'der solide Bergschuh'],
        'wassermann' => ['ein Gerät, das sonst niemand versteht', 'die Idee von gestern Nacht', 'ein Second-Hand-Fund mit Geschichte', 'das Kabel für später'],
        'fische'     => ['die Badewanne (zählt heute als Gegenstand)', 'ein Tagtraum to go', 'die Playlist zum Wegdriften', 'ein Glas Wasser mit Meerblick-Fantasie'],
    ];

    public const EMOJIS = ['✨', '🌙', '🔥', '🍀', '💫', '🧲', '🪐', '🌊', '⚡', '🎯', '🧿', '🌻', '🥇', '🫧', '🍯', '🔮', '🌈', '🛸', '🎲', '🧡'];

    // ------------------------------------------------------------- Energie-Peaks

    /** Peak-Texte nach Element-Chronotyp. */
    public const PEAK_TEXTE = [
        'feuer' => [
            'Frühzünder-Fenster: Da bist du unschlagbar — der Tag gehört denen, die zuerst zünden.',
            'Beste Zeit für den mutigsten Punkt auf der Liste.',
            'Volle Flamme: Was du jetzt anfängst, brennt den ganzen Tag weiter.',
            'Wer dich in diesem Fenster erreicht, hat Glück. Oder einen sehr guten Plan.',
        ],
        'erde' => [
            'Da läuft dein Uhrwerk am rundesten — beste Zeit für alles mit Substanz.',
            'Dein produktivstes Fenster: solide, gründlich, unaufhaltsam.',
            'Jetzt bewegst du Dinge, die andere für festgewachsen hielten.',
            'Beste Zeit für das, was liegen geblieben ist. Es hat Angst. Zu Recht.',
        ],
        'luft' => [
            'Nachmittagsbrise: Jetzt fliegen dir Ideen zu — Fangnetz bereithalten.',
            'Dein Gesprächs-Hoch: Wer jetzt mit dir verhandelt, unterschreibt lächelnd.',
            'Beste Zeit für Pläne, Post und Pointen.',
            'Jetzt bist du am schnellsten — im Kopf, im Witz, im Weiterdenken.',
        ],
        'wasser' => [
            'Abendtiefe: Ab da läuft dein Kopf auf Vollgas — perfekt fürs Lieblingsprojekt.',
            'Dein Fenster: Die Welt wird leiser, du wirst klarer.',
            'Gefühl und Fokus in Bestform — jetzt gelingen die wichtigen Gespräche.',
            'Beste Zeit für alles, was Tiefe verträgt. Also fast alles, was zählt.',
        ],
    ];

    // ================================================================== PAAR

    public const KOMPAT_HOCH = [
        'Ihr seid heute synchroner als eure Kalender-Apps. Und die haben einen gemeinsamen Account.',
        '{A} und {B} verstehen sich heute blind, taub und über Zimmergrenzen hinweg.',
        'Heute seid ihr das Paar, bei dem andere denken: „Wie machen die das?“ Antwort: Übung und Blödsinn.',
        'Kosmisch betrachtet seid ihr heute ein Doppelstern: unterschiedliche Umlaufbahnen, gemeinsames Zentrum.',
        'Eure Frequenzen überlagern sich heute konstruktiv. Physiker nennen das Resonanz, ihr nennt es Dienstag.',
        'Heute gilt: gleiche Wellenlänge, unterschiedliche Lautstärke. Funktioniert.',
        'Die Sterne messen heute Rekordwerte in der Kategorie „grundloses Anlächeln“.',
        'Eure Zeichen ergeben heute mehr als zwei. Mathematisch fragwürdig, emotional bewiesen.',
    ];

    public const KOMPAT_MITTEL = [
        'Solide Werte mit Luft nach oben — ein Kuss vor dem Mittag hebt die Quote messbar.',
        'Heute seid ihr ein gut eingespieltes Team mit gelegentlichem Übersetzungsbedarf. Wörterbuch: Humor.',
        'Die Chemie stimmt, die Physik auch — nur die Logistik (wer räumt was weg) braucht heute Diplomatie.',
        'Ihr lauft heute auf 80 % Synchronität. Die restlichen 20 % sind Persönlichkeit. Bitte behalten.',
        'Kleine Reibung, große Wärme — Physik der Liebe, Kapitel 7.',
        'Heute hilft die goldene Paar-Regel: Erst nachfragen, dann interpretieren. Spart eine Stunde.',
        'Ihr seid heute wie WLAN im Altbau: insgesamt stark, in manchen Ecken kurz mal Suchbewegung.',
        'Gute Grundlage, wechselhafte Details. Wie Aprilwetter, nur mit mehr Küssen.',
    ];

    public const KOMPAT_NIEDRIG = [
        'Kosmische Störung im Anmarsch: Heute lieber zweimal nett fragen und einmal extra umarmen. Notfallplan: Pizza.',
        'Die Sterne stehen heute etwas schräg — nehmt nichts persönlich, was vor dem ersten Kaffee gesagt wird.',
        'Heute sprechen {A} und {B} kurzzeitig verschiedene Dialekte. Übersetzer: Zeit, Tee, Zärtlichkeit.',
        'Reibungstag! Gute Nachricht: Reibung erzeugt Wärme. Schlechte Nachricht: erst später am Abend.',
        'Heute knirscht es im Getriebe. Öl der Wahl: Humor, großzügig auftragen.',
        'Der Kosmos testet heute eure Verbindung. Nicht dran rütteln — einfach neu starten: Spaziergang, Hand halten, fertig.',
    ];

    public const KOMPAT_JACKPOT = [
        'JACKPOT-TAG! Die Sterne haben heute alle Regler auf Maximum gedreht. Sowas gibt es nur ein paar Mal im Jahr — verschwendet es nicht mit Aufräumen.',
        'Kosmischer Ausnahmezustand: Heute seid ihr das Referenzpaar, an dem der Himmel andere misst. Feiert das. Sofort.',
        'Heute passt alles. ALLES. Die Sterne bitten um ein Foto für die Akte.',
    ];

    public const KOMPAT_CHAOS = [
        'Kosmischer Störtag — der Himmel hat heute selbst schlechte Laune und projiziert. Regel Nummer eins: Ihr gegen das Problem, nie gegeneinander. Regel Nummer zwei: Schokolade zählt als Werkzeug.',
        'Achtung, Turbulenzen! Heute bitte anschnallen, Händchen halten und Servicewagen (Snacks) bereithalten. Morgen sieht der Himmel wieder normal aus.',
    ];

    public const STREIT_THEMEN = [
        'die korrekte Beladung der Spülmaschine',
        'die Definition von „gleich mach ich das“',
        'Thermostat-Souveränität',
        'ob das noch Deko oder schon Lager ist',
        'die richtige Reihenfolge beim Kofferpacken',
        'ob man Serien auch ohne den anderen weiterschauen darf (nein)',
        'die Frage, wessen Handy-Speicher voller ist',
        'ob 21 Uhr „noch früh“ oder „quasi Mitternacht“ ist',
        'die optimale Raumtemperatur (Differenz: 3,5 Grad)',
        'ob der Einkaufszettel ein Vorschlag oder ein Vertrag ist',
        'ob Handtücher nach einmal Benutzen in die Wäsche gehören',
        'ob Sportkleidung ein Wohnzimmer-Outfit ist',
        'wer zuletzt den Müll rausgebracht hat (Beweislage: dünn)',
        'ob das Paket wirklich sein musste',
        'die Aussprache eines englischen Wortes',
        'ob man im Urlaub auch mal nichts machen kann',
        'wessen Ladekabel das auf dem Nachttisch ist',
        'ob die Pflanze noch lebt oder schon Kompost ist',
    ];

    public const FENSTER_TEXTE = [
        'Eure Energiekurven überlappen heute hier — beste Zeit für alles zu zweit.',
        'In diesem Fenster seid ihr beide wach, warm und witzig. Nutzt es.',
        'Gemeinsames Hoch: Da gehen Gespräche, Pläne und Blödsinn gleichermaßen.',
        'Der Himmel hat euch dieses Zeitfenster reserviert. Stornieren unmöglich.',
    ];

    public const RECHT_PERSON = [
        '{NAME} — mit 51 zu 49. Knapper geht es kaum, zählen tut es trotzdem.',
        '{NAME}. Es gibt Quellen. Niemand will die Quellen sehen, aber es gibt sie.',
        '{NAME} — der seltene Fall, in dem Dickkopf und Wahrheit deckungsgleich sind.',
        '{NAME}. Die Sterne haben nachgemessen und bitten die Gegenseite um Fassung.',
        '{NAME} — {SIGN_PLURAL} liegen nie falsch, sie liegen höchstens strategisch anders.',
        '{NAME}, einstimmig. Sogar Merkur hat zugestimmt, und der ist rückläufig.',
        '{NAME}. Begründung: hat sich beim letzten Mal geirrt und ist damit statistisch heute dran.',
        '{NAME} — die Argumentation hatte Struktur, Timing und ein Lächeln am Ende. Keine Chance.',
    ];

    public const RECHT_BEIDE = [
        'Beide — ihr habt über zwei verschiedene Dinge geredet. Wieder mal.',
        'Beide. Das Universum stellt erschöpft fest: Ihr hattet denselben Punkt, nur andere Vokabeln.',
        'Beide, zu exakt 50 %. Der Rest war Tonfall.',
        'Beide — einer hatte die Fakten, einer hatte recht. Klassische Arbeitsteilung.',
    ];

    public const RECHT_UNIVERSUM = [
        'Das Universum — es enthält sich, grinst aber auffällig.',
        'Niemand. Die Frage war falsch gestellt, sagt der Kosmos und verweist auf Formfehler.',
        'Das Universum behält heute recht. Einspruchsfrist: abgelaufen.',
    ];

    public const DATE_IDEEN = [
        'Heute Abend: Balkon, Decke, Sternschnuppen zählen. Bei null Funden zählt auch die ISS.',
        'Kocht das Gericht nach, das beim letzten Mal „interessant“ war. Rache oder Rehabilitation.',
        'Filmabend: Einer wählt den Film, der andere darf die Logikfehler finden. Ein Ritual mit Zukunft.',
        'Einfach losfahren, Ziel egal. Ihr seid frei wie zwei Satelliten mit Vollpension.',
        'Abendspaziergang mit einer Regel: Es darf nur über Zukunftspläne geredet werden. Größenwahn erlaubt.',
        'Picknick auf dem Boden im Wohnzimmer. Das Wetter dort ist bekannt zuverlässig.',
        'Jeder zeigt dem anderen ein Video, das diese Woche zum Lachen gebracht hat. Zwei Welten, ein Sofa.',
        'Brettspiel-Duell: Wer verliert, macht Frühstück. Die Sterne rechnen mit Betrugsversuchen auf beiden Seiten.',
        'Zusammen ein neues Viertel erkunden — eure Stadt hat noch Ecken, die euch nicht kennen.',
        'Candle-Light-Abendessen. Kerzen echt oder smart — Romantik zählt in beiden Firmware-Versionen.',
        'Gemeinsames Workout im Wohnzimmer: Einer macht vor, einer macht mit, die Nachbarn machen sich Gedanken.',
        'Fotosafari durch die Wohnung: Jeder fotografiert drei Dinge, die er am anderen liebt. Abendfüllend.',
        'Eis essen gehen, egal welches Wetter. Trotz-Eis schmeckt am besten.',
        'Planetarium oder Balkon-Planetarium (App + Himmel). Bildungsauftrag mit Kuschelfaktor.',
        'Karaoke im Wohnzimmer. Was im Wohnzimmer passiert, bleibt im Wohnzimmer.',
        'Zusammen die Urlaubskasse plündern — erst planen, dann buchen, dann freuen. Heute ist Buchungs-Energie.',
        'Massage-Tauschbörse: 20 Minuten pro Person, Verhandlungsbasis. Nachverhandlungen erwünscht.',
        'Ein Puzzle anfangen und so tun, als würdet ihr es diesmal beenden. Der Weg ist das Ziel.',
        'Rooftop, Spätverkauf oder Küchenfenster: Hauptsache Sonnenuntergang um {SUNSET} Uhr mitnehmen.',
        'Technik-frei bis 21 Uhr. Ausnahmegenehmigung gibt es nur für die Musik-Anlage.',
        'Gemeinsam alte Fotos anschauen und die schlechtesten Frisuren küren. Es gibt klare Favoriten.',
        'Heute wird ein Gericht gekocht, das keiner von euch aussprechen kann. Gelingt es, wird es Tradition.',
    ];

    public const GESPRAECH = [
        'Wenn unser Paar-Leben eine Serie wäre — welche Folge war der Pilotfilm?',
        'Welches Gerät im Haushalt hat die beste Persönlichkeit?',
        'Was war der beste Kuss — Ort, Zeit, Begründung? Beweise dürfen nachgestellt werden.',
        'Worin ist der andere heimlich Weltklasse, weiß es aber nicht?',
        'Welche drei Dinge nehmen wir mit auf eine einsame Insel (WLAN zählt als ein Ding)?',
        'Was würde die 20-jährige Version von dir zu uns sagen?',
        'Welcher Song beschreibt unsere Beziehung diese Woche?',
        'Wenn wir morgen irgendwo aufwachen könnten — wo, und was frühstücken wir da?',
        'Welche Angewohnheit des anderen würdest du niemals ändern wollen, obwohl sie verrückt ist?',
        'Was war unser bestes spontanes Erlebnis — und war es wirklich spontan oder heimlich geplant?',
        'Wenn Geld und Zeit egal wären: Welches gemeinsame Projekt starten wir Montag?',
        'Welches Kompliment hast du nie vergessen?',
        'Was können wir zwei besser als jedes andere Paar, das wir kennen? (Bescheidenheit ist heute verboten.)',
        'Welcher Ort auf der Welt hat unseren Namen noch nicht gehört, sollte ihn aber kennenlernen?',
        'Was war der Moment, in dem du dachtest: Ja, genau die Person?',
        'Welche Superkraft hätte der andere, wenn Superkräfte nach Charakter vergeben würden?',
        'Was sollten wir öfter machen, obwohl es nichts kostet?',
        'Welches Ritual von uns würdest du patentieren lassen?',
        'Wenn unsere Beziehung ein Restaurant wäre: Was steht auf der Karte, und was ist das Gericht des Hauses?',
        'Welche Frage wolltest du mir immer schon stellen, hast es aber nie getan? Jetzt ist der Moment.',
    ];

    public const MISSIONEN = [
        'Paar-Mission: Heute dreimal grundlos High-Five. Stil zählt doppelt.',
        'Mission: Ein Foto von euch, auf dem beide echt lachen. Erlaubtes Hilfsmittel: Blödsinn.',
        'Mission: Jeder erzählt dem anderen einen Fakt, den er garantiert noch nicht kannte. Nerd-Level unbegrenzt.',
        'Mission: Einmal heute den Satz „Gute Idee, machen wir!“ sagen — und es ernst meinen.',
        'Mission: Dem anderen heimlich eine Kleinigkeit hinlegen. Zettel zählt, Snack zählt doppelt.',
        'Mission: Heute einmal gleichzeitig losreden, lachen, und der andere darf zuerst.',
        'Mission: 5 Minuten Rücken kraulen, ohne Gegenleistung. Karma regelt den Rest noch heute.',
        'Mission: Beim Abendessen erzählt jeder das Highlight des Tages — Handy bleibt im Orbit.',
        'Mission: Einmal heute übertrieben förmlich miteinander sprechen. „Werte Herzensperson, der Kaffee ist serviert.“',
        'Mission: Ein gemeinsames Selfie an einem Ort, wo noch keins entstanden ist. Badezimmerspiegel ist ausgeschöpft.',
        'Mission: Heute tauscht ihr eine Aufgabe — jeder übernimmt die des anderen. Erkenntnisgewinn garantiert.',
        'Mission: Jeder sagt dem anderen ein Kompliment, das nichts mit Aussehen zu tun hat.',
        'Mission: Zusammen 10 Minuten aus dem Fenster schauen und Passanten Geschichten andichten.',
        'Mission: Den ältesten Insider-Witz von euch reaktivieren. Er funktioniert noch. Er funktioniert immer.',
        'Mission: Heute einmal „Danke, dass du das immer machst“ sagen — für eine Sache, die sonst unsichtbar ist.',
        'Mission: Plant 15 Minuten den nächsten Urlaub, als würdet ihr morgen fliegen.',
        'Mission: Jeder wählt einen Song, laut aufdrehen, 3 Minuten Küchen-Disco. Bewertung verboten.',
        'Mission: Einmal heute den anderen ausreden lassen und dann erst widersprechen. Fortgeschrittenen-Level.',
    ];

    // ------------------------------------------------------ Elementar-Funk (Paar)

    /**
     * Element-Chemie der beiden Zeichen. Schlüssel: sortierte Element-Kombi
     * (Zodiac::comboKey), z. B. "feuer+wasser". Deckt alle 144 Paarungen ab.
     */
    public const ELEMENT_COMBO = [
        'feuer+feuer' => [
            'Zwei Feuerzeichen, ein Haushalt: Der Kosmos hat vorsorglich die Sprinkleranlage geprüft. Entwarnung — ihr brennt füreinander, nicht gegeneinander.',
            'Doppel-Feuer heute: Wer zuerst „Los jetzt!“ ruft, gewinnt. Ihr ruft gleichzeitig.',
            'Funkenflug im Duett: Heute wird aus einer Mini-Idee ein Großprojekt. Deadline: Sonntag.',
        ],
        'erde+erde' => [
            'Zwei Erdzeichen: Stabilität hoch zwei. Das Sofa meldet Tragkraft-Reserven, eure Pläne haben Fundament.',
            'Doppel-Erde: Ihr seid heute so verlässlich, dass sich Kalender bei euch Termine ausleihen.',
            'Erde trifft Erde: Genuss-Koalition. Heute wird nichts überstürzt — außer vielleicht der Nachtisch.',
        ],
        'luft+luft' => [
            'Zwei Luftzeichen: Die Gesprächsstoff-Börse hat durchgehend geöffnet. Beim Einschlafen fällt euch noch ein Thema ein. Mindestens eins.',
            'Doppel-Luft: Ihr wechselt heute dreimal das Thema und bleibt trotzdem beim selben Gefühl.',
            'Luft im Quadrat: Viele Pläne schweben heute. Einer landet — und wird richtig gut.',
        ],
        'wasser+wasser' => [
            'Zwei Wasserzeichen, eine Welle: Synchronschwimmen ohne Publikum, Gefühlstiefe serienmäßig.',
            'Doppel-Wasser heute: Ihr spürt, was los ist, bevor es losgeht. Praktisch. Gelegentlich unheimlich.',
            'Wasser trifft Wasser: Heute reicht ein Blick als komplettes Gespräch — inklusive Fazit.',
        ],
        'erde+feuer' => [
            'Feuer trifft Erde: Tempo trifft Fundament. Einer zündet, einer baut den Kamin drumherum — Arbeitsteilung der Meisterklasse.',
            'Erde und Feuer heute: Der Plan bekommt Schwung, der Schwung bekommt einen Plan. Es gewinnt: ihr.',
            'Feuer auf Erde: Heute wird ein spontaner Einfall solide umgesetzt. Selten. Wertvoll. Feiern.',
        ],
        'erde+luft' => [
            'Luft trifft Erde: Ideen treffen Machbarkeit. Heute wird aus „man müsste mal“ ein „haben wir gemacht“.',
            'Erde und Luft: Einer denkt in Konzepten, einer in Regalmetern. Zusammen: Möbel mit Vision.',
            'Brise über festem Boden: Heute weht frischer Wind, aber nichts fliegt weg. Ideal.',
        ],
        'erde+wasser' => [
            'Wasser trifft Erde: Gefühl bekommt Fundament, Fundament bekommt Gefühl. Der Kosmos nennt es Bausparen mit Herz.',
            'Erde und Wasser: Heute wächst etwas. Gießen nicht vergessen — Komplimente zählen als Wasser.',
            'Tiefe trifft Halt: Einer fühlt vor, einer hält fest. Beste Besetzung bei jeder Wetterlage.',
        ],
        'feuer+luft' => [
            'Feuer trifft Luft: Sauerstoff für jede Idee. Heute reicht ein Funke — Projekt, Reise oder Küchen-Disco.',
            'Luft und Feuer: Ihr schaukelt euch heute gegenseitig hoch. In die gute Richtung. Meistens.',
            'Feuer und Luft: Zündeln erlaubt, gemeinsam glänzen Pflicht. Der Abend wird hell.',
        ],
        'feuer+wasser' => [
            'Feuer trifft Wasser: Dampf! Heute entsteht Energie aus Gegensätzen — die Sauna wusste es zuerst.',
            'Wasser und Feuer: Einer kocht (vor Begeisterung), einer kühlt (mit Charme). Das Menü: perfekt ausgewogen.',
            'Feuer und Wasser: Offiziell unvereinbar, inoffiziell euer Erfolgsrezept. Der Kosmos macht sich Notizen.',
        ],
        'luft+wasser' => [
            'Luft trifft Wasser: Wellen mit Rückenwind. Gespräche gehen heute tief und bleiben trotzdem leicht.',
            'Wasser und Luft: Einer fühlt, einer formuliert. Zusammen schreibt ihr heute den besseren Tag.',
            'Brise über dem Meer: perfekte Segelbedingungen für Pläne, Gefühle und ein langes Frühstück.',
        ],
    ];

    /** Vorrang-Texte, wenn beide dasselbe Zeichen haben. */
    public const SAME_SIGN = [
        'Doppelte {SIGN_PLURAL}-Energie: Der Kosmos hat euch als Original und Kopie angelegt und verrät nicht, wer wer ist.',
        'Zwei {SIGN_PLURAL} unter einem Dach — Selbsterkenntnis im Spiegelformat, täglich, kostenlos.',
        'Gleiches Zeichen, gleiche Tricks: Ihr durchschaut euch heute gegenseitig komplett. Nutzt es für Gutes.',
    ];

    // ----------------------------------------------------------------- Flaggen

    public const RED_FLAGS = [
        'Red Flag des Tages: {WER} sagt „gleich“ und meint ein Zeitfenster von 40 bis 90 Minuten.',
        'Red Flag des Tages: {WER} sagt „nur kurz“. Die Sterne haben aufgehört zu stoppen.',
        'Red Flag des Tages: {WER} hat schon wieder etwas im Flur drapiert. Die Sterne nennen keine Namen. Na gut: {WER}.',
        'Red Flag des Tages: „Ich hab da was bestellt“ — ohne weitere Angaben. Paketgröße: beunruhigend.',
        'Red Flag des Tages: {WER} plant den freien Sonntag in 30-Minuten-Slots. Inklusive „spontane Erholung, 14:00–14:30“.',
        'Red Flag des Tages: {WER} sagt „Wir müssen heute nichts Großes machen“ und hat heimlich doch einen Plan.',
        'Red Flag des Tages: {WER} erklärt ein Haushaltsgerät. Es dauert 25 Minuten. Das Gerät war nie kaputt.',
        'Red Flag des Tages: „Nur noch eine Folge.“ Von euch beiden. Gleichzeitig. Um 23:40 Uhr.',
        'Red Flag des Tages: {WER} sagt „Wir sollten mal ausmisten“ und zeigt dabei ausschließlich auf Sachen von {ANDERE}.',
        'Red Flag des Tages: Das Wort „eigentlich“ taucht heute in Sätzen über Pläne auf. Höchste Alarmstufe.',
        'Red Flag des Tages: {WER} antwortet auf „Wie war dein Tag?“ mit einer Agenda. Mit Unterpunkten.',
        'Red Flag des Tages: {WER} beginnt einen Satz mit „Nicht böse gemeint, aber“. Die Sterne ducken sich schon mal.',
        'Red Flag des Tages: {WER} öffnet den 43. Browser-Tab und nennt es „aufgeräumt“.',
        'Red Flag des Tages: Einer von euch summt seit Stunden dasselbe Lied. Der Kosmos weiß, wer.',
    ];

    public const GREEN_FLAGS = [
        'Green Flag des Tages: Ihr lacht über denselben Blödsinn. Seit ihr euch kennt. Immer noch.',
        'Green Flag des Tages: {WER} hat die Wasserflasche von {ANDERE} aufgefüllt, ohne dass jemand fragen musste.',
        'Green Flag des Tages: {WER} hört sich das Lieblingsthema von {ANDERE} an. Freiwillig. Mit echten Rückfragen.',
        'Green Flag des Tages: Einer bringt dem anderen unaufgefordert Kaffee. Der Kosmos applaudiert leise.',
        'Green Flag des Tages: Ihr habt einen Blick, der ganze Gespräche ersetzt. Heute im Dauereinsatz.',
        'Green Flag des Tages: {WER} kommt mit zum Spaziergang, obwohl gerade angeblich etwas ganz Wichtiges lief.',
        'Green Flag des Tages: Ihr streitet über Kleinigkeiten, aber nie über Wichtiges. Prioritäten: korrekt.',
        'Green Flag des Tages: Jemand hat das Ladekabel des anderen schon eingesteckt. Zivilisation auf höchstem Stand.',
        'Green Flag des Tages: Ihr plant Zukunft, als wäre sie ausverkauft. Richtige Einstellung.',
        'Green Flag des Tages: Beide sagen „Nein, DU bist dran mit Musik aussuchen“. Höflichkeits-Patt, Stufe Gold.',
        'Green Flag des Tages: {WER} erklärt es nochmal langsamer, ohne die Augen zu rollen. {ANDERE} fragt nochmal nach, ohne zu seufzen. Weltklasse.',
        'Green Flag des Tages: Ihr habt heute beide an dasselbe gedacht und gleichzeitig gegrinst. Telepathie-Lizenz verlängert.',
        'Green Flag des Tages: Einer von euch hat heute „Schatz, schau mal, die Sterne“ gesagt und meinte diese App. Rührend.',
        'Green Flag des Tages: {WER} hat {ANDERE} den letzten Bissen überlassen. Das ist keine Geste, das ist Weltfrieden.',
    ];

    public const PROPHEZEIUNGEN = [
        'Diese Woche findet ihr etwas wieder, das ihr nicht gesucht habt: gemeinsame Zeit. Und den Zweitschlüssel.',
        'Heute Abend wird gelacht, bis einer schnauft. Die Sterne tippen auf {WER} — der Auslöser sitzt daneben.',
        'In den nächsten Tagen sagt einer von euch einen Satz, der zum Insider wird. Achtet auf den Moment.',
        'Bald steht ein spontaner Plan an, der besser wird als jeder geplante. Sagt nachher nicht, ihr wärt nicht gewarnt worden.',
        'Ein kleines Missgeschick in der Küche wird diese Woche zur Lieblingsanekdote. Niemand kommt zu Schaden, außer einem Ei.',
        'Ihr werdet demnächst gleichzeitig dasselbe vorschlagen. Der Moment gehört in die Chronik.',
        'Ein Abend diese Woche wird länger als geplant — aus den richtigen Gründen.',
        'Jemand von euch bekommt bald unerwartet gute Nachrichten. Der andere freut sich lauter.',
        'Ein Gegenstand, über den ihr diskutiert habt, erweist sich als Volltreffer. Der Skeptiker schweigt großzügig.',
        'Diese Woche gewinnt ihr gegen den Alltag mit 3:1. Das eine Gegentor war die Steuererklärung. Oder die Wäsche.',
        'Bald sagt ein Fremder etwas Nettes über euch als Paar. Merkt euch das Gesicht — es hat recht.',
        'Der nächste Sonntag wird einer von der Sorte, die man fotografieren müsste, aber zum Glück einfach lebt.',
        'Einer von euch entdeckt diese Woche einen neuen Lieblingsort. Der andere wird mitgeschleppt und dankt später.',
        'Ihr werdet bald über einen alten Plan stolpern und feststellen: Jetzt ist der richtige Zeitpunkt.',
        'In naher Zukunft klatscht ihr ein: Ein Vorhaben, das lange liegen blieb, wird einfach erledigt. In 20 Minuten.',
        'Demnächst gibt es einen Abend ohne Bildschirme, aus Versehen. Er landet in den Top 5 des Monats.',
    ];

    // -------------------------------------------------------------- Battle-Duell

    /** @var array<int, array{key:string, label:string}> */
    public const BATTLE_KATEGORIEN = [
        ['key' => 'sturheit', 'label' => 'Sturheit'],
        ['key' => 'charme',   'label' => 'Charme'],
        ['key' => 'chaos',    'label' => 'Chaos-Toleranz'],
        ['key' => 'detail',   'label' => 'Detailverliebtheit'],
        ['key' => 'spontan',  'label' => 'Spontanität'],
    ];

    public const BATTLE_WIN = [
        'Heute uneinholbar: {LABEL} ist die Königsdisziplin von {NAME}. Die Gegenseite gratuliert sportlich fair.',
        'Punkt für {NAME} — bei {LABEL} macht heute niemand etwas vor.',
        '{NAME} führt bei {LABEL}. Der Pokal steht symbolisch schon im Regal.',
        'Klarer Sieg für {NAME} — {LABEL} ist heute fest in {SIGN}-Hand.',
    ];

    public const BATTLE_UNENTSCHIEDEN = [
        'Bei {LABEL} herrscht heute Gleichstand. Das Universum verlangt ein Stechen: Schere, Stein, Papier.',
        '{LABEL}: totes Rennen. Ihr seid euch ähnlicher, als ihr zugebt.',
    ];

    // ------------------------------------------------------------- Sterne-Extras

    public const STAR_LABELS = [
        2 => 'Aufwärmrunde',
        3 => 'Solide Sternenlage',
        4 => 'Sehr gute Aussichten',
        5 => 'Galaktisch!',
    ];
}
