"use strict";

import Page from "../page.js";

export default class PageUpdate extends Page {
    constructor(app, profileId) {
        super(app, "page-update/page-update.html");
        this._newProfile = {
            firstName: null,
            lastName: null,
            email: null,
            id: 0,
            accountId: 0
        }
        this._newAccount = {
            id: 0,
            userName: null,
            password: null}
        // Bearbeiteter Datensatz
        this._profileId = profileId;

    }

    async init() {
        await super.init();

        let profile = await this.loadSingleProfile(this._profileId);
        this._accountId = profile.accountId;

        let account = await this.loadSingleAccount(this._accountId);

        // Platzhalter im HTML-Code ersetzen
        let html = this._mainElement.innerHTML;
        html = html.replace("$firstName$", profile.firstName);
        html = html.replace("$lastName$", profile.lastName);
        html = html.replace("$email$", profile.email);
        html = html.replace("$userName$", account.userName);
        html = html.replace("$password$", account.password);
        this._mainElement.innerHTML = html;


        let saveButton = this._mainElement.querySelector(".action.save");
        saveButton.addEventListener("click", () =>{
            let tempImg = this._mainElement.querySelector(".image").files[0]

            const formData = new FormData();
            formData.append('image', tempImg || 'abc');
            this._formData = formData

            this._saveAndExit()
        });
    }

    async _saveAndExit() {
        this._newAccount.userName = this._mainElement.querySelector("input.userName").value;
        this._newAccount.password = this._mainElement.querySelector("input.password").value;
        this._newAccount.id = this._accountId

        this._newProfile.lastName = this._mainElement.querySelector("input.lastName").value;
        this._newProfile.firstName = this._mainElement.querySelector("input.firstName").value;
        this._newProfile.email = this._mainElement.querySelector("input.email").value;
        this._newProfile.id = this._profileId
        this._newProfile.accountId = this._accountId

        await this.updateProfile()
        await this.updateAccount()
        await this.updateProfilePicture()

        location.hash = "#/";
    }

    async updateAccount() {
        await fetch(
            `http://localhost:8081/account/${this._accountId}`,
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(this._newAccount)
            });
    }

    async updateProfilePicture(){
        await fetch(`http://localhost:8081/profile/${this._profileId}/updateImage`,
            {
                method: 'PUT',
                body: this._formData
            })
    }

    async updateProfile() {
        await fetch(
            `http://localhost:8081/profile/${this._profileId}`,
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(this._newProfile)
            });
    }

    async loadSingleAccount(accountId) {
        let response = await fetch(
            `http://localhost:8081/account/getAccountById/${accountId}`,
            {
                method: `GET`
            });
        return await response.json();
    }

    async loadSingleProfile(profileId) {
        let response = await fetch(
            `http://localhost:8081/profile/${profileId}`,
            {
                method: `GET`
            });
        return await response.json();
    }
};
