"use strict";

export var openssl: string = "/usr/local/Cellar/openssl/1.0.2e/bin/openssl";
export var curl: string = "curl";

export interface TimestampProvider {
    name: string;
    tsEndpoint: string;
    documentationUrl?: string;
    certificateChainUrl?: string;
    certificateChainHintUrl?: string;
}

export class DfnProvider implements TimestampProvider {
    name = "DFN";
    tsEndpoint = "http://zeitstempel.dfn.de";
    documentationUrl = "https://www.pki.dfn.de/zeitstempeldienst/"
    certificatechainHintUrl = "https://pki.pca.dfn.de/global-services-ca/cgi-bin/pub/pki?cmd=getStaticPage;name=index;id=2&RA_ID=0";
    certificateChainUrl = "https://pki.pca.dfn.de/global-services-ca/pub/cacert/chain.txt";
}

export class SwissSignProvider implements TimestampProvider {
    name = "SwissSign";
    tsEndpoint = "http://tsa.swisssign.net";
}
