const BIB_FILE = "assets/bib/publications.bib";

let publications = [];

window.addEventListener("DOMContentLoaded", loadBibliography);

async function loadBibliography() {

    const response = await fetch(BIB_FILE);

    const bib = await response.text();

    publications = parseBibtex(bib);

    publications.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

    display(publications);

    document
        .getElementById("search")
        .addEventListener("input", filterPublications);

    document
        .getElementById("typeFilter")
        .addEventListener("change", filterPublications);

}


function filterPublications() {

    const search =
        document.getElementById("search")
            .value
            .toLowerCase();

    const type =
        document.getElementById("typeFilter").value;

    const list = publications.filter(pub => {

        const text =
            JSON.stringify(pub).toLowerCase();

        const okSearch =
            text.includes(search);

        const okType =
            type === "all" || pub.type === type;

        return okSearch && okType;

    });

    display(list);

}


function display(list) {

    const container =
        document.getElementById("publications");

    container.innerHTML = "";

    document.getElementById("counter").innerHTML =
        `${list.length} publication(s)`;

    list.forEach(pub => {

        const div =
            document.createElement("div");

        div.className = "publication";

        div.innerHTML = renderPublication(pub);

        container.appendChild(div);

    });

}


function renderPublication(pub) {

    let authors = pub.author || "";

    authors = authors.replace(
        /Eric Savin|Éric Savin/gi,
        "<strong>Éric Savin</strong>"
    );

    let html = "";

    html += `<div class="title">${pub.title || ""}</div>`;

    html += `<div class="authors">${authors}</div>`;

    html += `<div class="journal">`;

    if (pub.journal)
        html += pub.journal;

    if (pub.booktitle)
        html += pub.booktitle;

    if (pub.publisher)
        html += pub.publisher;

    if (pub.year)
        html += ` (${pub.year})`;

    html += `</div>`;

    html += `<div class="links">`;

    if (pub.doi) {

        html +=
            `<a href="https://doi.org/${pub.doi}" target="_blank">
            DOI
            </a>`;

    }

    if (pub.url) {

        html +=
            `<a href="${pub.url}" target="_blank">
            Link
            </a>`;

    }

    if (pub.pdf) {

        html +=
            `<a href="${pub.pdf}" target="_blank">
            PDF
            </a>`;

    }

    html += "</div>";

    return html;

}


function parseBibtex(text) {

    const entries = [];

    const blocks =
        text.split(/\n(?=@)/);

    blocks.forEach(block => {

        if (!block.trim())
            return;

        const typeMatch =
            block.match(/^@(\w+)/);

        if (!typeMatch)
            return;

        const pub = {};

        pub.type =
            typeMatch[1].toLowerCase();

        const regex =
            /(\w+)\s*=\s*\{([\s\S]*?)\}\s*,?/g;

        let m;

        while ((m = regex.exec(block)) !== null) {

            pub[m[1].toLowerCase()] =
                m[2]
                    .replace(/\n/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

        }

        entries.push(pub);

    });

    return entries;

}
