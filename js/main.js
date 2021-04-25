const selectSemester = (semester) => {
    for (let element of document.getElementsByClassName('semester')) {
        element.classList.remove('selected');
    }
    document.getElementById('semester-' + semester).classList.add('selected');
}
const selectReason = (reason) => {
    for (let element of document.getElementsByClassName('reason')) {
        element.classList.remove('selected');
    }
    document.getElementById('reason-' + reason).classList.add('selected');
}
const getSelectedSemester = () => {
    for (let element of document.getElementsByClassName('semester')) {
        if (element.classList.contains('selected')) {
            return element.id.substr(9);
        }
    }
}
const getSelectedReason = () => {
    for (let element of document.getElementsByClassName('reason')) {
        if (element.classList.contains('selected')) {
            return element.id.substr(7);
        }
    }
}

const acceptableEmailString = (email) => {
    return email.indexOf('@') > 0
        && email.indexOf('@') < (email.length - 1)
        && email.indexOf(' ') === -1;
}

class ValidationError extends Error {
}

function collectConfig() {
    const semester = getSelectedSemester();
    if (!semester) {
        throw new ValidationError('Bitte wähle ein Semester aus');
    }
    const reason = getSelectedReason();
    if (!reason) {
        throw new ValidationError('Bitte wähle einen Antragsgrund aus');
    }

    const reasonOtherText = document.getElementById('reason-other-text').value;
    if (reason === 'other' && !reasonOtherText) {
        throw new ValidationError('Bitte beschreibe den sonstigen Grund, den du ausgewählt hast');
    }

    const name = document.getElementById('input-name').value.trim();
    if (!name) {
        throw new ValidationError('Bitte gib deinen Namen ein');
    }
    const email = document.getElementById('input-email').value.trim();
    if (!email) {
        throw new ValidationError('Bitte gib deine E-Mail-Adresse ein');
    }
    if (!acceptableEmailString(email)) {
        throw new ValidationError('Dies sieht nicht nach einer funktionierenden E-Mail-Adresse aus');
    }
    const address = document.getElementById('input-address').value;
    if (!address) {
        throw new ValidationError('Bitte gib deine Adresse ein');
    }
    const sendDecisionToAddress = document.getElementById('input-send-decision-to-address').checked;
    const bankName = document.getElementById('input-bank-name').value;
    if (!bankName) {
        throw new ValidationError('Bitte gib den Namen der Person ein, der das Bankkonto gehört');
    }
    const iban = document.getElementById('input-iban').value.trim();
    if (!iban) {
        throw new ValidationError('Bitte gib deine IBAN ein');
    }
    const bic = document.getElementById('input-bic').value.trim();
    if (!bic) {
        throw new ValidationError('Bitte gib deine BIC ein');
    }

    return {semester, reason, reasonOtherText, name, email, address, sendDecisionToAddress, bankName, iban, bic};
}

const semesterToString = (semester) => {
    const type = semester.substr(0, 4);
    const year = parseInt(semester.substr(5));
    const remainder = year % 100;
    if (type === 'sose') {
        return `Sommersemester ${year}`;
    } else {
        return `Wintersemester ${year}/${remainder + 1}`;
    }
}

const reasonToString = (reason) => {
    switch (reason) {
        case 'verspaetete-immatrikulation':
            return 'Verspäteter Immatrikulation/Promotionsbeginn';
        case 'exmatrikulation':
            return 'Exmatrikulation';
        case 'beduerftigkeit':
            return 'Bedürftigkeit';
        case 'schwerbehinderung':
            return 'Schwerbehinderung';
        case 'vrs-jobticket-vorhanden':
            return 'eines bereits vorhandenen VRS-Jobtickets';
        case 'aav-studienbedingt':
            return 'studienbedingter Aufenthalt außerhalb des Vertragsgebietes (min. 3 Monate)';
        case 'aav-meisterschaft':
            return 'Aufenthalt außerhalb des Vertragsgebietes wegen Meisterschaft';
        case 'aav-promotion':
            return 'Abschlussarbeit (Fertigstellung außerhalb des Vertragsgebietes)';
        case 'aav-abschlussarbeit':
            return 'Promotion ohne Anwesenheit im Vertragsgebiet';
        case 'aav-familiaere-gruende':
            return 'Aufenthalt außerhalb des Vertragsgebietes wegen dringender familiärer Gründe';
        case 'other':
            return 'Sonstiger Grund';
    }
}

