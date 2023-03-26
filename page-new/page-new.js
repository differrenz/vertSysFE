"use strict";

import Page from "../page.js";

export default class PageNew extends Page {
    constructor(app) {
        super(app, "page-new/page-new.html");


        this._lastName = null;
        this._firstName = null;
        this._email = null;

        this._newProfile = {
            accountId: globalAccountId,
            email: null,
            firstName: null,
            id: 0,
            lastName: null
        }
    }

    async init() {
        await super.init();

        let saveButton = this._mainElement.querySelector(".action.save");
        saveButton.addEventListener("click", () => this._saveAndExit());
    }

    async _saveAndExit() {
        this._newProfile.lastName = this._mainElement.querySelector("input.newLastName").value;
        this._newProfile.firstName = this._mainElement.querySelector("input.newFirstName").value;
        this._newProfile.email = this._mainElement.querySelector("input.newEmail").value;

        if (this._newProfile.email == null || this._newProfile.firstName == null || this._newProfile.lastName == null) {
            let answer = confirm("Ein Eingabefeld ist noch leer. Fülle es und speichere dein Profil.");
            if (!answer) return;
        }

        await this.uploadNewProfile()
        location.hash = "#/";
    }

    async uploadNewProfile() {

        await fetch(
            `http://localhost:8081/profile/`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(this._newProfile)
            });
    }
}
