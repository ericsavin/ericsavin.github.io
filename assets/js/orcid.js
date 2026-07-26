const ORCID = "0000-0002-3767-0281";

const API =
`https://pub.orcid.org/v3.0/${ORCID}/works`;

async function loadPublications(){

    const response = await fetch(API,{
        headers:{
            Accept:"application/json"
        }
    });

    const data = await response.json();

    const works = data.group;

    const container = document.getElementById("publications");

    document.getElementById("loading").remove();

    let publications=[];

    for(const work of works){

        const summary=work["work-summary"][0];

        const putCode=summary["put-code"];

        const detailResponse=await fetch(
        `https://pub.orcid.org/v3.0/${ORCID}/work/${putCode}`,
        {
            headers:{Accept:"application/json"}
        });

        const detail=await detailResponse.json();

        let title="Untitled";

        if(detail.title &&
           detail.title.title){

            title=detail.title.title.value;

        }

        let year="Unknown";

        if(detail["publication-date"] &&
           detail["publication-date"].year){

            year=detail["publication-date"].year.value;

        }

        let journal="";

        if(detail["journal-title"]){

            journal=detail["journal-title"].value;

        }

        let doi="";

        if(detail["external-ids"]){

            const ids=detail["external-ids"]["external-id"];

            for(const id of ids){

                if(id["external-id-type"]==="doi"){

                    doi=id["external-id-value"];

                }

            }

        }

        publications.push({
            year,
            title,
            journal,
            doi
        });

    }

    publications.sort((a,b)=>b.year.localeCompare(a.year));

    let currentYear="";

    publications.forEach(pub=>{

        if(pub.year!==currentYear){

            currentYear=pub.year;

            container.innerHTML+=`
            <h2 class="year">${currentYear}</h2>`;
        }

        container.innerHTML+=`

        <div class="pub">

            <div class="title">
                ${pub.title}
            </div>

            <div class="meta">
                ${pub.journal}
            </div>

            <div class="links">

            ${
                pub.doi
                ?
                `<a href="https://doi.org/${pub.doi}" target="_blank">
                DOI
                </a>`
                :
                ""
            }

            <a href="https://orcid.org/${ORCID}" target="_blank">
            ORCID
            </a>

            </div>

        </div>

        `;

    });

}

loadPublications();