const formatIban = (iban) => {
    const ibanWithoutSpaces = iban.replaceAll(/\s/g, '');
    const blocks = ibanWithoutSpaces.match(/.{1,4}/g);
    return blocks.join('\u00a0');
}

const documentsToProvide = (config) => {
    const lines = [
        [{text: 'Bitte folgende Nachweise beifügen:', style: 'prooftablebold'}],
        [{
            text: [{text: '\uf0c8 ', style: 'icon'}, 'Kopie eines gültigen Personalausweises oder Reisepasses'],
            style: 'prooftable'
        }],
    ];

    if (config.reason !== 'exmatrikulation') {
        lines.push([{
            text: [{text: '\uf0c8 ', style: 'icon'}, 'Kopie ',
                {
                    text: 'beider Seiten',
                    style: 'bold'
                },
                ' des Studierendenausweises für das Antragssemester',
            ],
            style: 'prooftable',
        }]);
        lines.push([{
            text: '» Studienbescheinigung genügt nicht!', style: 'prooftablebold'
        }]);
    }

    switch (config.reason) {
        case 'verspaetete-immatrikulation':
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'Immatrikulationsbescheinigung'],
                style: 'prooftable'
            }]);
            break;
        case 'exmatrikulation':
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'Exmatrikulationsbescheinigung'],
                style: 'prooftable'
            }]);
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'Nachweis über Zahlung des Semesterbeitrages'],
                style: 'prooftable'
            }]);
            break;
        case 'beduerftigkeit':
            lines.push([{
                text: [{
                    text: '\uf0c8 ',
                    style: 'icon'
                }, 'Belege über die Einkommens- und Vermögensverhältnisse'], style: 'prooftable'
            }]);
            lines.push([{
                text: [{
                    text: '\uf0c8 ',
                    style: 'icon'
                }, 'Belege über Miet- und Krankenversicherungskosten etc.'], style: 'prooftable'
            }]);
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Formular 2'], style: 'prooftablebold'}]);
            break;
        case 'schwerbehinderung':
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'Kopie eines amtlichen Schwerbehindertenausweises'],
                style: 'prooftable'
            }]);
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'Kopie der Wertmarken/ärztliches Attest'],
                style: 'prooftable'
            }]);
            break;
        case 'vrs-jobticket-vorhanden':
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Bescheinigung des VRS'], style: 'prooftable'}]);
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Kopie des Jobtickets'], style: 'prooftable'}]);
            break;
        case 'aav-studienbedingt':
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'Beleg über den Aufenthalt (min. 3 Monate)'],
                style: 'prooftable'
            }]);
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Formular 3'], style: 'prooftablebold'}]);
            break;
        case 'aav-meisterschaft':
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'Teilnahmebestätigung (z.B. Anmeldungsbestätigung)\n', {
                    text: 'Die Teilnahmebescheinigung muss das Datum ihrer Übermittlung an die Antragstellerin erkennen lassen',
                    style: {italics: true}
                }],
                style: 'prooftable',
            }]);
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Formular 4'], style: 'prooftablebold'}]);
            lines.push([{
                text: [{
                    text: '\uf0c8 ',
                    style: 'icon'
                }, 'Teilnahmeurkunde o.ä. (z.B. Siegerurkunde) (unaufgefordert nachzureichen)'],
                style: 'prooftable',
            }]);
            break;
        case 'aav-promotion':
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Formular 5'], style: 'prooftablebold'}]);
            break;
        case 'aav-abschlussarbeit':
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Formular 6'], style: 'prooftablebold'}]);
            break;
        case 'aav-familiaere-gruende':
            lines.push([{text: [{text: '\uf0c8 ', style: 'icon'}, 'Nachweis des Grundes'], style: 'prooftable'}]);
            break;
        case 'other':
            lines.push([{
                text: [{text: '\uf0c8 ', style: 'icon'}, 'geeignete Nachweise für den sonstigen Grund'],
                style: 'prooftable'
            }]);
            break;
    }

    return lines;
}

