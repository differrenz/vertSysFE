"use strict";

import Router from "./router.js";

// import PageList from "./page-list/page-list.js";
// import PageNew from "./page-new/page-new.js";

/**
 * Hauptklasse App: Steuert die gesamte Anwendung bzw. dieser Klasse gehört der Bildschirm.
 * Hierzu bedient sie sich einem Single Page Router, um zu erkennen, welche Ansicht der
 * Anwender sehen will. Sowie für jede Ansicht einer Klasse, die den Inhalt dieser Ansicht
 * liefert.
 */
class App {
    /**
     * Konstruktor.
     */
    constructor() {
        // Datenbank-Klasse zur Verwaltung der Datensätze
        // Single Page Router zur Steuerung der sichtbaren Inhalte
        this.router = new Router([
            {
                url: "^/$",
                show: () => this._gotoList()
            }, {
                url: "^/new/$",
                show: () => this._gotoNew()
            }, {
                url: "^/login/(.*)$",
                show: matches => this._goToLogin(matches[1])
            }, {
                url: "^/edit/(.*)$",
                show: matches => this._gotoEdit(matches[1])
            }, {
                url: ".*",
                show: () => this._gotoList()
            }
        ]);

        // Fenstertitel merken, um später den Name der aktuellen Seite anzuhängen
        this._documentTitle = document.title;

        // Von dieser Klasse benötigte HTML-Elemente
        this._pageCssElement = document.querySelector("#page-css");
        this._bodyElement = document.querySelector("body");
        this._menuElement = document.querySelector("#app-menu");
    }

    /**
     * Initialisierung der Anwendung beim Start. Im Gegensatz zum Konstruktor
     * der Klasse kann diese Methode mit der vereinfachten async/await-Syntax
     * auf die Fertigstellung von Hintergrundaktivitäten warten, ohne dabei
     * mit den zugrunde liegenden Promise-Objekten direkt hantieren zu müssen.
     */
    async init() {
        // TODO: SPA-Router starten
        this.router.start();
    }

    /**
     * Übersichtsseite anzeigen. Wird vom Single Page Router aufgerufen.
     */
    async _gotoList() {
        try {
            if (globalAccountId == null) {
                confirm("Sie müssen sich erst einloggen, um die Personenübersicht zu sehen.")
                location.hash = `#/login/`
            } else {
                let {default: PageList} = await import("./page-list/page-list.js");

                let page = new PageList(this);
                await page.init();
                this._showPage(page, "list");
            }
        } catch (ex) {
            this.showException(ex);
        }
    }

    /**
     * Seite zum Anlegen einer neuen Adresse anzeigen.  Wird vom Single Page
     * Router aufgerufen.
     */
    async _gotoNew() {
        try {
            let {default: PageNew} = await import("./page-new/page-new.js");

            let page = new PageNew(this);
            await page.init();
            this._showPage(page, "new");
        } catch (ex) {
            this.showException(ex);
        }
    }

    async _goToLogin() {
        try {
            let {default: PageEdit} = await import("./page-login/page-login.js");

            let page = new PageEdit(this);
            await page.init();
            this._showPage(page, "login");
        } catch (ex) {
            this.showException(ex);
        }
    }

    /**
     * Seite zum Bearbeiten einer Adresse anzeigen.  Wird vom Single Page
     * Router aufgerufen.
     *
     * @param profileId
     */
    async _gotoEdit(profileId) {

        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageUpdate} = await import("./page-update/page-update.js");

            let page = new PageUpdate(this, profileId);
            await page.init();
            this._showPage(page, "edit");
        } catch (ex) {
            this.showException(ex);
        }
    }

    /**
     * Interne Methode zum Umschalten der sichtbaren Seite.
     *
     * @param  {Page} page Objekt der anzuzeigenden Seiten
     * @param  {String} name Name zur Hervorhebung der Seite im Menü
     */
    _showPage(page, name) {
        // Fenstertitel aktualisieren
        document.title = `${this._documentTitle} – ${page.title}`;

        // Stylesheet der Seite einfügen
        this._pageCssElement.innerHTML = page.css;

        // Aktuelle Seite im Kopfbereich hervorheben
        this._menuElement.querySelectorAll("li").forEach(li => li.classList.remove("active"));
        this._menuElement.querySelectorAll(`li[data-page-name="${name}"]`).forEach(li => li.classList.add("active"));

        // Sichtbaren Hauptinhalt austauschen

        // TODO: Das bisherige <main>-Element aus this._bodyElement entfernen.
        this._bodyElement.querySelector("main")?.remove();

        // TODO: Das neue Element page.mainElement an this._bodyElement anhängen.
        this._bodyElement.appendChild(page.mainElement);

    }

    /**
     * Hilfsmethode zur Anzeige eines Ausnahmefehlers. Der Fehler wird in der
     * Konsole protokolliert und als Popupmeldung angezeigt.
     *
     * @param {Object} ex Abgefangene Ausnahme
     */
    showException(ex) {
        console.error(ex);
        alert(ex.toString());
    }
}

/**
 * Anwendung starten
 */
window.addEventListener("load", async () => {
    let app = new App();
    await app.init();
});
