"use strict";

import Page from "../page.js";

/**
 * Klasse PageList: Stellt die Listenübersicht zur Verfügung
 */
export default class PageList extends Page {
    constructor(app) {
        super(app, "page-list/page-list.html");
        this._emptyMessageElement = null;
    }

    async init() {
        await super.init();

        this._title = "Übersicht";

        let data = await this.getAllProfiles();
        this._emptyMessageElement = this._mainElement.querySelector(".empty-placeholder");

        if (data.length) {
            this._emptyMessageElement.classList.add("hidden");
        }

        let olElement = this._mainElement.querySelector("ol");

        let templateElement = this._mainElement.querySelector(".list-entry");
        let templateHtml = templateElement.outerHTML;
        templateElement.remove();

        for (let index in data) {
            let dataset = data[index];
            let html = templateHtml;

            html = html.replace("$surname$", dataset.lastName);
            html = html.replace("$forename$", dataset.firstName);
            html = html.replace("$email$", dataset.email);

            let dummyElement = document.createElement("div");
            dummyElement.innerHTML = html;
            let liElement = dummyElement.firstElementChild;
            liElement.remove();
            olElement.appendChild(liElement);


            const response = await fetch(`http://localhost:8081/profile/showImage/${dataset.id}`)
            if (response.status === 200) {
                console.log(response)
                const responseBody = await response.json()
                console.log(responseBody)
                const base64Data = responseBody.picByte;
                const image = 'data: image/ jpeg; base64,' + base64Data;
                console.log(image)
                if (image) {
                    liElement.querySelector("#profileImage").src = image
                }
            }
            liElement.querySelector(".action.edit").addEventListener("click", () => location.hash = `#/edit/${dataset.id}`);
            liElement.querySelector(".action.delete").addEventListener("click", () => {
                this._askDelete(dataset.accountId)
            });
        }
    }

    async getAllProfiles() {
        let response = await fetch("http://localhost:8081/profile/getAllProfiles");
        return await response.json();
    }


    async fetchPicture(dataset) {
        const response = fetch(`http://localhost:8081/profile/showImage/${dataset.id}`)
        return await response
    }


    async _askDelete(accountId) {
        let answer = confirm("Soll der ausgewählte Account wirklich gelöscht werden?");
        if (!answer) return;

        console.log(localStorage.getItem("globalID"))

        try {
            await fetch(
                `http://localhost:8081/account/deleteEverythingByAccountID/${accountId}`,
                {
                    method: `DELETE`
                });

        } catch (ex) {
            console.log(ex);
        }
        location.reload()
    }
}