const createDocDefinition = (config) => {
    return {
        pageSize: 'A4',
        pageMargins: [40, 138, 40, 60],
        header: {
            margin: [40, 40, 40, 0],
            stack: [
                {image: 'toplogo', fit: [150, 150], style: 'logo'},
                {
                    text: 'Ausschuss für das Semesterticket, c/o AStA Bonn, Nassestr. 11, 53113 Bonn, Tel. 73-5874, stre@asta.uni-bonn.de',
                    style: 'subtitle'
                },
            ]
        },
        content: [
            {text: 'Antrag auf Erstattung des Mobilitätsbeitrages (Semesterticket)', style: 'title'},
            {
                width: '*', table: {
                    widths: ['*'],
                    body: [
                        [{
                            text: 'Antragsfristen: 10. Mai für Sommersemester/ 10. November für Wintersemester',
                            style: 'subtitle'
                        }],
                    ]
                },
                layout: {
                    hLineWidth: function () {
                        return 1;
                    },
                    vLineWidth: function () {
                        return 0;
                    },
                }
            },
            {text: '\u00a0', style: 'spacer5'},
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            {text: 'Name', style: 'label'},
                            {text: config.name, style: 'addressblockvalue'},
                            {text: 'Anschrift', style: 'label'},
                            {text: config.address, style: 'addressblockvalue'},
                            {text: 'E-Mail-Adresse', style: 'label'},
                            {text: config.email, style: 'addressblockvalue'},
                        ]
                    },
                    {
                        width: '*', table: {
                            widths: ['*'],
                            body: [
                                ['Bearbeitungsnummer:'],
                                [{text: '\u00a0', style: {fontSize: 20}}],
                                [{text: '(wird vom Ausschuss ausgefüllt)', style: {fontSize: 8}}]
                            ]
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return i === 0 || i === node.table.body.length ? 1 : 0;
                            },
                            vLineWidth: function () {
                                return 1;
                            },
                            paddingLeft: function () {
                                return 8;
                            },
                            paddingRight: function () {
                                return 8
                            },
                            paddingTop: function () {
                                return 8;
                            },
                            paddingBottom: function () {
                                return 8;
                            },
                        }
                    },

                ]
            },
            {
                columns: [{
                    width: 'auto', stack: [
                        {
                            text: ['Hiermit beantrage ich die Erstattung der Mobilitätskosten für das ', {
                                text: semesterToString(config.semester),
                                style: {bold: true}
                            }],
                            style: 'requestline',
                        },
                        {
                            text: ['Antragsgrund: ', {
                                text: reasonToString(config.reason),
                                style: {bold: true}
                            }],
                            style: 'reasonline',
                        },
                        {
                            text: config.reason === 'other' ? config.reasonOtherText : '',
                            style: 'reasonother',
                        },
                        {
                            text: config.sendDecisionToAddress ? [{
                                text: '\uf058 ',
                                style: 'icon'
                            }, 'Bitten senden Sie mir einen schriftlichen Bescheid an meine Meldeadresse.'] : '',
                            style: 'senddecisiontoaddressline'
                        },
                        {text: 'Meine Bankverbindung', style: ''},
                        {
                            width: '*', table: {
                                widths: ['auto', '*'],
                                body: [
                                    ['Kontoinhaber*in:', config.bankName],
                                    ['IBAN:', formatIban(config.iban)],
                                    ['BIC:', config.bic],
                                ]
                            },
                            layout: {
                                hLineWidth: function () {
                                    return 0;
                                },
                                vLineWidth: function () {
                                    return 0;
                                },
                            }
                        },
                    ]
                },
                ]
            },
            {text: '\u00a0', style: 'spacer5'},
            {
                width: '*', table: {
                    widths: ['*'],
                    body: documentsToProvide(config),
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return i === 0 || i === node.table.body.length ? 1 : 0;
                    },
                    vLineWidth: function () {
                        return 1;
                    },
                    paddingLeft: function () {
                        return 8;
                    },
                    paddingRight: function () {
                        return 8
                    },
                    paddingTop: function (i, node) {
                        return i === 0 ? 8 : 1;
                    },
                    paddingBottom: function (i, node) {
                        return i === node.table.body.length - 1 ? 8 : 1;
                    },
                },
            },
            {
                text: 'Ich versichere hiermit, dass ich die Angaben in diesem Antrag und den beigefügten Anlagen nach bestem Wissen und Gewissen vollständig und wahrheitsgemäß gemacht habe, und dass ich meine Einschreibung bzw. Rückmeldung nicht vor Beginn der Vorlesungszeit zurückgenommen habe. Sollte ich die Einschreibung/Rückmeldung vor Beginn der Vorlesungszeit zurücknehmen, werde ich dies dem Ausschuss für das Semesterticket unverzüglich mitteilen. Mir ist bekannt, dass bewusst unrichtige oder unvollständige Angaben zur Ablehnung und Rückforderung sowie zu zivil- oder strafrechtlichen Konsequenzen führen können.',
                style: 'declaration1'
            },
            {
                text: 'Die Hinweise zur Antragstellung und zum Datenschutz habe ich zur Kenntnis genommen.',
                style: 'declaration2'
            },
            {
                columns: [
                    {
                        width: '*', table: {
                            widths: ['*'],
                            body: [
                                ['Ort, Datum'],
                            ]
                        },
                        layout: {
                            hLineWidth: function (i) {
                                return i === 0 ? 2 : 0;
                            },
                            vLineWidth: function () {
                                return 0;
                            },
                        }
                    },
                    {width: '*', text: ''},
                    {
                        width: '*', table: {
                            widths: ['*'],
                            body: [
                                ['Unterschrift'],
                            ]
                        },
                        layout: {
                            hLineWidth: function (i) {
                                return i === 0 ? 2 : 0;
                            },
                            vLineWidth: function () {
                                return 0;
                            },
                        }
                    },
                ]
            },


        ],
        styles: {
            spacer5: {
                fontSize: 5,
            },
            bold: {
                bold: true,
            },
            logo: {
                alignment: 'center',
                margin: [0, 0, 0, 10],
            },
            title: {
                fontSize: 16,
                bold: true,
                alignment: 'center',
                margin: [0, 5, 0, 10],
            },
            subtitle: {
                fontSize: 10,
                alignment: 'center',
                margin: [0, 1, 0, 1],
            },
            label: {
                fontSize: 8,
                margin: [0, 1, 0, 0],
            },
            addressblockvalue: {
                fontSize: 12,
                margin: [0, 0, 0, 5],
            },
            requestline: {
                fontSize: 12,
                margin: [0, 10, 0, 5],
            },
            reasonline: {
                fontSize: 12,
                margin: [0, 0, 0, 10],
            },
            reasonother: {
                fontSize: 12,
                italics: true,
                margin: [0, 0, 0, 10],
            },
            senddecisiontoaddressline: {
                fontSize: 12,
                margin: [0, 0, 0, 10],
            },
            prooftable: {
                fontSize: 10,
            },
            prooftablebold: {
                fontSize: 10,
                bold: true,
            },
            declaration1: {
                fontSize: 10,
                margin: [0, 20, 0, 5],
            },
            declaration2: {
                fontSize: 10,
                margin: [0, 0, 0, 50],
            },
            icon: {font: 'FontAwesome'},
        },
        images: {
            toplogo: TOPLOGO,
        }
    };
}

