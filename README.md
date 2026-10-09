# Objektermittlungs-App

Browser-App für iPad- und Android-Tablets. Die Nutzer öffnen einen Web-Link, melden sich mit ihrem Microsoft-Konto an, suchen ihre freigegebene Excel-Potenzialliste und arbeiten direkt in dieser Datei weiter. Der Dateiname und der OneDrive-Pfad dürfen je Nutzer unterschiedlich sein.

## Was die Nutzer auf dem Tablet tun

1. Den bereitgestellten HTTPS-Link in Safari (iPad) oder Chrome (Android) öffnen.
2. Einmalig am Startbildschirm ablegen: auf dem iPad in Safari **Teilen → Zum Home-Bildschirm** wählen; in Chrome **Menü → App installieren** oder **Zum Startbildschirm hinzufügen**.
3. **Excel-Datei aus OneDrive laden** antippen, sich bei Bedarf mit dem Microsoft-Konto anmelden und den OneDrive-Freigabe-Link einfügen. Führt er zu einem Ordner, wird darin die Excel-Datei ausgewählt; führt er direkt zu einer Excel-Datei, wird diese geöffnet.
5. Objekte bearbeiten. Änderungen werden automatisch in derselben OneDrive-Datei gespeichert.

Der gemeinsame Ordner oder die Datei muss den Nutzern Bearbeitungsrechte geben. OneDrive und Anmeldung benötigen eine Internetverbindung.

## Einmalige Bereitstellung

Diese Dateien müssen gemeinsam auf einem Webserver mit HTTPS liegen. Die App kann nicht per Doppelklick auf `index.html` gestartet werden: Browser erlauben Anmeldung und Service Worker nur über eine sichere Webadresse. Die Dateien können auf einem vorhandenen Firmen-Webserver oder einem statischen Webhosting bereitgestellt werden.

Für den Microsoft-Zugriff muss ein Administrator oder App-Betreiber einmalig:

1. Eine Microsoft-Entra-App-Registrierung für die verwendeten Kontotypen erstellen.
2. Als Plattform **Single-page application (SPA)** wählen und die genaue Webadresse der bereitgestellten App als Redirect-URI eintragen. Die App-Adresse sollte auf der obersten Ebene der Website liegen, zum Beispiel `https://firma.example/`.
3. Delegierte Microsoft-Graph-Berechtigungen `User.Read` und `Files.ReadWrite` hinzufügen.
4. Die **Application (client) ID** in `config.js` eintragen.
5. Den Nutzern im OneDrive-Ordner mindestens Bearbeitungsrechte geben.

In `config.js` steht nur eine Client-ID, kein Kennwort und kein Client-Secret. Die Client-ID wird beim Veröffentlichen der App absichtlich an den Browser ausgeliefert.

## Projektdateien

- `index.html` – Oberfläche, Excel-Import, Bearbeitung und OneDrive-Speicherung
- `config.js` – öffentliche Microsoft-Client-ID
- `manifest.json`, `service-worker.js`, `icons/` – Installation am Startbildschirm und App-Symbol

Beim Excel-Import wird das passende Datenblatt anhand seiner Spaltenüberschriften erkannt. Eingelesen wird bis zur ersten vollständig leeren Tabellenzeile; weitere Inhalte darunter werden ignoriert. Andere Datenblätter bleiben beim Speichern erhalten.

## Microsoft-Einrichtung

Die Microsoft-App-Registrierung wird pro bereitgestellter Web-App einmal vorgenommen, nicht von jedem Nutzer. Details und die aktuelle Anleitung stehen in der [Microsoft-Dokumentation für Single-Page-Apps](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-app-configuration).


## Lokale Kopie und Offline-Arbeit

Nach dem Laden aus OneDrive speichert die App eine lokale Kopie der Excel-Datei und sichert Bearbeitungen laufend im Browser auf diesem Gerät. Beim Start bleibt die Oberfläche ohne geöffnete Liste. Noch nicht synchronisierte Änderungen werden aus der lokalen Sicherung im Hintergrund nach OneDrive übertragen. Die gewünschte Liste wählt der Nutzer selbst aus. Über „Lokale Liste öffnen“ lässt sie sich nach dem Schließen erneut öffnen.

Die Anzeige über der Liste informiert über lokale Sicherung, Offline-Zustand und ausstehende Synchronisierung. Bei Internetverbindung werden Änderungen automatisch synchronisiert, auch nach Rückkehr der Verbindung und beim nächsten Start. Falls Microsoft eine erneute Anmeldung verlangt, über „Microsoft Login“ anmelden; die lokale Sicherung bleibt erhalten.

