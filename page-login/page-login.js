"use strict";

import Page from "../page.js";

/**
 * Klasse PageNew: Stellt die Seite zum Anlegen oder Bearbeiten einer Adresse zur Verfügung.
 */
export default class PageLogin extends Page {
    /**
     * Konstruktor.
     *
     * @param {App} app Instanz der App-Klasse
     * @param {Integer} editId ID des bearbeiteten Datensatzes
     */
    constructor(app, editId) {
        super(app, "page-login/page-login.html");

        this._userName = null;
        this._password = null;

        this._response = null;

        this._newAccount = {
            id: 0,
            userName: null,
            password: null
        }
    }

    async init() {
        await super.init();

        let saveButton = this._mainElement.querySelector(".action.save");
        saveButton.addEventListener("click", () => this.validateLogin());

        let newAccountButton = this._mainElement.querySelector(".action.new");
        newAccountButton.addEventListener("click", () => this.createNewAccount());

        let logoutButton = this._mainElement.querySelector(".action.logout");
        logoutButton.addEventListener("click", () => this.logout());
    }

    async validateLogin() {

        if (globalAccountId !== 0 && globalAccountId !== null){
            confirm("Sie sind bereits eingeloggt. Loggen sie sich vorher aus, bevor sie sich bei einem neuen Account einloggen.")
            return;
        }

        this._userName = this._mainElement.querySelector("input.userName").value;
        this._password = this._mainElement.querySelector("input.password").value;

        this._newAccount.userName = this._userName
        this._newAccount.password = this._password

        if (this._newAccount.userName == null || this._newAccount.password == null) {
            let answer = confirm("Mindestens ein Eingabefeld ist noch leer.");
            if (!answer) return;
        }

        try {
            let response = await fetch(
                "http://localhost:8081/account/accountValidation", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(this._newAccount)
                });

            if (response.status === 200) {
                this._response = await response.json();
                await this.setGlobalId()
                location.hash = "#/";
            } else {
                let answer = confirm("Login fehlgeschlagen. Entweder falscher Input oder Account existiert nicht. Falls du noch keinen Account hast, erstelle dir einen neuen.");
                if (!answer) return;

                let html = this._mainElement.innerHTML;
                html = html.replace("$userName$", "");
                html = html.replace("$password$", "");
                this._mainElement.innerHTML = html;
            }

        } catch (ex) {
            console.log(ex);
        }
    }

    async createNewAccount() {
        this._userName = this._mainElement.querySelector("input.userName").value;
        this._password = this._mainElement.querySelector("input.password").value;

        this._newAccount.userName = this._userName
        this._newAccount.password = this._password

        if (this._newAccount.userName == null || this._newAccount.password == null) {
            confirm("Mindestens ein Eingabefeld ist noch leer.");
            return;
        }
        try {
            let response = await fetch(
                `http://localhost:8081/account/`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(this._newAccount)
                });


            if (response.status === 200) {
                this._response = await response.json();
                await this.setGlobalId()
                location.hash = `#/new/`
                confirm(`Sie sind nun eingeloggt als ${this._newAccount.userName}`);
            } else if (response.status === 500) {
                let answer = confirm("Account existiert bereits.");
                if (!answer) return;
            } else {
                let answer = confirm("Login fehlgeschlagen.");
                if (!answer) return;

                let html = this._mainElement.innerHTML;
                html = html.replace("$userName$", "");
                html = html.replace("$password$", "");
                this._mainElement.innerHTML = html;
            }
        } catch (ex) {
            console.log(ex);
        }
    }

    async setGlobalId() {
        globalAccountId = await this._response
    }

    logout() {
        globalAccountId = null
        confirm("Sie sind nun ausgeloggt.");
    }
};