const createApplication = () => {
    try {
        const config = collectConfig();
        const docDefinition = createDocDefinition(config);

        pdfMake.fonts = {
            Roboto: {
                normal: 'Roboto-Regular.ttf',
                bold: 'Roboto-Medium.ttf',
                italics: 'Roboto-Italic.ttf',
                bolditalics: 'Roboto-MediumItalic.ttf'
            },
            FontAwesome: {
                normal: 'FontAwesome.otf',
                bold: 'FontAwesome.otf',
                italics: 'FontAwesome.otf',
                bolditalics: 'FontAwesome.otf'
            },
        };
        pdfMake.createPdf(docDefinition).open();
    } catch (validationError) {
        alert(validationError.message);
    }

}

const semesterSelector = (semester) => {
    return `<div class="col-sm-6 col-md-4">
            <div id="semester-${semester}" class="ms-card ms-border semester"
                 onclick="selectSemester('${semester}')">
                <div class="ms-card-content">
                    ${semesterToString(semester)}
                </div>
            </div>
        </div>`;
}

const getSelectableSemesters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const june = 5;
    if (month > june) {
        return [`sose-${year}`, `wise-${year}`];
    } else {
        return [`wise-${year - 1}`, `sose-${year}`];
    }
}

const createSemesterSelectors = () => {
    const semesters = getSelectableSemesters();
    const semesterSelection = document.getElementById('semester-selection');
    semesterSelection.innerHTML = '';
    for (let semester of semesters) {
        semesterSelection.innerHTML += semesterSelector(semester);
    }
}