„Liste schließen“ versucht zuerst zu synchronisieren. Bei Offline-Betrieb oder einem Speicherfehler bleibt die Liste geöffnet und ein Infofenster erklärt den nächsten Schritt. Das vollständige Schließen von Safari oder das Beenden der App durch iPadOS kann keinen zuverlässigen Upload oder Dialog garantieren. Deshalb werden Änderungen bereits während der Eingabe lokal gesichert und beim nächsten Start erneut zur Synchronisierung bereitgestellt.

Vor jedem Abgleich lädt die App die aktuelle OneDrive-Datei und überträgt ausschließlich die lokal bearbeiteten Objekte anhand ihrer ADS-ID. Bei diesen Objekten haben die lokal gespeicherten Eingabefelder Vorrang; andere Objekte und andere Tabellenblätter bleiben erhalten. Bei einer erneuten Versionsänderung während des Abgleichs wird die aktuelle Datei erneut geladen (bis zu drei Versuche). Fehlende ADS-IDs sowie geänderte Datenblattstrukturen stoppen den Abgleich; die lokalen Änderungen bleiben gesichert.

Die lokale Sicherung gehört zu diesem Browser und dieser Webadresse. Beim Löschen der Website-Daten kann sie verloren gehen. Nach dem ersten Laden muss die App einmal online über ihre HTTPS-Adresse geöffnet worden sein, damit die Offline-Dateien bereitstehen. Pro Browser wird die zuletzt geladene Liste lokal bereitgehalten.

Beim Abgleich werden Download-Link und Dateiversion bei Bedarf getrennt abgefragt. Freigabeverweise werden auf die tatsächliche Datei aufgelöst. Wenn OneDrive eTag, cTag oder einen ETag-Header liefert, wird diese Version beim Upload geprüft. Liefert OneDrive keine Versionskennung, erfolgt der Upload auf Basis der gerade heruntergeladenen Datei ohne diese zusätzliche Versionsbedingung; zeitgleiche Änderungen während dieses kurzen Abgleichs können dann nicht zuverlässig erkannt werden.

Mehrfach vorhandene ADS-IDs werden gemeinsam synchronisiert: Der zuletzt lokal bearbeitete Stand einer ADS-ID wird in alle passenden Zeilen der OneDrive-Datei geschrieben und nach erfolgreicher Speicherung auch in den lokalen Einträgen übernommen.

Die Synchronisierung ordnet die lokale Liste anhand ihres beim Laden gespeicherten Dateinamens im ursprünglichen OneDrive-Ordner zu. Vor jedem Upload wird die dort aktuell vorhandene Datei dieses Namens ermittelt; eine neu hochgeladene Datei gleichen Namens wird dadurch ebenfalls berücksichtigt. Gleichnamige Dateien in anderen Ordnern werden nicht verwendet. Fehlt die Datei oder wurde sie umbenannt, bleiben die Änderungen lokal gesichert. Ältere lokale Sicherungen werden über ihren gespeicherten Ordnerpfad weiter zugeordnet; fehlt auch dieser, wird der Ordner einmal über die bisherige Datei ermittelt. Ist diese bereits gelöscht, muss die Liste erneut ausgewählt werden.

Beim Wechsel zu einer anderen Potenzialliste bleiben ausstehende Änderungen früherer Listen in einer getrennten lokalen Warteschlange erhalten. Der Hintergrundabgleich verändert die aktuell angezeigte Liste nicht. Über „Lokale Liste öffnen“ kann die zuletzt zwischengespeicherte Liste ausdrücklich geöffnet werden.

Änderungen werden weiterhin sofort lokal gesichert. Die automatische OneDrive-Speicherung bündelt Änderungen während der Nutzung in einem stündlichen Rhythmus, gerechnet ab der ersten noch nicht synchronisierten Änderung; weitere Eingaben verschieben diesen Zeitpunkt nicht. „Eintrag speichern“ übernimmt die Notiz sofort in die eigenen Notizen und sichert lokal. „Liste schließen“, die Rückkehr der Internetverbindung sowie der nächste App-Start synchronisieren ausstehende Änderungen sofort. Ein einfacher Wechsel in einen anderen Browser-Tab löst keinen zusätzlichen Upload aus. Bei pausierter oder geschlossener App kann der Browser keine pünktliche stündliche Ausführung garantieren.
