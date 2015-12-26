"use strict";

export var openssl: string = "/usr/local/Cellar/openssl/1.0.2e/bin/openssl";
export var curl: string = "curl";

export interface TimestampProvider {
    /**
     * A name for the provider so we can identify it later on the cmdline. Will also be appended
     * as filename suffix by default, i.e:
     *
     *     filename.providername.tsq
     *     filename.providername.tsr
     *
     * Should thus be lowercase and contain no spaces or upper ASCII symbols.
     */
    name: string;

    /**
     * The http(s) URL to the timestamping service.
     */
    tsEndpoint: string;

    /**
     * Main URL to the service provider with details about the service, like costs and so forth
     */
    documentationUrl?: string;

    /**
     * A https (!) URL to a certificate chain that can be used to verify the timestamp in PEM format.
     */
    certificateChainUrl?: string;

    /**
     * A link to a human readable website / information about the certificate chain or a description
     * for end users how verification/certificate obtaining can be performed.
     * @type {[type]}
     */
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