const init = () => {
    createSemesterSelectors();
}

init();

const TOPLOGO = `data:image/png;base64,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
DC9SPSPj++vGcsjkQKbUjQfTvVbAYUiE1fsXP+wSVs5Nu/JdULAwUSjARYjoEyeRm0UKdH8NB4ZJ
qFGQws5CvwkK8OTwl1Z6kVx4p0gE5f4PjAN1pPtgpEkEM60ugwYaYhYAfSC7Z3gVaYKWMCw2zYyC
8W9HHQTszAkB3Z/IUzk4Lkt345dxS13P1ILUOF/tB3A8acCVMHfv/g8XpKnbBzaEUQAAAwBQTFRF
////goKC/f39CwsLAwMD/v7/+/v7AAAAAQEBAgICjo6OBQUFGBgZMDAwVVVVSEhJCQkJISEh6urq
urq6bGxsl5eXwsLCzMzMNDIznJycDQ4OOzw8ZWVlLCssoqKjQ0JCFBQU5ubn9vvq0tLROTg6e3t7
Pz8/tbW0/f76BwcH+/fm+///EREQ+fn46P7+4uHhk5OT9v77/f3zHx0f19jXb29w///8/vrfsbKy
JicopqaloJ+f8fz09fX1hYaGHBsc/vzoNjY03/39q6yrIyQk/PPgfX59v76+1NTV29vc3d7e8vPw
8f7/4+TjUVFS//34gYGBdHNz7+/u8e7i+/3u0M/PmpqZd3d4/PfKioqJ++rUWVdayMnK4Pvus7zH
8Pz5XFxdxsbFQjc5x+z1++7H+f3hLjM3DhcwYF9e9/rY9fLZ6fvy/vPZOjAo8eHMNDdFKzFCuLa3
5v339d+/kp+vPDxH1uLo8Pjio416w9PY0N3fkZKO/vvV497Fb4Ok6Prr2+3slZWU4tC0yuDoc2Vd
HiE5TUM6inhvycS4utPYpJyMpbfAcnmLudrn7ObWkIl6sa2t8uzNUU9NHg4I9d2m29fNk52iuaWU
RU9Yy/z81Mm00+v01f7+h5We2vX5a4ORornVTE1L/Pfx6O7g/PW9WmhwKSMc286ksd70y9TfYW97
XVZQPUdcy8GnGCVFcmNGwrGtrqWTf42uxKaD6PP0Tmh67Nq0N0ZRLT9ZVkJEz7KSBQoRPBgSub68
5e3yfoaOn8rhgm9hNCIbtKiFUEJTqs7kw9LDVl9sx9PQ49/UYlxpsLCjwLSflau/CQkZgI2Z0sfF
o6atpsfQ2tHAUDYscmBxt8vT6/f8inxhYVI6mHlnKxMMOlFszbm1TF9fsqCdZ1VL48CaBgonvcXO
f3xtUFNvCBUiIS0zWikZgKK3KiMwWICdFQkHg2RIrIdsdE82j8XShaCmZHx41Pjwem2AT2SI5O3T
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
ypV+BxLVYW6vhNy3AAAAAElFTkSuQmCC`
