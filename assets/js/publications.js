
/*
 * Publications renderer for GitHub Pages
 * Eric Savin
 *
 * Part 1:
 * BibTeX loading and parsing
 */

const BIB_FILE = "assets/bib/publications.bib";

let publications = [];


/*
 * Load bibliography
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadBibFile();

    }
);



async function loadBibFile() {

    try {

        const response = await fetch(BIB_FILE);

        if (!response.ok) {

            throw new Error(
                "Cannot load bibliography file"
            );

        }

        const bibText =
            await response.text();


        publications =
            parseBibtex(bibText);


        publications.sort(
            (a,b) =>
            Number(b.year || 0)
            -
            Number(a.year || 0)
        );


        initializePage();


    }
    catch(error) {

        console.error(error);

        document.getElementById(
            "publications"
        ).innerHTML =
        "<p>Unable to load publications.</p>";

    }

}



/*
 * BibTeX parser
 *
 * Returns:
 * [
 *   {
 *     type:"article",
 *     title:"...",
 *     author:"...",
 *     year:"2025"
 *   }
 * ]
 */


function parseBibtex(text) {


    const entries = [];

    let position = 0;


    while(position < text.length) {


        const start =
            text.indexOf("@", position);


        if(start === -1)
            break;


        const typeStart =
            start + 1;


        const brace =
            text.indexOf(
                "{",
                typeStart
            );


        if(brace === -1)
            break;


        const type =
            text
            .substring(
                typeStart,
                brace
            )
            .trim()
            .toLowerCase();



        let depth = 1;

        let end = brace + 1;


        while(
            end < text.length
            &&
            depth > 0
        ) {

            if(text[end] === "{")
                depth++;

            if(text[end] === "}")
                depth--;

            end++;

        }



        const body =
            text.substring(
                brace + 1,
                end - 1
            );



        const entry =
            parseEntry(
                type,
                body
            );


        if(entry)
            entries.push(entry);



        position = end;


    }


    return entries;

}



/*
 * Parse a single BibTeX entry
 */


function parseEntry(type, body) {


    const entry = {

        type:type

    };


    /*
     * Remove citation key
     */

    const firstComma =
        body.indexOf(",");


    if(firstComma !== -1) {

        body =
            body.substring(
                firstComma + 1
            );

    }



    let i = 0;


    while(i < body.length) {


        /*
         * skip spaces and commas
         */

        while(
            i < body.length
            &&
            (
                body[i] === ","
                ||
                /\s/.test(body[i])
            )
        ) {

            i++;

        }


        if(i >= body.length)
            break;



        const equal =
            body.indexOf(
                "=",
                i
            );


        if(equal === -1)
            break;



        const field =
            body
            .substring(
                i,
                equal
            )
            .trim()
            .toLowerCase();



        i = equal + 1;



        while(
            /\s/.test(body[i])
        ) {

            i++;

        }



        if(body[i] === "{") {


            const result =
                readBracedValue(
                    body,
                    i
                );


            entry[field] =
                cleanBibtex(
                    result.value
                );


            i =
                result.position;


        }
        else if(body[i] === "\"") {


            i++;

            const start = i;

            while(
                i < body.length
                &&
                body[i] !== "\""
            ) {

                i++;

            }


            entry[field] =
                cleanBibtex(
                    body.substring(
                        start,
                        i
                    )
                );


            i++;


        }
        else {


            const start = i;


            while(
                i < body.length
                &&
                body[i] !== ","
            ) {

                i++;

            }


            entry[field] =
                cleanBibtex(
                    body.substring(
                        start,
                        i
                    )
                );


        }


    }


    return entry;

}



/*
 * Read { ... } with nested braces
 */


function readBracedValue(text, start) {


    let depth = 0;

    let i = start;


    const begin = start + 1;



    while(i < text.length) {


        if(text[i] === "{")
            depth++;


        else if(text[i] === "}") {


            depth--;


            if(depth === 0) {

                return {

                    value:
                    text.substring(
                        begin,
                        i
                    ),

                    position:
                    i + 1

                };

            }

        }


        i++;

    }



    return {

        value:
        text.substring(begin),

        position:
        text.length

    };

}



/*
 * Convert BibTeX accents
 */

