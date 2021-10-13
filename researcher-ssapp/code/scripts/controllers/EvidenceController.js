const {WebcController} = WebCardinal.controllers;
import IotAdaptorApi from "../services/IotAdaptorApi.js";
import CommunicationService from "../services/CommunicationService.js";
import NewEvidenceService from "../services/newEvidenceService.js";
import {evidenceModelHL7} from "../models/HL7/EvidenceModel.js";
import EvidenceConfigService from "../services/EvidenceConfigService.js";

const AddEvidenceViewModel = {
    name: {
        name: 'name',
        label: "Name",
        placeholder: 'Name',
        required: true,
        readOnly: false,
        value: ''
    },
    organization: {
        name: 'organization',
        label: "Organization",
        placeholder: 'Organization',
        required: true,
        readOnly: false,
        value: ''
    },
    email: {
        name: 'email',
        label: "Email",
        placeholder: 'Email',
        required: true,
        readOnly: false,
        value: ''
    },
    title: {
        name: 'title',
        label: "Title",
        placeholder: 'Title',
        required: true,
        readOnly: false,
        value: ''
    },
    subtitle: {
        name: 'subtitile',
        label: "Subtitle",
        placeholder: 'Subtitle',
        required: true,
        readOnly: false,
        value: ''
    },
    version: {
        name: 'version',
        label: "Version",
        placeholder: 'Version',
        required: true,
        readOnly: false,
        value: ''
    },
    description: {
        name: 'description',
        label: "Description",
        placeholder: 'Description of the evidence',
        required: true,
        value: ''
    },
    saveButton: {
        name: 'saveButton',
        label: "Save",
        required: true,
        readOnly: false,
        value: ''
    },
    gobackButton: {
        name: 'Go Back Button',
        label: "Back",
        required: true,
        readOnly: false,
        value: ''
    },
    status: {
        label: "Status",
        required: true,
        options: [{
                label: "Draft",
                value: 'draft'
            },
            {
                label: "Active",
                value: 'active'
            },
            {
                label: "Retired",
                value: 'retired'
            },
            {
                label: "Unknown",
                value: 'unknown'
            }

        ],
        value: ''
    },
    topics: {
        label: "Topics",
        required: true,
        options: [{
                label: "Education",
                value: 'Education'
            },
            {
                label: "Treatment",
                value: 'Treatment'
            },
            {
                label: "Assessment",
                value: 'Assessment'
            }
        ],
        value: ''
    },
    exposureBackground: {
        label: "Exposure Background",
        required: true,
        options: [{
                label: "Exposure Background 1",
                value: 'Exposure Background 1'
            },
            {
                label: "Exposure Background 2",
                value: 'Exposure Background 2'
            },
            {
                label: "Exposure Background 3",
                value: 'Exposure Background 3'
            },


        ],
        value: ''
    }
}
let evidenceData = {
    name: "",
    contact: [],
    title: "",
    subtitle: "",
    version: "",
    description: "",
    status: "",
    topics: "",
    exposureBackground: ""
};

var sReadSSI;
var evidenceConfigDSU;

export default class EvidenceController extends WebcController {
    constructor(element, history) {

        super(element, history);
        this.model = AddEvidenceViewModel;
        this._attachHandlerEvidenceP1();
        this._attachHandlerEvidenceP2();
        this._attachHandlerEvidenceP3();
        this._attachHandlerEvidenceBackMenu();
        this._attachHandlerEvidence();
        this._attachHandlerEvidenceList();
        this._attachHandlerHome();
        this._attachHandlerUpdateEvidence();

        this.EvidenceConfigService = new EvidenceConfigService(this.DSUStorage);
        const me = this;
        me.EvidenceConfigService.getEvidenceConfig(function(error, data) {
            if (data.length === 0) {
                me.IotAdaptorApi.createEvidenceDsu({}, (err, evidence) => {
                    if (err) {
                        return console.log(err);
                    }
                    me.EvidenceConfigService.saveEvidenceConfig(evidence, (err, data) => {
                        if (err) {
                            return console.log(err);
                        }
                        me.evidenceConfigDSU = data[0];
                    });
                });
            } else {
                me.evidenceConfigDSU = data[0];
            }

            console.log("Evidence DSU Config", me.evidenceConfigDSU);
        });

    }

