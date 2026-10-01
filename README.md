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

## Hausnummernzusatz (zus)

Die optionale Excel-Spalte `zus` (auch `Zus.`) wird als Bestandteil der Hausnummer eingelesen. In Objektliste und Detailansicht erscheint beispielsweise Nr. `12` mit zus `a` als `12a`. Die Suche findet sowohl `12a` als auch `12 a`. Leere oder fehlende Zusatzspalten bleiben möglich. Die Originalwerte in `Nr.` und `zus` bleiben beim Speichern erhalten.

Für das Update `index.html` und `service-worker.js` auf dem bestehenden Webserver ersetzen, die App neu öffnen und die Excel-Datei erneut laden. Die vorhandenen Icons und Microsoft-Einstellungen weiterverwenden.