function cleanBibtex(value) {


    return value

    .replace(
        /\{\\'([A-Za-z])\}/g,
        "$1"
    )

    .replace(
        /\{\\"([A-Za-z])\}/g,
        "$1"
    )

    .replace(
        /\{\\`([A-Za-z])\}/g,
        "$1"
    )

    .replace(
        /\{\\~([A-Za-z])\}/g,
        "$1"
    )

    .replace(
        /\\&/g,
        "&"
    )

    .replace(
        /--/g,
        "–"
    )

    .replace(
        /\s+/g,
        " "
    )

    .trim();

}

/*
 * Publications renderer for GitHub Pages
 *
 * Part 2:
 * Rendering, search and filters
 */


/*
 * Initialize interface
 */

function initializePage() {


    displayPublications(publications);



    const search =
        document.getElementById("search");


    if(search) {

        search.addEventListener(
            "input",
            applyFilters
        );

    }



    const typeFilter =
        document.getElementById("typeFilter");


    if(typeFilter) {

        typeFilter.addEventListener(
            "change",
            applyFilters
        );

    }

}




/*
 * Apply search and type filters
 */

function applyFilters() {


    const searchValue =
        document
        .getElementById("search")
        .value
        .toLowerCase();



    const selectedType =
        document
        .getElementById("typeFilter")
        .value;



    const filtered =
        publications.filter(pub => {


            const text =
                Object.values(pub)
                .join(" ")
                .toLowerCase();



            const matchesSearch =
                text.includes(
                    searchValue
                );



            const matchesType =
                selectedType === "all"
                ||
                pub.type === selectedType;



            return matchesSearch
                &&
                matchesType;


        });



    displayPublications(filtered);

}





/*
 * Generate HTML list
 */

function displayPublications(list) {


    const container =
        document.getElementById(
            "publications"
        );


    if(!container)
        return;



    container.innerHTML = "";



    list.forEach(pub => {


        const article =
            document.createElement(
                "article"
            );


        article.className =
            "publication";



        article.innerHTML =
            renderPublication(pub);



        container.appendChild(
            article
        );


    });


}






/*
 * Render one publication
 */

function renderPublication(pub) {


    let html = "";



    html +=
    `
    <h2 class="publication-title">
        ${escapeHTML(pub.title || "")}
    </h2>
    `;



    html +=
    `
    <div class="authors">
        ${formatAuthors(pub.author || "")}
    </div>
    `;



    let metadata = [];



    if(pub.journal)
        metadata.push(pub.journal);



    if(pub.booktitle)
        metadata.push(pub.booktitle);



    if(pub.publisher)
        metadata.push(pub.publisher);



    if(pub.volume)
        metadata.push(
            "vol. " + pub.volume
        );



    if(pub.pages)
        metadata.push(
            "pp. " + pub.pages
        );



    if(pub.year)
        metadata.push(pub.year);



    html +=
    `
    <div class="metadata">
        ${metadata.join(", ")}
    </div>
    `;



    html += renderLinks(pub);



    return html;

}





/*
 * Highlight Eric Savin
 */

function formatAuthors(authors) {


    let escaped =
        escapeHTML(authors);



    escaped =
        escaped.replace(
            /Eric Savin/gi,
            "Éric Savin"
        );



    escaped =
        escaped.replace(
            /Éric Savin/gi,
            "Éric Savin"
        );



    return escaped;

}





/*
 * Generate links
 */

function renderLinks(pub) {


    let html =
        `<div class="links">`;



    if(pub.doi) {


        html +=
        `
        <a href="https://doi.org/${pub.doi}"
           target="_blank">
           DOI
        </a>
        `;

    }



    if(pub.url) {


        html +=
        `
        <a href="${pub.url}"
           target="_blank">
           Link
        </a>
        `;

    }



    if(pub.pdf) {


        html +=
        `
        <a href="${pub.pdf}"
           target="_blank">
           PDF
        </a>
        `;

    }



    if(pub.hal_id) {


        html +=
        `
        <a href="https://hal.science/${pub.hal_id}"
           target="_blank">
           HAL
        </a>
        `;

    }



    /*
     * arXiv detection
     */

    if(pub.url &&
       pub.url.includes("arxiv")) {


        html +=
        `
        <a href="${pub.url}"
           target="_blank">
           arXiv
        </a>
        `;

    }



    html += "</div>";



    return html;

}





/*
 * Protect HTML output
 */

function escapeHTML(value) {


    return value

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}