    _attachHandlerHome() {
        this.on('evidence:home', (event) => {
            evidenceData = {
                name: "",
                contact: [],
                title: "",
                subtitle: "",
                version: "",
                description: "",
                status: "",
                topics: "",
                exposureBackground: "",
            };
            this.navigateToPageTag('home');
        });
    }
    _attachHandlerEvidence() {
        this.on('evidence:evidence', (event) => {
            this.navigateToPageTag('evidence');
        });
    }
    _attachHandlerEvidenceList() {
        this.on('evidence:list', (event) => {

            this.EvidenceConfigService = new EvidenceConfigService(this.DSUStorage);

            const me = this;
            
                console.log("Evidence DSU Config", me.evidenceConfigDSU);

                var allEvidences;
                console.log("*********************************");
                console.log(me.evidenceConfigDSU.sReadSSI);
                me.IotAdaptorApi = new IotAdaptorApi();
                me.IotAdaptorApi.searchEvidence(me.evidenceConfigDSU.sReadSSI, (err, evidence) => {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("*********************************");
                    // console.log (evidence)
                    allEvidences = evidence;
                    console.log(allEvidences)
                    me.navigateToPageTag('evidence-list', allEvidences);

            });

        });
    }
    _attachHandlerEvidenceP1() {
        this.on('evidence:add-evidence-p1', (event) => {
            this.navigateToPageTag('add-evidence-p1');
        });
    }
    _attachHandlerEvidenceP2() {
        this.on('evidence:add-evidence-p2', (event) => {
            evidenceData.name = this.model.name.value;
            evidenceData.contact = [{
                "name": "Name of the Publisher(Organization/individual)",
                "telecom": [{
                    "system": "email",
                    "value": this.model.email.value
                }]
            }];
            evidenceData.publisher = this.model.organization.value;
            this.navigateToPageTag('add-evidence-p2');
        });
    }
    _attachHandlerEvidenceP3() {
        this.on('evidence:add-evidence-p3', (event) => {

            evidenceData.title = this.model.title.value;
            evidenceData.subtitle = this.model.subtitle.value;
            evidenceData.version = this.model.version.value;
            evidenceData.description = this.model.description.value;
            evidenceData.topics = this.model.topics.value;
            evidenceData.status = this.model.status.value;
            evidenceData.exposureBackground = this.model.exposureBackground.value;
            // console.log(this.model.description.value);
            this.navigateToPageTag('add-evidence-p3', {
                allData: evidenceData
            });
        });
    }
    _attachHandlerUpdateEvidence() {
        this.on('evidence:update-evidence', (event) => {

            evidenceData.title = this.model.title.value;
            evidenceData.subtitle = this.model.subtitle.value;
            evidenceData.version = this.model.version.value;
            evidenceData.description = this.model.description.value;
            evidenceData.topics = this.model.topics.value;
            evidenceData.status = this.model.status.value;
            evidenceData.exposureBackground = this.model.exposureBackground.value;

            let initEvidence = JSON.parse(JSON.stringify(evidenceModelHL7));

            initEvidence.EvidenceName.value = this.model.name.value;
            initEvidence.EvidenceOrganization.value = this.model.organization.value;
            initEvidence.EvidenceEmail.value = this.model.email.value;

            initEvidence.EvidenceTitle.value = this.model.title.value;
            initEvidence.EvidenceSubtitle.value = this.model.subtitle.value;
            initEvidence.EvidenceVersion.value = this.model.version.value;
            initEvidence.EvidenceStatus.value = this.model.status.value;
            initEvidence.EvidenceTopics.value = this.model.topics.value;
            initEvidence.EvidenceExposureBackground.value = this.model.exposureBackground.value;
            initEvidence.EvidenceDescription.value = this.model.description.value;
            this.newEvidenceService = new NewEvidenceService(this.DSUStorage);
            this.newEvidenceService.saveNewEvidence(initEvidence, (err, data) => {
                if (err) {
                    return console.log(err);
                }
                this.model.dsuStatus = "DSU contract saved and sent to patient with keySSI: ".concat('', data.KeySSI.substr(data.KeySSI.length - 10));

                this.CommunicationService = CommunicationService.getInstance(CommunicationService.identities.IOT.RESEARCHER_IDENTITY);
                this.sendMessageToPatient('evidence-response', data.uid);
            });

            this.navigateToPageTag('add-evidence-p3', evidenceData);
        });
    }
   
    _attachHandlerEvidenceBackMenu() {
        this.on('evidence:back-to-menu', (event) => {
            evidenceData = {
                name: "",
                contact: [],
                title: "",
                subtitle: "",
                version: "",
                description: "",
                status: "",
                topics: "",
                exposureBackground: "",
            };
            this.navigateToPageTag('evidence');
        });
    }

    sendMessageToPatient(operation, ssi) {
        this.CommunicationService.sendMessage(CommunicationService.identities.IOT.PATIENT_IDENTITY, {
            operation: operation,
            ssi: ssi
        });
    }




}